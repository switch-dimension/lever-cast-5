import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { platformService } from '@/services/platform.service';
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

        const platforms = await platformService.getAllPlatforms();
        return NextResponse.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const platform = await platformService.createPlatform(body);

        return NextResponse.json(platform);
    } catch (error) {
        console.error('[PLATFORMS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 