export const mockTemplates = [
    {
        id: 1,
        name: "Professional Insight",
        description: "Share your professional expertise with a thought-provoking insight",
        platforms: ["linkedin"],
    },
    {
        id: 2,
        name: "Quick Tip",
        description: "Share a concise, actionable tip in your field",
        platforms: ["twitter", "linkedin"],
    },
    {
        id: 3,
        name: "Industry News",
        description: "Comment on recent developments in your industry",
        platforms: ["linkedin", "twitter"],
    },
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

export type Template = typeof mockTemplates[0]
export type Post = typeof mockPosts[0] 