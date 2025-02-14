"use client"

import { Card } from "@/components/ui/card"
import { LinkedinIcon, TwitterIcon } from "lucide-react"

interface PlatformPreviewProps {
  platform: "linkedin" | "twitter"
  content: string
  image: string | null
}

export function PlatformPreview({ platform, content, image }: PlatformPreviewProps) {
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
      
      <div className={`rounded-lg border ${platform === "linkedin" ? "min-h-[150px]" : "min-h-[100px]"}`}>
        {image && (
          <div className="w-full h-48 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Post image"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
        )}
        <div className="p-4">
          <p className="whitespace-pre-wrap break-words">
            {content || "Your content will appear here..."}
          </p>
        </div>
      </div>
    </Card>
  )
} 