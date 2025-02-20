import { prisma } from '@/lib/prisma';
import { SocialMediaPlatform, UserPlatformSettings } from '@prisma/client';

export type CreatePlatformInput = {
    name: string;
};

export type UserPlatformSettingInput = {
    userId: string;
    platformId: string;
    settings: Record<string, any>;
};

export const platformService = {
    // Create a new social media platform
    async createPlatform(data: CreatePlatformInput): Promise<SocialMediaPlatform> {
        return await prisma.socialMediaPlatform.create({
            data
        });
    },

    // Get all platforms
    async getAllPlatforms(): Promise<SocialMediaPlatform[]> {
        return await prisma.socialMediaPlatform.findMany({
            orderBy: { name: 'asc' }
        });
    },

    // Get platform by ID
    async getPlatform(id: string): Promise<SocialMediaPlatform | null> {
        return await prisma.socialMediaPlatform.findUnique({
            where: { id }
        });
    },

    // Update user's platform settings
    async updateUserPlatformSettings(data: UserPlatformSettingInput): Promise<UserPlatformSettings> {
        return await prisma.userPlatformSettings.upsert({
            where: {
                userId_platformId: {
                    userId: data.userId,
                    platformId: data.platformId
                }
            },
            update: {
                settings: data.settings
            },
            create: {
                userId: data.userId,
                platformId: data.platformId,
                settings: data.settings
            }
        });
    },

    // Get user's platform settings
    async getUserPlatformSettings(userId: string): Promise<UserPlatformSettings[]> {
        return await prisma.userPlatformSettings.findMany({
            where: { userId },
            include: {
                platform: true
            }
        });
    },

    // Get specific platform settings for a user
    async getUserPlatformSettingsByPlatform(
        userId: string,
        platformId: string
    ): Promise<UserPlatformSettings | null> {
        return await prisma.userPlatformSettings.findUnique({
            where: {
                userId_platformId: {
                    userId,
                    platformId
                }
            },
            include: {
                platform: true
            }
        });
    },

    // Delete user's platform settings
    async deleteUserPlatformSettings(userId: string, platformId: string): Promise<UserPlatformSettings> {
        return await prisma.userPlatformSettings.delete({
            where: {
                userId_platformId: {
                    userId,
                    platformId
                }
            }
        });
    }
}; 