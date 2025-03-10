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
import { LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { useTemplates } from "@/hooks/use-templates"
import { usePlatforms } from "@/hooks/use-platforms"
import { transformContent } from "@/app/actions/transform-content"

const TWITTER_MAX_LENGTH = 280

interface EditPostFormProps {
  post?: Post // Optional for new posts
}

export function EditPostForm({ post }: EditPostFormProps) {
  console.log("EditPostForm rendered", { post })
  
  const router = useRouter()
  const { templates, isLoading: isLoadingTemplates } = useTemplates()
  const { platforms, isLoading: isLoadingPlatforms } = usePlatforms()
  
  console.log("Templates loaded:", { templates, isLoadingTemplates })
  console.log("Platforms loaded:", { platforms, isLoadingPlatforms })
  
  const [content, setContent] = useState(post?.content ?? "")
  const [selectedTemplate, setSelectedTemplate] = useState<string>(post?.template ?? "")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Set all platforms as selected by default
  useEffect(() => {
    console.log("useEffect for setting default platforms", { platforms, post })
    if (platforms.length > 0 && !post) {
      const platformIds = platforms.map(p => p.id)
      console.log("Setting default selected platforms:", platformIds)
      setSelectedPlatforms(platformIds)
    }
  }, [platforms, post])

  // Automatically select the first template when templates are loaded
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate && !post?.template) {
      console.log("Setting default template:", templates[0].id)
      setSelectedTemplate(templates[0].id)
    }
  }, [templates, selectedTemplate, post?.template])

  const togglePlatform = (platformId: string) => {
    console.log("Toggling platform", { platformId })
    setSelectedPlatforms(prev => {
      const newSelection = prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
      console.log("New platform selection:", newSelection)
      return newSelection
    })
  }

  const handleGenerateContent = async () => {
    console.log("=== GENERATE CONTENT STARTED ===")
    console.log("Initial state:", { 
      content, 
      selectedTemplate,
      selectedPlatforms,
      platformContent,
      error
    })
    
    if (!content) {
      console.log("No content provided, showing error")
      toast.error("Please enter some content to transform")
      return
    }

    if (selectedPlatforms.length === 0) {
      console.log("No platforms selected, showing error")
      toast.error("Please select at least one platform")
      return
    }

    if (!selectedTemplate) {
      console.log("No template selected, showing error")
      toast.error("Please select a template")
      return
    }

    setIsGenerating(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log("Generating content for platforms:", selectedPlatforms)
      console.log("Using template:", selectedTemplate)
      console.log("Original content:", content)
      
      // Log the platforms being used
      const platformsBeingUsed = platforms.filter(p => selectedPlatforms.includes(p.id))
      console.log("Platforms being used:", platformsBeingUsed)
      
      console.log("Calling transformContent server action...")
      const result = await transformContent(content, selectedTemplate, selectedPlatforms)
      console.log("Transform content result:", result)
      
      setDebugInfo(result)

      if (result.success && result.results) {
        console.log("Transform content succeeded, processing results")
        const newPlatformContent: Record<string, string> = {}
        
        result.results.forEach((item) => {
          console.log(`Setting content for platform ${item.platformName} (${item.platformId}):`, item.transformedContent)
          newPlatformContent[item.platformId] = item.transformedContent
        })
        
        console.log("New platform content:", newPlatformContent)
        setPlatformContent(newPlatformContent)
        toast.success("Content generated successfully")
      } else {
        console.error("Error in transform content result:", result.error)
        setError(result.error || "Failed to generate content")
        toast.error(result.error || "Failed to generate content")
      }
    } catch (error) {
      console.error("Exception caught in handleGenerateContent:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred while generating content"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      console.log("Setting isGenerating to false")
      setIsGenerating(false)
      console.log("=== GENERATE CONTENT COMPLETED ===")
    }
  }

  const isTwitterSelected = selectedPlatforms.some(id => {
    const platform = platforms.find(p => p.id === id)
    return platform?.name.toLowerCase() === "twitter"
  })
  
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

          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateContent}
            disabled={!content || selectedPlatforms.length === 0 || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating content...
              </>
            ) : (
              "Generate content"
            )}
          </Button>

          {error && (
            <div className="text-sm text-destructive">
              Error: {error}
            </div>
          )}

          {debugInfo && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-md">
              <details>
                <summary>Debug Info</summary>
                <pre className="mt-2 overflow-auto max-h-[200px]">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <ImageUpload onImageChange={setImage} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Platforms</label>
            <div className="flex flex-wrap gap-4 pt-2">
              {isLoadingPlatforms ? (
                <div>Loading platforms...</div>
              ) : (
                platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => togglePlatform(platform.id)}
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
          {platforms.map(platform => {
            if (selectedPlatforms.includes(platform.id)) {
              const platformSpecificContent = platformContent[platform.id] || content;
              
              return (
                <div key={platform.id} className="space-y-2">
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(platform.name)}
                          <span className="font-medium">{platform.name} Content</span>
                        </div>
                        {isGenerating && !platformContent[platform.id] && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                      <Textarea
                        placeholder={`Content for ${platform.name}...`}
                        className="min-h-[150px] resize-none"
                        value={platformSpecificContent}
                        onChange={(e) => {
                          setPlatformContent({
                            ...platformContent,
                            [platform.id]: e.target.value
                          });
                        }}
                        disabled={isGenerating}
                      />
                    </div>
                  </Card>
                  <PlatformPreview 
                    platform={platform.name.toLowerCase() as "linkedin" | "twitter" | "facebook" | "instagram"}
                    content={platformSpecificContent}
                    image={image}
                  />
                </div>
              );
            }
            return null;
          })}
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