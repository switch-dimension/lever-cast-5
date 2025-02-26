import { useState, useEffect } from 'react';
import { SocialMediaPlatform } from '@prisma/client';

export function usePlatforms() {
    const [platforms, setPlatforms] = useState<SocialMediaPlatform[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlatforms = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/platforms');
            if (!response.ok) {
                throw new Error('Failed to fetch platforms');
            }
            const data = await response.json();
            setPlatforms(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlatforms();
    }, []);

    return {
        platforms,
        isLoading,
        error,
        refetch: fetchPlatforms,
    };
} 