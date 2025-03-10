import OpenAI from 'openai';

// Initialize the OpenAI client
console.log('Initializing OpenAI client with API key:', process.env.OPENAI_API_KEY ? 'API key is set' : 'API key is NOT set');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentGenerationResult {
    platformId: string;
    transformedContent: string;
}

/**
 * Generates content for a specific platform using OpenAI
 * @param originalContent The original content to transform
 * @param promptTemplate The prompt template to use for transformation
 * @returns The transformed content
 */
export async function generateContent(
    originalContent: string,
    promptTemplate: string
): Promise<string> {
    console.log("=== OPENAI SERVICE: generateContent STARTED ===");
    try {
        console.log('Generating content with OpenAI...');
        console.log('Original content:', originalContent);
        console.log('Prompt template:', promptTemplate);

        // Check if API key is set
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key is not set');
            throw new Error('OpenAI API key is not set');
        }

        // Combine the original content with the prompt template
        const prompt = `${promptTemplate}\n\nOriginal content: ${originalContent}`;
        console.log('Combined prompt:', prompt);

        console.log('Sending request to OpenAI...');
        console.log('OpenAI client:', openai ? 'Client is initialized' : 'Client is NOT initialized');

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", // You can use "gpt-4" for better results if available
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that transforms content for social media platforms."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
            });

            console.log('Received response from OpenAI');
            console.log('Response status:', response ? 'Response received' : 'No response');
            console.log('Response choices:', response.choices ? `${response.choices.length} choices` : 'No choices');

            if (!response.choices || response.choices.length === 0) {
                console.error('No choices in OpenAI response');
                throw new Error('No choices in OpenAI response');
            }

            const generatedContent = response.choices[0].message.content || "Failed to generate content";
            console.log('Generated content:', generatedContent);

            console.log("=== OPENAI SERVICE: generateContent COMPLETED ===");
            return generatedContent;
        } catch (apiError) {
            console.error('OpenAI API error:', apiError);
            if (apiError instanceof Error) {
                console.error('API error message:', apiError.message);
                console.error('API error stack:', apiError.stack);
            }
            throw new Error(`OpenAI API error: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`);
        }
    } catch (error) {
        console.error("Error generating content with OpenAI:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        console.log("=== OPENAI SERVICE: generateContent FAILED ===");
        throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
} 