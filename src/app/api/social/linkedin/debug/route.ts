import { NextResponse } from 'next/server';

import { SocialProvider } from '@/types/social';
import { providerConfigs } from '@/services/social/config/providers';

export async function GET() {
    try {
        // Only allow in development
        if (process.env.NODE_ENV !== 'development') {
            return new NextResponse('Not available in production', { status: 403 });
        }

        const config = providerConfigs[SocialProvider.LINKEDIN];

        return NextResponse.json({
            baseUrl: process.env.NEXT_PUBLIC_APP_URL,
            redirectUri: config.redirectUri,
            hasClientId: !!config.clientId,
            hasClientSecret: !!config.clientSecret,
            scopes: config.scopes,
            // Don't expose actual credentials
            authUrl: config.authUrl,
            tokenUrl: config.tokenUrl,
        });
    } catch (error) {
        console.error('Debug route error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 