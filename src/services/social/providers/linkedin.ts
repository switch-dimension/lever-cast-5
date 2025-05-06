import { BaseSocialProvider } from './base';
import { ISocialConnection, ISocialPost, SocialProvider, PostPublishResponse } from '@/types/social';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

interface LinkedInTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
}

interface LinkedInShareContent {
    shareCommentary: {
        text: string;
    };
    shareMediaCategory: 'NONE' | 'IMAGE';
    media?: Array<{
        status: string;
        originalUrl: string;
    }>;
}

export class LinkedInProvider extends BaseSocialProvider {
    private readonly API_VERSION = 'v2';
    private readonly API_BASE = 'https://api.linkedin.com';

    async handleCallback(code: string, state: string): Promise<ISocialConnection> {
        console.log('Starting LinkedIn callback handling');

        // First, get our internal user ID using the Clerk ID (state)
        const user = await prisma.user.findUnique({
            where: { clerkId: state },
            select: { id: true }
        });

        if (!user) {
            console.error('User not found in database for Clerk ID:', state);
            throw new Error('User not found in database');
        }

        console.log('Found user in database:', { userId: user.id });

        const tokenResponse = await this.exchangeCodeForToken(code);
        console.log('Received token response');

        // Generate a unique provider account ID
        const providerAccountId = `li_${state}_${Date.now()}`;

        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + tokenResponse.expires_in);

        // Create or update the social connection using internal user ID
        console.log('Creating/updating social connection for user:', user.id);
        const connection = await prisma.socialConnection.upsert({
            where: {
                userId_provider: {
                    userId: user.id,
                    provider: SocialProvider.LINKEDIN,
                },
            },
            create: {
                userId: user.id,
                provider: SocialProvider.LINKEDIN,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                tokenExpiry: expiryDate,
                providerAccountId,
                metadata: {
                    connectedAt: new Date().toISOString(),
                    scope: 'w_member_social',
                } as Prisma.InputJsonValue,
            },
            update: {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                tokenExpiry: expiryDate,
                metadata: {
                    updatedAt: new Date().toISOString(),
                    scope: 'w_member_social',
                } as Prisma.InputJsonValue,
            },
        });

        console.log('Successfully created/updated social connection');

        return {
            id: connection.id,
            userId: connection.userId,
            provider: SocialProvider.LINKEDIN,
            accessToken: connection.accessToken,
            refreshToken: connection.refreshToken || undefined,
            tokenExpiry: connection.tokenExpiry || undefined,
            providerAccountId: connection.providerAccountId,
            metadata: connection.metadata as Record<string, unknown> | undefined,
            createdAt: connection.createdAt,
            updatedAt: connection.updatedAt,
        };
    }

    async refreshToken(connection: ISocialConnection): Promise<Partial<ISocialConnection>> {
        if (!connection.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${this.config.tokenUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: connection.refreshToken,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
            }),
        });

        const data: LinkedInTokenResponse = await response.json();
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in);

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenExpiry: expiryDate,
        };
    }

    async disconnect(connection: ISocialConnection): Promise<void> {
        await prisma.socialConnection.delete({
            where: {
                id: connection.id,
            },
        });
    }

    async createPost(connection: ISocialConnection, post: ISocialPost): Promise<PostPublishResponse> {
        const url = `${this.API_BASE}/${this.API_VERSION}/ugcPosts`;

        // First, get the user's LinkedIn ID from their profile
        console.log("=== LINKEDIN PROVIDER: createPost STARTED ===");
        console.log("LinkedIn API URL:", url);
        console.log("Post content:", post.content);
        console.log("Media URLs:", post.mediaUrls);

        try {
            // First, get the user's LinkedIn ID from their profile using /userinfo endpoint
            console.log("Fetching LinkedIn user profile to get the user ID");
            const profileUrl = `${this.API_BASE}/${this.API_VERSION}/userinfo`;

            try {
                const profileResponse = await this.fetchWithAuth(
                    profileUrl,
                    { method: 'GET' },
                    connection.accessToken
                );

                if (!profileResponse.ok) {
                    const errorText = await profileResponse.text();
                    console.error("LinkedIn profile fetch failed:", {
                        status: profileResponse.status,
                        statusText: profileResponse.statusText,
                        errorText
                    });
                    throw new Error(`Failed to fetch LinkedIn profile: ${errorText}`);
                }

                const profile = await profileResponse.json();
                console.log("LinkedIn profile response:", profile);

                // The user ID is in the 'sub' field for /userinfo endpoint
                if (!profile.sub) {
                    throw new Error("LinkedIn profile ID not found in the userinfo response");
                }

                const authorId = profile.sub;
                console.log("Using LinkedIn profile ID for post:", authorId);

                const shareContent: LinkedInShareContent = {
                    shareCommentary: {
                        text: post.content,
                    },
                    shareMediaCategory: 'NONE',
                };

                if (post.mediaUrls && post.mediaUrls.length > 0) {
                    shareContent.shareMediaCategory = 'IMAGE';
                    shareContent.media = post.mediaUrls.map(url => ({
                        status: 'READY',
                        originalUrl: url,
                    }));
                }

                const postBody = {
                    author: `urn:li:person:${authorId}`,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': shareContent,
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                    },
                };

                console.log("Sending LinkedIn post with payload:", JSON.stringify(postBody, null, 2));
                const response = await this.fetchWithAuth(
                    url,
                    {
                        method: 'POST',
                        body: JSON.stringify(postBody),
                    },
                    connection.accessToken
                );

                console.log("LinkedIn API response status:", response.status);
                console.log("LinkedIn API response status text:", response.statusText);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("LinkedIn post creation failed:", {
                        status: response.status,
                        statusText: response.statusText,
                        errorText
                    });
                    throw new Error(`Failed to create LinkedIn post: ${errorText}`);
                }

                const responseData = await response.json();
                console.log("LinkedIn post creation succeeded. Full response:", JSON.stringify(responseData, null, 2));
                console.log("=== LINKEDIN PROVIDER: createPost COMPLETED ===");

                // Return the response in the correct format
                return {
                    id: responseData.id,
                    status: 'published',
                    message: 'Post published successfully',
                    data: {
                        postId: responseData.id
                    }
                };

            } catch (error) {
                console.error("Error in LinkedIn post creation:", error);
                throw error;
            }
        } catch (error) {
            console.error("Error in LinkedIn post creation:", error);
            throw error;
        }
    }

    private async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
        console.log('Starting token exchange with code');

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.config.redirectUri,
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
        });

        console.log('Token exchange params:', {
            grant_type: 'authorization_code',
            hasCode: !!code,
            redirect_uri: this.config.redirectUri,
            hasClientId: !!this.config.clientId,
            hasClientSecret: !!this.config.clientSecret,
        });

        const response = await fetch(this.config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('LinkedIn token exchange error:', {
                status: response.status,
                statusText: response.statusText,
                error,
            });
            throw new Error(`Failed to exchange code for token: ${error}`);
        }

        const data = await response.json();
        console.log('Token exchange successful:', {
            hasAccessToken: !!data.access_token,
            hasRefreshToken: !!data.refresh_token,
            expiresIn: data.expires_in,
        });

        return data;
    }
} 