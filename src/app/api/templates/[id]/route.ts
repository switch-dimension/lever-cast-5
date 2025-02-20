import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { templateService } from '@/services/template.service';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
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

        const template = await templateService.getTemplate(params.id);

        if (!template) {
            return new NextResponse('Not Found', { status: 404 });
        }

        if (template.authorId !== user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error('[TEMPLATE_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
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

        const template = await templateService.getTemplate(params.id);

        if (!template) {
            return new NextResponse('Not Found', { status: 404 });
        }

        if (template.authorId !== user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const updatedTemplate = await templateService.updateTemplate({
            id: params.id,
            ...body
        });

        return NextResponse.json(updatedTemplate);
    } catch (error) {
        console.error('[TEMPLATE_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
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

        const template = await templateService.getTemplate(params.id);

        if (!template) {
            return new NextResponse('Not Found', { status: 404 });
        }

        if (template.authorId !== user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await templateService.deleteTemplate(params.id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[TEMPLATE_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 