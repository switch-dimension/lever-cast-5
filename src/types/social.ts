export enum SocialProvider {
    LINKEDIN = 'linkedin',
    // Future providers will be added here
}

export enum SocialProviderError {
    CONNECTION_FAILED = 'CONNECTION_FAILED',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    POSTING_FAILED = 'POSTING_FAILED',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    UNAUTHORIZED = 'UNAUTHORIZED',
    RATE_LIMITED = 'RATE_LIMITED',
}

export interface ISocialProviderConfig {
    clientId: string;
    clientSecret: string;
    scopes: string[];
    authUrl: string;
    tokenUrl: string;
    apiVersion: string;
    redirectUri: string;
}

export interface ISocialConnection {
    id: string;
    userId: string;
    provider: SocialProvider;
    accessToken: string;
    refreshToken?: string;
    tokenExpiry?: Date;
    providerAccountId: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISocialPost {
    content: string;
    mediaUrls?: string[];
    scheduledTime?: Date;
    metadata?: Record<string, unknown>;
}

export interface PostPublishResponse {
    id: string;
    status: string;
    message?: string;
    data?: {
        postId?: string;
    };
}

export interface ISocialProvider {
    getAuthUrl(state: string): string;
    handleCallback(code: string, state: string): Promise<ISocialConnection>;
    disconnect(connection: ISocialConnection): Promise<void>;
    refreshToken(connection: ISocialConnection): Promise<Partial<ISocialConnection>>;
    createPost(connection: ISocialConnection, post: ISocialPost): Promise<PostPublishResponse>;
} 