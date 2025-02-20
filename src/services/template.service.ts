import { prisma } from '@/lib/prisma';
import { Template, SocialMediaPlatform } from '@prisma/client';

export type CreateTemplateInput = {
    name: string;
    description?: string;
    prompts: Record<string, any>;
    authorId: string;
    platformIds: string[];
};

export type UpdateTemplateInput = Partial<Omit<CreateTemplateInput, 'authorId'>> & {
    id: string;
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
                platforms: {
                    connect: data.platformIds.map(id => ({ id }))
                }
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
        const updateData: any = { ...data };
        delete updateData.id;
        delete updateData.platformIds;

        const template = await prisma.template.update({
            where: { id: data.id },
            data: {
                ...updateData,
                ...(data.platformIds && {
                    platforms: {
                        set: data.platformIds.map(id => ({ id }))
                    }
                })
            },
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