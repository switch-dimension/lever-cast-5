import { prisma } from '@/lib/prisma';
import { Post, PostContent } from '@prisma/client';

export type PlatformContentInput = {
    platformId: string;
    content: string;
};

export type CreatePostInput = {
    content: string;
    authorId: string;
    templateId?: string;
    platformIds: string[];
    title?: string;
    platformContents?: PlatformContentInput[];
};

export type UpdatePostInput = {
    id: string;
    content?: string;
    templateId?: string;
    platformIds?: string[];
    title?: string;
    published?: boolean;
    platformContents?: PlatformContentInput[];
};

export type PostWithPlatformContent = Post & {
    platformContents?: PostContent[];
};

export const postService = {
    /**
     * Create a new post in draft mode
     */
    async createDraft(data: CreatePostInput): Promise<PostWithPlatformContent> {
        try {
            console.log("=== POST SERVICE: createDraft STARTED ===");
            console.log("Creating draft post with data:", {
                title: data.title,
                contentLength: data.content?.length,
                authorId: data.authorId,
                templateId: data.templateId,
                platformIds: data.platformIds,
                platformContentsCount: data.platformContents?.length
            });

            if (data.platformContents) {
                console.log("Platform contents to save:", data.platformContents);
            }

            // Use a default title if none provided
            const title = data.title || 'Untitled Post';

            // First create the post without platform content
            console.log("Creating main post...");
            const post = await prisma.post.create({
                data: {
                    title,
                    content: data.content,
                    published: false, // Always create as draft
                    authorId: data.authorId,
                    templateId: data.templateId || null,
                }
            });
            console.log("Main post created:", { id: post.id, title: post.title });

            // Then create platform-specific content if provided
            if (data.platformContents && data.platformContents.length > 0) {
                console.log(`Creating ${data.platformContents.length} platform-specific content entries...`);

                const platformContentResults = await Promise.all(
                    data.platformContents.map(async platformContent => {
                        console.log(`Creating content for platform ${platformContent.platformId}...`);
                        try {
                            const result = await prisma.postContent.create({
                                data: {
                                    content: platformContent.content,
                                    postId: post.id,
                                    platformId: platformContent.platformId
                                }
                            });
                            console.log(`Content created for platform ${platformContent.platformId}:`, { id: result.id });
                            return { success: true, result };
                        } catch (error) {
                            console.error(`Error creating content for platform ${platformContent.platformId}:`, error);
                            return { success: false, error };
                        }
                    })
                );

                console.log("Platform content creation results:", platformContentResults);
            } else {
                console.log("No platform-specific content to create");
            }

            // Fetch the post with its platform content
            console.log("Fetching post with platform content...");
            const postWithContent = await prisma.post.findUnique({
                where: { id: post.id },
                include: {
                    platformContents: true
                }
            });

            console.log("Post with platform content fetched:", {
                id: postWithContent?.id,
                platformContentsCount: postWithContent?.platformContents?.length
            });

            if (postWithContent?.platformContents) {
                console.log("Platform contents retrieved:", postWithContent.platformContents);
            }

            console.log("=== POST SERVICE: createDraft COMPLETED ===");
            return postWithContent as PostWithPlatformContent;
        } catch (error) {
            console.error('Error creating draft post:', error);
            throw error;
        }
    },

    /**
     * Get a post by ID
     */
    async getPostById(id: string): Promise<PostWithPlatformContent | null> {
        console.log(`Getting post by ID: ${id}`);
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                platformContents: true
            }
        });
        console.log(`Post found: ${post ? 'Yes' : 'No'}`);
        if (post) {
            console.log(`Platform contents count: ${post.platformContents?.length || 0}`);
        }
        return post as PostWithPlatformContent | null;
    },

    /**
     * Get all posts for a user
     */
    async getUserPosts(userId: string): Promise<PostWithPlatformContent[]> {
        console.log(`Getting posts for user: ${userId}`);
        const posts = await prisma.post.findMany({
            where: { authorId: userId },
            include: {
                platformContents: true
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Posts found: ${posts.length}`);
        return posts as PostWithPlatformContent[];
    },

    /**
     * Update an existing post
     */
    async updatePost(data: UpdatePostInput): Promise<PostWithPlatformContent> {
        console.log("=== POST SERVICE: updatePost STARTED ===");
        console.log("Updating post with data:", {
            id: data.id,
            contentLength: data.content?.length,
            templateId: data.templateId,
            platformContentsCount: data.platformContents?.length
        });

        // First update the main post
        console.log("Updating main post...");
        const updatedPost = await prisma.post.update({
            where: { id: data.id },
            data: {
                content: data.content,
                templateId: data.templateId,
                title: data.title,
                published: data.published
            }
        });
        console.log("Main post updated:", { id: updatedPost.id, title: updatedPost.title });

        // Then update platform-specific content if provided
        if (data.platformContents && data.platformContents.length > 0) {
            console.log(`Updating ${data.platformContents.length} platform-specific content entries...`);

            const platformContentResults = await Promise.all(
                data.platformContents.map(async platformContent => {
                    console.log(`Processing content for platform ${platformContent.platformId}...`);
                    try {
                        // Check if content for this platform already exists
                        const existingContent = await prisma.postContent.findFirst({
                            where: {
                                postId: data.id,
                                platformId: platformContent.platformId
                            }
                        });

                        if (existingContent) {
                            console.log(`Updating existing content for platform ${platformContent.platformId}...`);
                            const result = await prisma.postContent.update({
                                where: { id: existingContent.id },
                                data: { content: platformContent.content }
                            });
                            console.log(`Content updated for platform ${platformContent.platformId}`);
                            return { success: true, action: 'update', result };
                        } else {
                            console.log(`Creating new content for platform ${platformContent.platformId}...`);
                            const result = await prisma.postContent.create({
                                data: {
                                    content: platformContent.content,
                                    postId: data.id,
                                    platformId: platformContent.platformId
                                }
                            });
                            console.log(`Content created for platform ${platformContent.platformId}`);
                            return { success: true, action: 'create', result };
                        }
                    } catch (error) {
                        console.error(`Error processing content for platform ${platformContent.platformId}:`, error);
                        return { success: false, error };
                    }
                })
            );

            console.log("Platform content update results:", platformContentResults);
        } else {
            console.log("No platform-specific content to update");
        }

        // Return the updated post with platform contents
        console.log("Fetching updated post with platform content...");
        const postWithContent = await prisma.post.findUnique({
            where: { id: data.id },
            include: {
                platformContents: true
            }
        });

        console.log("Post with platform content fetched:", {
            id: postWithContent?.id,
            platformContentsCount: postWithContent?.platformContents?.length
        });

        console.log("=== POST SERVICE: updatePost COMPLETED ===");
        return postWithContent as PostWithPlatformContent;
    },

    /**
     * Delete a post
     */
    async deletePost(id: string): Promise<Post> {
        console.log(`Deleting post with ID: ${id}`);
        const deletedPost = await prisma.post.delete({
            where: { id }
        });
        console.log(`Post deleted: ${deletedPost.id}`);
        return deletedPost;
    }
}; 