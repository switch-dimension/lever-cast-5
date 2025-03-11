import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { postService } from '@/services/post.service';
import { UserService } from '@/services/user.service';

export async function POST(request: NextRequest) {
    try {
        console.log("=== POST /api/posts STARTED ===");

        // Get the authenticated user
        const { userId: clerkId } = await auth();
        console.log("Authenticated user clerkId:", clerkId);

        if (!clerkId) {
            console.log("No clerkId found, returning 401");
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the user from our database using the Clerk ID
        const user = await UserService.getUserByClerkId(clerkId);
        console.log("User from database:", user ? { id: user.id, email: user.email } : null);

        if (!user) {
            console.log("User not found in database, returning 404");
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Parse the request body
        const body = await request.json();
        const { content, templateId, platformIds, platformContents } = body;
        console.log("Request body:", {
            contentLength: content?.length,
            templateId,
            platformIds,
            platformContentsCount: platformContents?.length
        });
        console.log("Platform contents:", platformContents);

        if (!content) {
            console.log("No content provided, returning 400");
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        // Create a draft post
        console.log("Creating draft post...");
        const post = await postService.createDraft({
            content,
            authorId: user.id, // Use the user ID from our database, not the Clerk ID
            templateId,
            platformIds: platformIds || [],
            platformContents, // Include platform-specific content
            title: 'Untitled Post', // Default title
        });

        console.log("Post created successfully:", {
            id: post.id,
            title: post.title,
            platformContentsCount: post.platformContents?.length
        });

        console.log("=== POST /api/posts COMPLETED ===");
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
        console.log("=== GET /api/posts STARTED ===");

        // Get the authenticated user
        const { userId: clerkId } = await auth();
        console.log("Authenticated user clerkId:", clerkId);

        if (!clerkId) {
            console.log("No clerkId found, returning 401");
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the user from our database using the Clerk ID
        const user = await UserService.getUserByClerkId(clerkId);
        console.log("User from database:", user ? { id: user.id, email: user.email } : null);

        if (!user) {
            console.log("User not found in database, returning 404");
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get all posts for the user
        console.log("Fetching posts for user:", user.id);
        const posts = await postService.getUserPosts(user.id);
        console.log("Posts fetched:", posts.length);

        console.log("=== GET /api/posts COMPLETED ===");
        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
} 