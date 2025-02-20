import { useState, useEffect } from 'react';
import { Template, SocialMediaPlatform } from '@prisma/client';

type TemplateWithPlatforms = Template & {
    platforms: SocialMediaPlatform[];
};

export function useTemplates() {
    const [templates, setTemplates] = useState<TemplateWithPlatforms[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/templates');
            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }
            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const createTemplate = async (template: Omit<Template, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>) => {
        try {
            setError(null);
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(template),
            });

            if (!response.ok) {
                throw new Error('Failed to create template');
            }

            const newTemplate = await response.json();
            setTemplates(prev => [...prev, newTemplate]);
            return newTemplate;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const updateTemplate = async (id: string, template: Partial<Template>) => {
        try {
            setError(null);
            const response = await fetch(`/api/templates/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(template),
            });

            if (!response.ok) {
                throw new Error('Failed to update template');
            }

            const updatedTemplate = await response.json();
            setTemplates(prev =>
                prev.map(t => (t.id === id ? updatedTemplate : t))
            );
            return updatedTemplate;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            setError(null);
            const response = await fetch(`/api/templates/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete template');
            }

            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return {
        templates,
        isLoading,
        error,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        refetch: fetchTemplates,
    };
} 