import { ISocialProvider, ISocialProviderConfig, SocialProvider } from '@/types/social';
import { LinkedInProvider } from './linkedin';

export class SocialProviderFactory {
    private static providers: Map<SocialProvider, ISocialProvider> = new Map();

    static getProvider(provider: SocialProvider, config: ISocialProviderConfig): ISocialProvider {
        if (!this.providers.has(provider)) {
            switch (provider) {
                case SocialProvider.LINKEDIN:
                    this.providers.set(provider, new LinkedInProvider(config));
                    break;
                default:
                    throw new Error(`Unsupported provider: ${provider}`);
            }
        }

        return this.providers.get(provider)!;
    }

    static clearProviders(): void {
        this.providers.clear();
    }
} 