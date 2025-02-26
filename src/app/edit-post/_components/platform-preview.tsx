"use client"

import { Card } from "@/components/ui/card"
import { LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon, UserCircle2 } from "lucide-react"

interface PlatformPreviewProps {
  platform: string
  content: string
  image: string | null
}

const PLATFORM_LIMITS = {
  twitter: 280,
  linkedin: 1300,
  facebook: 63206,  // Facebook's character limit
  instagram: 2200   // Instagram's caption limit
}

const PLATFORM_COLORS = {
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  instagram: "#E4405F"
}

export function PlatformPreview({ platform, content, image }: PlatformPreviewProps) {
  const characterLimit = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS] ?? Infinity
  const isOverLimit = content.length > characterLimit

  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'linkedin':
        return <LinkedinIcon className="h-5 w-5" style={{ color: PLATFORM_COLORS.linkedin }} />;
      case 'twitter':
        return <TwitterIcon className="h-5 w-5" style={{ color: PLATFORM_COLORS.twitter }} />;
      case 'facebook':
        return <FacebookIcon className="h-5 w-5" style={{ color: PLATFORM_COLORS.facebook }} />;
      case 'instagram':
        return <InstagramIcon className="h-5 w-5" style={{ color: PLATFORM_COLORS.instagram }} />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {getPlatformIcon(platform)}
        <span className="font-medium capitalize">{platform} Preview</span>
      </div>
      
      <div className={`border ${platform === "linkedin" || platform === "facebook" ? "min-h-[150px]" : "min-h-[100px]"}`}>
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
            <div className={`w-full relative border ${platform === "instagram" ? "aspect-square" : "h-48"}`}>
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