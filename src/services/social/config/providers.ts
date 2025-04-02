import { ISocialProviderConfig, SocialProvider } from '@/types/social';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    console.error('Missing required LinkedIn credentials:', {
        hasClientId: !!process.env.LINKEDIN_CLIENT_ID,
        hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
    });
}

if (!BASE_URL || BASE_URL === 'http://localhost:3000') {
    console.warn('BASE_URL is not set or using default:', BASE_URL);
}

// Log configuration details
console.log('Social provider configuration:', {
    baseUrl: BASE_URL,
    linkedInConfigured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
});

export const providerConfigs: Record<SocialProvider, ISocialProviderConfig> = {
    [SocialProvider.LINKEDIN]: {
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        apiVersion: 'v2',
        redirectUri: `${BASE_URL}/api/social/linkedin/callback`,
    },
};

// Validate the configuration
Object.entries(providerConfigs).forEach(([provider, config]) => {
    console.log(`Validating ${provider} configuration:`, {
        hasClientId: !!config.clientId,
        hasClientSecret: !!config.clientSecret,
        redirectUri: config.redirectUri,
        scopes: config.scopes,
    });
}); 