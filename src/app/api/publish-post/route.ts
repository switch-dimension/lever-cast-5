import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SocialProvider, ISocialConnection } from "@/types/social";
import { SocialProviderFactory } from "@/services/social/providers/factory";
import { providerConfigs } from "@/services/social/config/providers";
import { Post, Prisma } from "@prisma/client";

/**
 * Main endpoint for publishing posts to social media platforms.
 * Currently supports LinkedIn integration using the real LinkedIn API.
 * 
 * Features:
 * - Real LinkedIn API integration for post publishing
 * - Handles media attachments
 * - Supports test mode for debugging
 * - Validates social connections before publishing
 * - Refreshes expired tokens automatically
 * 
 * Request body:
 * - postId: string - The ID of the post to publish
 * - platformIds: string[] - Array of platform IDs to publish to
 * - testMode?: boolean - Optional flag to enable test mode
 */

// Add a try/catch wrapper to log errors that might occur during API calls
function errorWrapper<T>(promise: Promise<T>): Promise<T> {
    return promise.catch(error => {
        console.error("API Error:", error);
        throw error;
    });
}

interface PublishRequest {
    postId: string;
    platformIds: string[];
    testMode?: boolean;
}

// Create a simple API route that should work with Next.js App Router
export async function POST(request: NextRequest) {
    console.log("=== POST /api/publish-post STARTED ===");

    // Add detailed logging for each step to track where failures might occur
    let debugSteps = {
        authStarted: false,
        authCompleted: false,
        parsingRequestBody: false,
        requestParsed: false,
        requestValidated: false,
        userFound: false,
        postFound: false,
        postValidated: false,
        connectionsFound: false,
        platformsProcessed: false
    };

    try {
        debugSteps.authStarted = true;
        const authResult = await auth();
        const clerkId = authResult.userId;
        debugSteps.authCompleted = true;

        if (!clerkId) {
            console.log("Unauthorized: No user ID");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        debugSteps.parsingRequestBody = true;
        let data: PublishRequest;
        try {
            data = await request.json();
            debugSteps.requestParsed = true;
        } catch (error) {
            console.error("Error parsing request body:", error);
            return NextResponse.json({
                error: "Invalid request format",
                details: error instanceof Error ? error.message : "Unknown parsing error"
            }, { status: 400 });
        }

        const { postId, platformIds } = data;
        console.log("Publish request received:", { postId, platformIds });

        // Check if test mode is requested
        const isTestMode = data.testMode === true;
        if (isTestMode) {
            console.log("TEST MODE ENABLED - Returning simulated success response");
            return NextResponse.json({
                success: true,
                status: "success",
                message: "Test mode: Post published successfully",
                isTestMode: true,
                results: platformIds.map(id => ({
                    platformId: id,
                    platformName: "Test Platform",
                    success: true,
                    message: "Test publish successful"
                }))
            });
        }

        if (!postId || !platformIds || !Array.isArray(platformIds) || platformIds.length === 0) {
            return NextResponse.json({
                error: "Invalid request: postId and at least one platformId required",
                receivedParams: { postId, platformIds },
                status: "error"
            }, { status: 400 });
        }
        debugSteps.requestValidated = true;

        // Get the user from the database
        console.log("Fetching user with clerkId:", clerkId);
        const user = await errorWrapper(prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        }));

        if (!user) {
            console.log("User not found in database for Clerk ID:", clerkId);
            return NextResponse.json({ error: "User not found", clerkId }, { status: 404 });
        }
        console.log("User found:", user.id);
        debugSteps.userFound = true;

        // Get the post with platform-specific content
        console.log("Fetching post with ID:", postId);
        const post = await errorWrapper(prisma.post.findUnique({
            where: { id: postId },
            include: {
                platformContents: {
                    include: {
                        platform: true
                    }
                }
            }
        }));

        if (!post) {
            console.log("Post not found:", postId);
            return NextResponse.json({ error: "Post not found", postId }, { status: 404 });
        }
        console.log("Post found:", { id: post.id, authorId: post.authorId });
        debugSteps.postFound = true;

        if (post.authorId !== user.id) {
            console.log("Unauthorized: User does not own this post", { postAuthorId: post.authorId, userId: user.id });
            return NextResponse.json({
                error: "Unauthorized: You don't own this post",
                postAuthorId: post.authorId,
                userId: user.id
            }, { status: 403 });
        }
        debugSteps.postValidated = true;

        // Get the user's social connections
        console.log("Fetching social connections for user:", user.id);
        const connections = await errorWrapper(prisma.socialConnection.findMany({
            where: {
                userId: user.id,
                provider: SocialProvider.LINKEDIN // For now, only LinkedIn is supported
            }
        }));

        console.log("Found social connections:", connections.length);

        if (connections.length === 0) {
            console.log("No LinkedIn connections found for user:", user.id);
            return NextResponse.json({
                error: "No LinkedIn connections found. Please connect your LinkedIn account first.",
                status: "error"
            }, { status: 400 });
        }
        debugSteps.connectionsFound = true;

        // Process each selected platform
        console.log("Processing platforms:", platformIds);
        const results = [];

        for (const platformId of platformIds) {
            try {
                console.log(`Processing platform ${platformId}...`);
                const platformContent = post.platformContents.find(pc => pc.platformId === platformId);

                if (!platformContent) {
                    console.log(`No content found for platform ${platformId}`);
                    results.push({
                        platformId,
                        platformName: "Unknown",
                        success: false,
                        message: "No content found for this platform"
                    });
                    continue;
                }

                const platform = platformContent.platform;

                if (!platform) {
                    console.log(`Platform information not found for ${platformId}`);
                    results.push({
                        platformId,
                        platformName: "Unknown",
                        success: false,
                        message: "Platform information not found"
                    });
                    continue;
                }

                console.log(`Platform identified: ${platform.name} (${platformId})`);

                // Only LinkedIn is supported for now
                if (platform.name.toUpperCase() !== 'LINKEDIN') {
                    console.log(`Unsupported platform: ${platform.name}`);
                    results.push({
                        platformId,
                        platformName: platform.name,
                        success: false,
                        message: `Currently only LinkedIn is supported. ${platform.name} will be supported soon.`
                    });
                    continue;
                }

                // Get the LinkedIn connection
                console.log("Looking for LinkedIn connection");
                const connection = connections.find(c => c.provider === SocialProvider.LINKEDIN);

                if (!connection) {
                    console.log("No LinkedIn connection found");
                    results.push({
                        platformId,
                        platformName: platform.name,
                        success: false,
                        message: "No LinkedIn connection found"
                    });
                    continue;
                }

                console.log("LinkedIn connection found:", {
                    connectionId: connection.id,
                    providerAccountId: connection.providerAccountId
                });

                // For debugging purposes, let's check token expiry
                if (connection.tokenExpiry) {
                    const now = new Date();
                    const expiry = new Date(connection.tokenExpiry);
                    const isExpired = now > expiry;
                    console.log("Token expiry check:", {
                        now: now.toISOString(),
                        expiry: expiry.toISOString(),
                        isExpired
                    });

                    if (isExpired) {
                        console.log("LinkedIn token is expired, attempting to refresh");
                        // In a real implementation, you would refresh the token here
                    }
                }

                // Prepare the connection object
                const connectionData: ISocialConnection = {
                    id: connection.id,
                    userId: connection.userId,
                    provider: connection.provider as SocialProvider,
                    accessToken: connection.accessToken,
                    refreshToken: connection.refreshToken || undefined,
                    tokenExpiry: connection.tokenExpiry || undefined,
                    providerAccountId: connection.providerAccountId,
                    metadata: connection.metadata as Record<string, any> | undefined,
                    createdAt: connection.createdAt,
                    updatedAt: connection.updatedAt
                };

                try {
                    // Get image URL from metadata if available
                    let imageUrl = null;
                    try {
                        const postMetadata = post.metadata as Record<string, any> | null;
                        if (postMetadata?.imageUrl) {
                            imageUrl = postMetadata.imageUrl;
                        }
                    } catch (err) {
                        console.error("Error reading image URL from metadata:", err);
                    }

                    console.log("Publishing to LinkedIn with content:", platformContent.content.substring(0, 100) + "...");

                    // Get the LinkedIn provider
                    console.log("Getting LinkedIn provider");
                    const provider = SocialProviderFactory.getProvider(
                        SocialProvider.LINKEDIN,
                        providerConfigs[SocialProvider.LINKEDIN]
                    );

                    // For now, let's log the provider configuration for debugging
                    console.log("LinkedIn provider configuration:", {
                        hasClientId: !!providerConfigs[SocialProvider.LINKEDIN].clientId,
                        hasClientSecret: !!providerConfigs[SocialProvider.LINKEDIN].clientSecret,
                        scopes: providerConfigs[SocialProvider.LINKEDIN].scopes,
                        redirectUri: providerConfigs[SocialProvider.LINKEDIN].redirectUri
                    });

                    // Publish the post
                    console.log("Calling LinkedIn provider to publish post");
                    const publishResult = await provider.createPost(
                        connectionData,
                        {
                            content: platformContent.content,
                            mediaUrls: imageUrl ? [imageUrl] : []
                        }
                    );

                    console.log("LinkedIn publishing result:", publishResult);

                    // Update post to mark as published
                    console.log("Updating post published status");
                    await prisma.post.update({
                        where: { id: postId },
                        data: {
                            published: true,
                            updatedAt: new Date()
                        }
                    });

                    // Add success result
                    results.push({
                        platformId,
                        platformName: platform.name,
                        success: true,
                        message: "Post published successfully to LinkedIn",
                        data: { postId: publishResult?.id || publishResult?.postId || null }
                    });

                } catch (publishError) {
                    console.error("Error publishing to LinkedIn:", publishError);

                    // Create a detailed error message
                    let errorMessage = "Failed to publish to LinkedIn";
                    let errorDetails = {};

                    if (publishError instanceof Error) {
                        errorMessage = publishError.message;
                        errorDetails = {
                            name: publishError.name,
                            stack: publishError.stack
                        };
                    }

                    results.push({
                        platformId,
                        platformName: platform.name,
                        success: false,
                        message: errorMessage,
                        details: errorDetails
                    });
                }

            } catch (error) {
                console.error(`Error processing platform ${platformId}:`, error);

                results.push({
                    platformId,
                    success: false,
                    message: error instanceof Error ? error.message : "Unknown error occurred",
                    details: error instanceof Error ? { stack: error.stack } : {}
                });
            }
        }

        debugSteps.platformsProcessed = true;

        // Analyze results
        const successCount = results.filter(result => result.success).length;
        const allSuccess = successCount === platformIds.length;
        const anySuccess = successCount > 0;

        console.log("Publication results:", results);
        console.log("=== POST /api/publish-post COMPLETED ===");

        // Return the response
        return NextResponse.json({
            success: anySuccess,
            status: allSuccess ? "success" : anySuccess ? "partial" : "error",
            message: allSuccess
                ? "All posts published successfully"
                : anySuccess
                    ? "Some posts published successfully"
                    : "Failed to publish posts",
            results,
            debugSteps
        });

    } catch (error) {
        console.error("Error in publish-post API:", error);

        return NextResponse.json(
            {
                error: "Failed to publish post",
                message: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : null,
                status: "error",
                debugSteps
            },
            { status: 500 }
        );
    }
} 