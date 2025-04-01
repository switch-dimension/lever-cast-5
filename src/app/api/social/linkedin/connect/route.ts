import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { SocialProvider } from '@/types/social';
import { SocialProviderFactory } from '@/services/social/providers/factory';
import { providerConfigs } from '@/services/social/config/providers';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
    console.log('LinkedIn connect flow started');
    console.log('Base URL:', BASE_URL);

    try {
        const { userId } = getAuth(request);
        console.log('User ID from auth:', userId);

        if (!userId) {
            console.error('No userId found in auth context');
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('Initializing LinkedIn provider with config:', {
            clientId: !!providerConfigs[SocialProvider.LINKEDIN].clientId,
            redirectUri: providerConfigs[SocialProvider.LINKEDIN].redirectUri,
            scopes: providerConfigs[SocialProvider.LINKEDIN].scopes,
        });

        const provider = SocialProviderFactory.getProvider(
            SocialProvider.LINKEDIN,
            providerConfigs[SocialProvider.LINKEDIN]
        );

        // Use userId as state to verify the callback
        const authUrl = provider.getAuthUrl(userId);
        console.log('Generated LinkedIn auth URL:', authUrl);

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('LinkedIn connect error:', error);
        return NextResponse.redirect(
            `${BASE_URL}/settings?error=${encodeURIComponent('Failed to initialize LinkedIn connection')}`
        );
    }
} 