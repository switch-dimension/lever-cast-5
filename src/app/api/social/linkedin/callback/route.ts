import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { SocialProvider } from '@/types/social';
import { SocialProviderFactory } from '@/services/social/providers/factory';
import { providerConfigs } from '@/services/social/config/providers';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
    console.log('LinkedIn callback received');

    try {
        const { userId } = getAuth(request);
        console.log('User ID from auth:', userId);

        if (!userId) {
            console.error('No userId found in auth context');
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        console.log('OAuth callback params:', {
            hasCode: !!code,
            state,
            error,
            error_description,
        });

        if (error || !code || !state) {
            console.error('LinkedIn OAuth error:', { error, error_description });
            return NextResponse.redirect(
                `${BASE_URL}/settings?error=${encodeURIComponent(error_description || 'Failed to connect LinkedIn')}`
            );
        }

        // Verify state matches userId to prevent CSRF
        if (state !== userId) {
            console.error('State mismatch:', { state, userId });
            return NextResponse.redirect(
                `${BASE_URL}/settings?error=Invalid authentication state`
            );
        }

        console.log('Initializing LinkedIn provider for token exchange');
        const provider = SocialProviderFactory.getProvider(
            SocialProvider.LINKEDIN,
            providerConfigs[SocialProvider.LINKEDIN]
        );

        try {
            await provider.handleCallback(code, userId);
            console.log('Successfully handled LinkedIn callback');
            return NextResponse.redirect(`${BASE_URL}/settings?success=LinkedIn connected successfully`);
        } catch (callbackError) {
            console.error('Error handling callback:', callbackError);
            return NextResponse.redirect(
                `${BASE_URL}/settings?error=${encodeURIComponent('Failed to complete LinkedIn connection')}`
            );
        }
    } catch (error) {
        console.error('LinkedIn callback error:', error);
        return NextResponse.redirect(
            `${BASE_URL}/settings?error=${encodeURIComponent('Failed to connect LinkedIn')}`
        );
    }
} 