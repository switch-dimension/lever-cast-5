import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { postService } from '@/services/post.service';
import { UserService } from '@/services/user.service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        console.log(`=== GET /api/posts/${id} STARTED ===`);

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

        // Get the post
        const post = await postService.getPostById(id);

        if (!post) {
            console.log("Post not found, returning 404");
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if the user is the author of the post
        if (post.authorId !== user.id) {
            console.log("User is not the author of the post, returning 403");
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        console.log(`=== GET /api/posts/${id} COMPLETED ===`);
        return NextResponse.json({ post });
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        console.log(`=== PATCH /api/posts/${id} STARTED ===`);

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

        // Get the existing post to check ownership
        const existingPost = await postService.getPostById(id);

        if (!existingPost) {
            console.log("Post not found, returning 404");
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if the user is the author of the post
        if (existingPost.authorId !== user.id) {
            console.log("User is not the author of the post, returning 403");
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Parse the request body
        const body = await request.json();

        // Update the post
        const updatedPost = await postService.updatePost({
            id,
            ...body
        });

        console.log(`=== PATCH /api/posts/${id} COMPLETED ===`);
        return NextResponse.json({ post: updatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        console.log(`=== DELETE /api/posts/${id} STARTED ===`);

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

        // Get the existing post to check ownership
        const existingPost = await postService.getPostById(id);

        if (!existingPost) {
            console.log("Post not found, returning 404");
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if the user is the author of the post
        if (existingPost.authorId !== user.id) {
            console.log("User is not the author of the post, returning 403");
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Delete the post
        await postService.deletePost(id);

        console.log(`=== DELETE /api/posts/${id} COMPLETED ===`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        );
    }
} 