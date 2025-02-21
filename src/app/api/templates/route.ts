import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { templateService } from '@/services/template.service';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get the database user ID
        const user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        const templates = await templateService.getUserTemplates(user.id);
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get the database user ID
        const user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        const data = await req.json();
        console.log('Received template data:', data);

        if (!data.name || !data.platformIds || !Array.isArray(data.platformIds)) {
            console.error('Invalid template data:', data);
            return new NextResponse('Invalid template data', { status: 400 });
        }

        const template = await templateService.createTemplate({
            ...data,
            authorId: user.id, // Use the database user ID instead of Clerk ID
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        // Enhanced error logging
        console.error('Error creating template:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });

        // Return more specific error messages
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 400 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 