import { EditPostForm } from "./_components/edit-post-form"

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">
          Transform your ideas into engaging social media content.
        </p>
      </div>
      <EditPostForm />
    </div>
  )
} 