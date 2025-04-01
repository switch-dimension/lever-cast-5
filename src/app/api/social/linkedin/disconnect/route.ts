import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { SocialProvider } from '@/types/social';

export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const connection = await prisma.socialConnection.findUnique({
            where: {
                userId_provider: {
                    userId,
                    provider: SocialProvider.LINKEDIN,
                },
            },
        });

        if (!connection) {
            return new NextResponse('LinkedIn connection not found', { status: 404 });
        }

        await prisma.socialConnection.delete({
            where: {
                id: connection.id,
            },
        });

        return new NextResponse('LinkedIn disconnected successfully');
    } catch (error) {
        console.error('LinkedIn disconnect error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 