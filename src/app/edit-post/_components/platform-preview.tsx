"use client"

import { Card } from "@/components/ui/card"
import { LinkedinIcon, TwitterIcon, UserCircle2 } from "lucide-react"

interface PlatformPreviewProps {
  platform: "linkedin" | "twitter"
  content: string
  image: string | null
}

const TWITTER_MAX_LENGTH = 280
const LINKEDIN_RECOMMENDED_LENGTH = 1300

export function PlatformPreview({ platform, content, image }: PlatformPreviewProps) {
  const characterLimit = platform === "twitter" ? TWITTER_MAX_LENGTH : LINKEDIN_RECOMMENDED_LENGTH
  const isOverLimit = content.length > characterLimit

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {platform === "linkedin" ? (
          <>
            <LinkedinIcon className="h-5 w-5 text-[#0A66C2]" />
            <span className="font-medium">LinkedIn Preview</span>
          </>
        ) : (
          <>
            <TwitterIcon className="h-5 w-5 text-[#1DA1F2]" />
            <span className="font-medium">Twitter Preview</span>
          </>
        )}
      </div>
      
      <div className={`border ${platform === "linkedin" ? "min-h-[150px]" : "min-h-[100px]"}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle2 className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">Rob Shocks</p>
              <p className="text-sm text-muted-foreground">@robshocks</p>
            </div>
          </div>
          <p className="whitespace-pre-wrap break-words mb-4">
            {content || "Your content will appear here..."}
          </p>
          {image && (
            <div className="w-full h-48 relative border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Post image"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`text-sm mt-4 ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
            {content.length}/{characterLimit} characters
            {isOverLimit && " (over limit)"}
          </div>
        </div>
      </div>
    </Card>
  )
} 