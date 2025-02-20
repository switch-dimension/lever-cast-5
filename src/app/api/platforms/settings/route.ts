import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { platformService } from '@/services/platform.service';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const settings = await platformService.getUserPlatformSettings(userId);
        return NextResponse.json(settings);
    } catch (error) {
        console.error('[PLATFORM_SETTINGS_GET]', error);
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
        const settings = await platformService.updateUserPlatformSettings({
            ...body,
            userId
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('[PLATFORM_SETTINGS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 