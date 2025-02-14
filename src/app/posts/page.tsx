import { PostsGrid } from "./_components/posts-grid"
import { Button } from "@/components/ui/button"
import { PenLine } from "lucide-react"
import Link from "next/link"

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recent Posts</h1>
          <p className="text-muted-foreground">
            View and manage your social media content.
          </p>
        </div>
        <Button asChild>
          <Link href="/edit-post" className="gap-2">
            <PenLine className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      <PostsGrid />
    </div>
  )
} 