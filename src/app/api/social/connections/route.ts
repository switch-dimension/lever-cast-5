import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { userId: clerkId } = getAuth(request);
        if (!clerkId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get the internal user ID first
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Use the internal user ID to fetch connections
        const connections = await prisma.socialConnection.findMany({
            where: {
                userId: user.id,
            },
        });

        return NextResponse.json(connections);
    } catch (error) {
        console.error('Error fetching social connections:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 