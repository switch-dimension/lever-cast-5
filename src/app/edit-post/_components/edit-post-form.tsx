"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { type Post } from "@/lib/mock-data"
import { PlatformPreview } from "./platform-preview"
import { ImageUpload } from "./image-upload"
import { LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { useTemplates } from "@/hooks/use-templates"
import { usePlatforms } from "@/hooks/use-platforms"

const TWITTER_MAX_LENGTH = 280

interface EditPostFormProps {
  post?: Post // Optional for new posts
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter()
  const { templates, isLoading: isLoadingTemplates } = useTemplates()
  const { platforms, isLoading: isLoadingPlatforms } = usePlatforms()
  const [content, setContent] = useState(post?.content ?? "")
  const [selectedTemplate, setSelectedTemplate] = useState<string>(post?.template ?? "")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Set all platforms as selected by default
  useEffect(() => {
    if (platforms.length > 0 && !post) {
      setSelectedPlatforms(platforms.map(p => p.name.toLowerCase()))
    }
  }, [platforms, post])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const isTwitterSelected = selectedPlatforms.includes("twitter")
  const isContentTooLong = isTwitterSelected && content.length > TWITTER_MAX_LENGTH

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success(post ? "Post updated successfully" : "Post created successfully")
    router.push("/posts")
    router.refresh()
  }

  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'linkedin':
        return <LinkedinIcon className="h-4 w-4" />
      case 'twitter':
        return <TwitterIcon className="h-4 w-4" />
      case 'facebook':
        return <FacebookIcon className="h-4 w-4" />
      case 'instagram':
        return <InstagramIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTemplates ? (
                  <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                ) : templates.length === 0 ? (
                  <SelectItem value="none" disabled>No templates available</SelectItem>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-sm text-muted-foreground">
                {templates.find(t => t.id === selectedTemplate)?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              placeholder="Write your content here..."
              className="min-h-[200px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {isTwitterSelected && (
              <div className={`text-sm ${isContentTooLong ? "text-destructive" : "text-muted-foreground"}`}>
                {content.length}/{TWITTER_MAX_LENGTH} characters
              </div>
            )}
          </div>

          <ImageUpload onImageChange={setImage} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Platforms</label>
            <div className="grid gap-4 pt-2">
              {isLoadingPlatforms ? (
                <div>Loading platforms...</div>
              ) : (
                platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.name.toLowerCase())}
                      onChange={() => togglePlatform(platform.name.toLowerCase())}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={platform.id} className="flex items-center gap-2">
                      {getPlatformIcon(platform.name)}
                      {platform.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {selectedPlatforms.length > 0 && (
        <div className="space-y-6">
          {platforms.map(platform => (
            selectedPlatforms.includes(platform.name.toLowerCase()) && (
              <PlatformPreview 
                key={platform.id}
                platform={platform.name.toLowerCase() as "linkedin" | "twitter"}
                content={content}
                image={image}
              />
            )
          ))}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/posts")}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!content || selectedPlatforms.length === 0 || isContentTooLong || isSaving}
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>{post ? "Save Changes" : "Create Post"}</>
          )}
        </Button>
      </div>
    </div>
  )
} 