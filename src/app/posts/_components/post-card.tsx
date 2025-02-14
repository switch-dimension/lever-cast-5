"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MoreVertical, Pencil, Trash2, LinkedinIcon, TwitterIcon } from "lucide-react"
import { type Post } from "@/lib/mock-data"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const statusColor = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-500/10 text-green-500",
    pending: "bg-yellow-500/10 text-yellow-500",
  }[post.status]

  const handleDelete = () => {
    // In a real app, this would make an API call
    toast.success("Post deleted successfully")
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={statusColor}>
                {post.status}
              </Badge>
              <div className="flex gap-1">
                {post.platforms.includes("linkedin") && (
                  <LinkedinIcon className="h-4 w-4 text-[#0A66C2]" />
                )}
                {post.platforms.includes("twitter") && (
                  <TwitterIcon className="h-4 w-4 text-[#1DA1F2]" />
                )}
              </div>
            </div>
            
            <p className="text-sm line-clamp-3">{post.content}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.template}</span>
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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 