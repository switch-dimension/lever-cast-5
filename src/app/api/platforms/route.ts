import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { platformService } from '@/services/platform.service';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const platforms = await platformService.getAllPlatforms();
        return NextResponse.json(platforms);
    } catch (error) {
        console.error('[PLATFORMS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
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