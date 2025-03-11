'use server'

import { generateContent } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export interface TransformContentResult {
    platformId: string;
    platformName: string;
    transformedContent: string;
}

interface TemplatePrompts {
    [platformId: string]: {
        type: string;
        content: string;
        platform: string;
    };
}

/**
 * Transforms content for selected platforms using OpenAI
 * @param originalContent The original content to transform
 * @param templateId The ID of the template to use
 * @param platformIds The IDs of the platforms to transform content for
 * @returns The transformed content for each platform
 */
export async function transformContent(
    originalContent: string,
    templateId: string,
    platformIds: string[]
): Promise<{ success: boolean; results?: TransformContentResult[]; error?: string; debug?: Record<string, unknown> }> {
    console.log("=== SERVER ACTION: transformContent STARTED ===");
    console.log("Received params:", { originalContent, templateId, platformIds });

    try {
        console.log('Starting content transformation...');

        // Get Clerk user ID from auth
        console.log('Getting Clerk user ID from auth...');
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            console.error('User not authenticated');
            return { success: false, error: "Unauthorized" };
        }

        console.log('Clerk User ID:', clerkUserId);

        // Get the database user ID using the Clerk ID
        console.log('Getting database user ID from Clerk ID...');
        const dbUser = await prisma.user.findUnique({
            where: {
                clerkId: clerkUserId
            },
            select: {
                id: true
            }
        });

        if (!dbUser) {
            console.error('Database user not found for Clerk ID:', clerkUserId);
            return { success: false, error: "User not found in database" };
        }

        const userId = dbUser.id;
        console.log('Database User ID:', userId);

        // Get the template with its prompts
        console.log('Fetching template:', templateId);
        const template = await prisma.template.findUnique({
            where: {
                id: templateId,
                authorId: userId
            }
        });

        if (!template) {
            console.error('Template not found:', templateId);
            return {
                success: false,
                error: "Template not found",
                debug: { templateId, userId }
            };
        }

        console.log('Template found:', template.name);
        console.log('Template prompts:', template.prompts);

        // Get platforms
        console.log('Fetching platforms...');
        console.log('Platform IDs to fetch:', platformIds);

        const platforms = await prisma.socialMediaPlatform.findMany({
            where: {
                id: {
                    in: platformIds
                }
            }
        });

        console.log('Fetched platforms:', JSON.stringify(platforms, null, 2));

        if (platforms.length === 0) {
            console.error('No platforms found with the provided IDs');
            return {
                success: false,
                error: "No platforms found",
                debug: { platformIds }
            };
        }

        // Generate content for each platform
        console.log('Generating content for each platform...');
        const results = await Promise.all(
            platforms.map(async (platform) => {
                console.log(`Processing platform: ${platform.name} (${platform.id})`);

                // Extract the prompt from the template
                const prompts = template.prompts as TemplatePrompts;

                // Find the prompt for this platform by ID
                const promptData = prompts[platform.id];

                if (!promptData || !promptData.content) {
                    console.warn(`No prompt template found for platform: ${platform.name}`);
                    // If no prompt template is found for this platform, return the original content
                    return {
                        platformId: platform.id,
                        platformName: platform.name,
                        transformedContent: originalContent
                    };
                }

                const promptTemplate = promptData.content;
                console.log(`Using prompt template for ${platform.name}:`, promptTemplate);

                // Generate content using OpenAI
                try {
                    console.log(`Generating content for platform: ${platform.name}`);
                    const transformedContent = await generateContent(originalContent, promptTemplate);
                    console.log(`Generated content for ${platform.name}:`, transformedContent);

                    return {
                        platformId: platform.id,
                        platformName: platform.name,
                        transformedContent
                    };
                } catch (error) {
                    console.error(`Error generating content for platform ${platform.name}:`, error);
                    // If there's an error, return the original content
                    return {
                        platformId: platform.id,
                        platformName: platform.name,
                        transformedContent: originalContent
                    };
                }
            })
        );

        console.log('Content generation completed:', results);
        console.log("=== SERVER ACTION: transformContent COMPLETED ===");

        return {
            success: true,
            results,
            debug: {
                template,
                platforms,
                results
            }
        };
    } catch (error) {
        console.error("Error transforming content:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        console.log("=== SERVER ACTION: transformContent FAILED ===");

        return {
            success: false,
            error: `Failed to transform content: ${error instanceof Error ? error.message : 'Unknown error'}`,
            debug: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
    }
} 