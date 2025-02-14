"use client"

import { useState } from "react"
import { mockPosts } from "@/lib/mock-data"
import { PostCard } from "./post-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type Status = "all" | "published" | "draft" | "pending"

export function PostsGrid() {
  const [status, setStatus] = useState<Status>("all")

  const filteredPosts = mockPosts.filter(post => 
    status === "all" ? true : post.status === status
  )

  const handleStatusChange = (newStatus: Status) => {
    setStatus(newStatus)
    const count = mockPosts.filter(post => 
      newStatus === "all" ? true : post.status === newStatus
    ).length
    
    toast.info(
      newStatus === "all"
        ? `Showing all posts`
        : `Showing ${count} ${newStatus} ${count === 1 ? "post" : "posts"}`
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No posts found for the selected filter.
        </div>
      )}
    </div>
  )
} 