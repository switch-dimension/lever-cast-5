import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { postService } from '@/services/post.service';
import { UserService } from '@/services/user.service';

export async function POST(request: NextRequest) {
    try {
        // Get the authenticated user
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the user from our database using the Clerk ID
        const user = await UserService.getUserByClerkId(clerkId);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Parse the request body
        const body = await request.json();
        const { content, templateId, platformIds } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        // Create a draft post
        const post = await postService.createDraft({
            content,
            authorId: user.id, // Use the user ID from our database, not the Clerk ID
            templateId,
            platformIds: platformIds || [],
            title: 'Untitled Post', // Default title
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get the authenticated user
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the user from our database using the Clerk ID
        const user = await UserService.getUserByClerkId(clerkId);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get all posts for the user
        const posts = await postService.getUserPosts(user.id);

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
} 