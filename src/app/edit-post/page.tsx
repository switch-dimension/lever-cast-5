import { ContentForm } from "./_components/content-form"

export default function EditPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">
          Transform your ideas into engaging social media content.
        </p>
      </div>
      <ContentForm />
    </div>
  )
} 