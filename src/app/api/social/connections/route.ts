import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const connections = await prisma.socialConnection.findMany({
            where: {
                userId,
            },
        });

        return NextResponse.json(connections);
    } catch (error) {
        console.error('Error fetching social connections:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 