import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/openai';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, promptTemplate } = body;

        if (!content || !promptTemplate) {
            return NextResponse.json(
                { error: 'Content and promptTemplate are required' },
                { status: 400 }
            );
        }

        // Test OpenAI integration
        const transformedContent = await generateContent(content, promptTemplate);

        return NextResponse.json({
            originalContent: content,
            promptTemplate,
            transformedContent,
            message: 'OpenAI test completed successfully',
        });
    } catch (error) {
        console.error('Error testing OpenAI integration:', error);
        return NextResponse.json(
            {
                error: 'Failed to test OpenAI integration',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 