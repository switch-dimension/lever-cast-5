export type Template = {
    id: string
    name: string
    description: string
    isDefault: boolean
    platforms: {
        platform: 'twitter' | 'linkedin'
        systemPrompt: string
    }[]
}

export const mockTemplates: Template[] = [
    {
        id: '1',
        name: 'Professional Business Template',
        description: 'Perfect for business and professional updates',
        isDefault: true,
        platforms: [
            {
                platform: 'linkedin',
                systemPrompt: 'Create a professional business post focusing on industry insights and thought leadership.'
            },
            {
                platform: 'twitter',
                systemPrompt: 'Create a concise, engaging business tweet with relevant hashtags.'
            }
        ]
    },
    {
        id: '2',
        name: 'Casual Social Template',
        description: 'Ideal for casual, engaging social media content',
        isDefault: false,
        platforms: [
            {
                platform: 'linkedin',
                systemPrompt: 'Create a friendly, conversational post that maintains professional tone.'
            },
            {
                platform: 'twitter',
                systemPrompt: 'Create a casual, engaging tweet with a friendly tone.'
            }
        ]
    },
    {
        id: '3',
        name: 'Marketing Campaign Template',
        description: 'Designed for marketing campaigns and promotions',
        isDefault: false,
        platforms: [
            {
                platform: 'linkedin',
                systemPrompt: 'Create a marketing-focused post that highlights value propositions and includes a call to action.'
            },
            {
                platform: 'twitter',
                systemPrompt: 'Create a punchy marketing tweet with strong call to action.'
            }
        ]
    }
]

export const mockPosts = [
    {
        id: 1,
        content: "Just launched our new feature that helps entrepreneurs save 2 hours per day on social media management! 🚀",
        template: "Quick Tip",
        status: "published",
        platforms: ["twitter", "linkedin"],
        createdAt: "2024-02-14T10:00:00Z",
    },
    {
        id: 2,
        content: "5 key trends that will shape the future of digital marketing in 2024...",
        template: "Industry News",
        status: "draft",
        platforms: ["linkedin"],
        createdAt: "2024-02-14T11:30:00Z",
    },
]

export type Post = typeof mockPosts[0] 