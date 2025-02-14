"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, LinkedinIcon, TwitterIcon } from "lucide-react"
import { type Post } from "@/lib/mock-data"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const statusColor = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-500/10 text-green-500",
    pending: "bg-yellow-500/10 text-yellow-500",
  }[post.status]

  return (
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
            <DropdownMenuItem className="gap-2">
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
} 