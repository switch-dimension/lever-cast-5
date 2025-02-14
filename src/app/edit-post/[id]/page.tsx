import { notFound } from "next/navigation"
import { mockPosts } from "@/lib/mock-data"
import { EditPostForm } from "../_components/edit-post-form"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const post = mockPosts.find(p => p.id === parseInt(params.id))

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">
          Make changes to your social media content.
        </p>
      </div>
      <EditPostForm post={post} />
    </div>
  )
} 