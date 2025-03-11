import { EditPostForm } from "../_components/edit-post-form"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">
          Make changes to your social media content.
        </p>
      </div>
      <EditPostForm postId={params.id} />
    </div>
  )
} 