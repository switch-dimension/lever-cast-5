import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { templateService } from '@/services/template.service';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const templateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    prompts: z.record(z.string(), z.object({
        content: z.string().optional(),
        type: z.enum(['text', 'image', 'video']),
        platform: z.string()
    }))
});

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

        // Validate the incoming data
        const validationResult = templateSchema.safeParse(data);
        if (!validationResult.success) {
            console.error('Template validation failed:', validationResult.error);
            return new NextResponse('Invalid template data: ' + validationResult.error.message, { status: 400 });
        }

        // Extract platform IDs from the prompts - include all platforms
        const platformIds = Object.keys(data.prompts);

        const template = await templateService.createTemplate({
            ...data,
            authorId: user.id,
            platformIds
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