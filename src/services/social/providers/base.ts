import { ISocialProvider, ISocialProviderConfig, ISocialConnection, ISocialPost, SocialProviderError } from '@/types/social';

export abstract class BaseSocialProvider implements ISocialProvider {
    protected config: ISocialProviderConfig;

    constructor(config: ISocialProviderConfig) {
        this.config = config;
        this.validateConfig();
    }

    getAuthUrl(state: string): string {
        console.log('Generating auth URL with config:', {
            authUrl: this.config.authUrl,
            clientId: this.config.clientId ? 'present' : 'missing',
            redirectUri: this.config.redirectUri,
            scopes: this.config.scopes,
            state
        });

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            state,
            scope: this.config.scopes.join(' '),
        });

        const fullUrl = `${this.config.authUrl}?${params.toString()}`;
        console.log('Generated full auth URL:', fullUrl);

        return fullUrl;
    }

    abstract handleCallback(code: string, state: string): Promise<ISocialConnection>;

    abstract refreshToken(connection: ISocialConnection): Promise<Partial<ISocialConnection>>;

    abstract disconnect(connection: ISocialConnection): Promise<void>;

    abstract createPost(connection: ISocialConnection, post: ISocialPost): Promise<any>;

    protected async fetchWithAuth(
        url: string,
        options: RequestInit = {},
        accessToken: string
    ): Promise<Response> {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const responseText = await response.text();
            console.error("LinkedIn API Error Details:", {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                url: response.url,
                responseBody: responseText,
            });

            switch (response.status) {
                case 401:
                    throw new Error(`${SocialProviderError.UNAUTHORIZED} - Details: ${responseText}`);
                case 403:
                    throw new Error(`${SocialProviderError.INVALID_CREDENTIALS} - Details: ${responseText}`);
                case 429:
                    throw new Error(`${SocialProviderError.RATE_LIMITED} - Details: ${responseText}`);
                default:
                    throw new Error(`${SocialProviderError.CONNECTION_FAILED} - Details: ${responseText}`);
            }
        }

        return response;
    }

    protected validateConfig(): void {
        const requiredFields: (keyof ISocialProviderConfig)[] = [
            'clientId',
            'clientSecret',
            'scopes',
            'authUrl',
            'tokenUrl',
            'redirectUri',
        ];

        for (const field of requiredFields) {
            if (!this.config[field]) {
                throw new Error(`Missing required config field: ${field}`);
            }
        }
    }
} 