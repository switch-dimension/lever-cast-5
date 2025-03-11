"use client"

import { useState, useEffect, useCallback } from "react"
import { PostCard } from "./post-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Post } from "@prisma/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

type Status = "all" | "published" | "draft"
type PostWithPlatformContent = Post & {
  platformContents: Array<{
    id: string;
    content: string;
    platformId: string;
    platform: {
      id: string;
      name: string;
    };
  }>;
};

export function PostsGrid() {
  const [status, setStatus] = useState<Status>("all")
  const [posts, setPosts] = useState<PostWithPlatformContent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      setPosts(data.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = posts.filter(post => 
    status === "all" ? true : (status === "published" ? post.published : !post.published)
  )

  const handleStatusChange = (newStatus: Status) => {
    setStatus(newStatus)
    const count = posts.filter(post => 
      newStatus === "all" ? true : (newStatus === "published" ? post.published : !post.published)
    ).length
    
    toast.info(
      newStatus === "all"
        ? `Showing all posts`
        : `Showing ${count} ${newStatus} ${count === 1 ? "post" : "posts"}`
    )
  }

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId))
    toast.success("Post deleted successfully")
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
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading posts..." fullPage />
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}

      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No posts found for the selected filter.
        </div>
      )}
    </div>
  )
} 