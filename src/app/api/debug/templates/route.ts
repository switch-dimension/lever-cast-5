import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all templates for the user
        const templates = await prisma.template.findMany({
            where: {
                authorId: userId,
            },
            include: {
                platforms: true,
            },
        });

        // Get all platforms
        const platforms = await prisma.socialMediaPlatform.findMany();

        return NextResponse.json({
            templates,
            platforms,
            message: 'Debug information retrieved successfully',
        });
    } catch (error) {
        console.error('Error retrieving debug information:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve debug information' },
            { status: 500 }
        );
    }
} 