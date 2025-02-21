import { prisma } from '@/lib/prisma';
import { Template, SocialMediaPlatform } from '@prisma/client';

export type TemplatePrompt = {
    content: string;
    type: 'text' | 'image' | 'video';
    platform: string;
    settings?: Record<string, string | number | boolean | null>;
}

export type CreateTemplateInput = {
    name: string;
    description?: string;
    prompts: Record<string, TemplatePrompt>;
    authorId: string;
    platformIds?: string[];
};

export type UpdateTemplateInput = Partial<Omit<CreateTemplateInput, 'authorId'>> & {
    id: string;
};

type TemplateUpdateData = Omit<UpdateTemplateInput, 'id' | 'platformIds'> & {
    platforms?: {
        set: { id: string }[];
    };
};

export type TemplateWithPlatforms = Template & {
    platforms: SocialMediaPlatform[];
};

export const templateService = {
    // Create a new template
    async createTemplate(data: CreateTemplateInput): Promise<TemplateWithPlatforms> {
        return await prisma.template.create({
            data: {
                name: data.name,
                description: data.description,
                prompts: data.prompts,
                authorId: data.authorId,
                platforms: data.platformIds ? {
                    connect: data.platformIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                platforms: true,
                author: true
            }
        });
    },

    // Get a template by ID
    async getTemplate(id: string): Promise<TemplateWithPlatforms | null> {
        return await prisma.template.findUnique({
            where: { id },
            include: {
                platforms: true,
                author: true
            }
        });
    },

    // Get all templates for a user
    async getUserTemplates(userId: string): Promise<TemplateWithPlatforms[]> {
        return await prisma.template.findMany({
            where: { authorId: userId },
            include: {
                platforms: true,
                author: true
            },
            orderBy: { updatedAt: 'desc' }
        });
    },

    // Update a template
    async updateTemplate(data: UpdateTemplateInput): Promise<TemplateWithPlatforms> {
        const { id, platformIds, ...updateData } = data;

        const templateUpdate: TemplateUpdateData = {
            ...updateData,
            ...(platformIds && {
                platforms: {
                    set: platformIds.map(id => ({ id }))
                }
            })
        };

        const template = await prisma.template.update({
            where: { id },
            data: templateUpdate,
            include: {
                platforms: true,
                author: true
            }
        });

        return template;
    },

    // Delete a template
    async deleteTemplate(id: string): Promise<TemplateWithPlatforms> {
        return await prisma.template.delete({
            where: { id },
            include: {
                platforms: true,
                author: true
            }
        });
    },

    // Get all available social media platforms
    async getSocialMediaPlatforms(): Promise<SocialMediaPlatform[]> {
        return await prisma.socialMediaPlatform.findMany({
            orderBy: { name: 'asc' }
        });
    }
}; 