import { EditPostForm } from "../_components/edit-post-form"

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">
          Make changes to your social media content.
        </p>
      </div>
      <EditPostForm postId={id} />
    </div>
  )
} 