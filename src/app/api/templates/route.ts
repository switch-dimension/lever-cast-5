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
        console.error('[TEMPLATES_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
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

        const body = await req.json();
        const template = await templateService.createTemplate({
            ...body,
            authorId: user.id
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('[TEMPLATES_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 