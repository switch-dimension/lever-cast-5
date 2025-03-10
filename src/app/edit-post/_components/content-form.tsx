"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { mockTemplates } from "@/lib/mock-data"
import { PlatformPreview } from "./platform-preview"
import { ImageUpload } from "./image-upload"
import { LinkedinIcon, TwitterIcon } from "lucide-react"

const TWITTER_MAX_LENGTH = 280

export function ContentForm() {
  const [content, setContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [image, setImage] = useState<string | null>(null)

  // Automatically select the first template when component mounts
  useEffect(() => {
    if (mockTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(mockTemplates[0].name)
    }
  }, [selectedTemplate])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const isTwitterSelected = selectedPlatforms.includes("twitter")
  const isContentTooLong = isTwitterSelected && content.length > TWITTER_MAX_LENGTH

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
              <div className="text-sm text-muted-foreground">
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

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!content || selectedPlatforms.length === 0 || isContentTooLong}
        >
          Publish
        </Button>
      </div>
    </div>
  )
} 