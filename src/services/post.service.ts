import { prisma } from '@/lib/prisma';
import { Post } from '@prisma/client';

export type CreatePostInput = {
    content: string;
    authorId: string;
    templateId?: string;
    platformIds: string[];
    title?: string;
};

export type UpdatePostInput = {
    id: string;
    content?: string;
    templateId?: string;
    platformIds?: string[];
    title?: string;
    published?: boolean;
};

export const postService = {
    /**
     * Create a new post in draft mode
     */
    async createDraft(data: CreatePostInput): Promise<Post> {
        try {
            // Use a default title if none provided
            const title = data.title || 'Untitled Post';

            const post = await prisma.post.create({
                data: {
                    title,
                    content: data.content,
                    published: false, // Always create as draft
                    authorId: data.authorId,
                    templateId: data.templateId || null,
                    // Note: We don't store platformIds directly in the Post model
                    // In a real app, you might want to create a PostPlatform join table
                }
            });

            return post;
        } catch (error) {
            console.error('Error creating draft post:', error);
            throw error;
        }
    },

    /**
     * Get a post by ID
     */
    async getPostById(id: string): Promise<Post | null> {
        return await prisma.post.findUnique({
            where: { id }
        });
    },

    /**
     * Get all posts for a user
     */
    async getUserPosts(userId: string): Promise<Post[]> {
        return await prisma.post.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' }
        });
    },

    /**
     * Update an existing post
     */
    async updatePost(data: UpdatePostInput): Promise<Post> {
        return await prisma.post.update({
            where: { id: data.id },
            data: {
                content: data.content,
                templateId: data.templateId,
                title: data.title,
                published: data.published
            }
        });
    },

    /**
     * Delete a post
     */
    async deletePost(id: string): Promise<Post> {
        return await prisma.post.delete({
            where: { id }
        });
    }
}; 