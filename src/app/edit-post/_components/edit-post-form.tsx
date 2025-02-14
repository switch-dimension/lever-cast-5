"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { mockTemplates, type Post } from "@/lib/mock-data"
import { PlatformPreview } from "./platform-preview"
import { ImageUpload } from "./image-upload"
import { LinkedinIcon, TwitterIcon } from "lucide-react"
import { toast } from "sonner"

const TWITTER_MAX_LENGTH = 280

interface EditPostFormProps {
  post?: Post // Optional for new posts
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter()
  const [content, setContent] = useState(post?.content ?? "")
  const [selectedTemplate, setSelectedTemplate] = useState<string>(post?.template ?? "")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(post?.platforms ?? [])
  const [image, setImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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
                {mockTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.name}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-sm text-muted-foreground">
                {mockTemplates.find(t => t.name === selectedTemplate)?.description}
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
            <div className="flex gap-2">
              <Button
                variant={selectedPlatforms.includes("linkedin") ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform("linkedin")}
                className="gap-2"
              >
                <LinkedinIcon className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant={selectedPlatforms.includes("twitter") ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform("twitter")}
                className="gap-2"
              >
                <TwitterIcon className="h-4 w-4" />
                Twitter
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {selectedPlatforms.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {selectedPlatforms.includes("linkedin") && (
            <PlatformPreview 
              platform="linkedin" 
              content={content}
              image={image}
            />
          )}
          {selectedPlatforms.includes("twitter") && (
            <PlatformPreview 
              platform="twitter" 
              content={content}
              image={image}
            />
          )}
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