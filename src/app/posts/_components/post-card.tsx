"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MoreVertical, Pencil, Trash2, LinkedinIcon, TwitterIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Post } from "@prisma/client"

interface PostCardProps {
  post: Post & {
    platformContents?: Array<{
      id: string;
      content: string;
      platformId: string;
      platform?: {
        id: string;
        name: string;
      };
    }>;
  };
  onPostDeleted?: (postId: string) => void;
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const statusColor = post.published
    ? "bg-green-500/10 text-green-500"
    : "bg-muted text-muted-foreground"

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      // Call the onPostDeleted callback if provided
      if (onPostDeleted) {
        onPostDeleted(post.id)
      } else {
        toast.success("Post deleted successfully")
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Helper function to get platform names from platformContents
  const getPlatformNames = (): string[] => {
    if (!post.platformContents || post.platformContents.length === 0) {
      return []
    }
    
    return post.platformContents.map(content => 
      content.platform?.name.toLowerCase() || ''
    ).filter(Boolean)
  }

  const platforms = getPlatformNames()

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={statusColor}>
                {post.published ? "Published" : "Draft"}
              </Badge>
              <div className="flex gap-1">
                {platforms.includes("linkedin") && (
                  <LinkedinIcon className="h-4 w-4 text-[#0A66C2]" />
                )}
                {platforms.includes("twitter") && (
                  <TwitterIcon className="h-4 w-4 text-[#1DA1F2]" />
                )}
              </div>
            </div>
            
            <p className="text-sm line-clamp-3">{post.content}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.title || "Untitled"}</span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/edit-post/${post.id}`} className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 