"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PlatformPreview } from "./platform-preview"
import { ImageUpload } from "./image-upload"
import { LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { useTemplates } from "@/hooks/use-templates"
import { usePlatforms } from "@/hooks/use-platforms"
import { transformContent } from "@/app/actions/transform-content"
import { Post } from "@prisma/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const TWITTER_MAX_LENGTH = 280

// Extended Post type to include platformContents
interface PostWithPlatformContent extends Post {
  platformContents?: Array<{
    id: string;
    platformId: string;
    content: string;
    platform?: {
      id: string;
      name: string;
    };
  }>;
}

interface EditPostFormProps {
  post?: PostWithPlatformContent; // For direct post object passing
  postId?: string; // For fetching post by ID
}

export function EditPostForm({ post: initialPost, postId }: EditPostFormProps) {
  const router = useRouter()
  const { templates, isLoading: isLoadingTemplates } = useTemplates()
  const { platforms, isLoading: isLoadingPlatforms } = usePlatforms()
  
  const [post, setPost] = useState<PostWithPlatformContent | null>(initialPost || null)
  const [isLoading, setIsLoading] = useState(!!postId && !initialPost)
  const [content, setContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Fetch post data if postId is provided
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Post not found");
            router.push("/posts");
            return;
          }
          throw new Error("Failed to fetch post");
        }
        
        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId && !initialPost) {
      fetchPost();
    }
  }, [postId, initialPost, router]);

  // Initialize form values when post data is available
  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setSelectedTemplate(post.templateId || "");
      
      // Extract platform IDs from platformContents
      const platformIds = post.platformContents?.map(pc => pc.platformId) || [];
      setSelectedPlatforms(platformIds);
      
      // Initialize platform-specific content
      const platformContentMap: Record<string, string> = {};
      post.platformContents?.forEach(pc => {
        platformContentMap[pc.platformId] = pc.content;
      });
      setPlatformContent(platformContentMap);
    }
  }, [post]);

  // Automatically select the first template when templates are loaded
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplate && !post?.templateId) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate, post?.templateId]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev: string[]) => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

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

  const handleSavePost = async () => {
    if (!content) {
      toast.error("Please enter some content to save")
      return
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      console.log("Saving post with content:", content);
      console.log("Selected template:", selectedTemplate);
      console.log("Selected platforms:", selectedPlatforms);
      console.log("Current platform content state:", platformContent);
      
      // Verify platform IDs match between selectedPlatforms and platformContent
      const platformContentKeys = Object.keys(platformContent);
      console.log("Platform content keys:", platformContentKeys);
      const missingPlatforms = selectedPlatforms.filter(id => !platformContentKeys.includes(id));
      console.log("Platforms without content:", missingPlatforms);
      
      // Ensure we're only saving content for selected platforms
      const platformContents = selectedPlatforms
        .filter(platformId => platformContent[platformId] && platformContent[platformId].trim() !== '')
        .map(platformId => ({
          platformId,
          content: platformContent[platformId]
        }));
      
      console.log("Platform-specific content to save:", platformContents);
      
      // Call the API to save the post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          templateId: selectedTemplate || undefined,
          platformIds: selectedPlatforms,
          platformContents,
        }),
      });
      
      const responseData = await response.json();
      console.log("API response:", responseData);
      
      if (!response.ok) {
        const errorMessage = responseData.error || 'Failed to save post';
        console.error("Error saving post:", errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('Post saved successfully:', responseData);
      toast.success('Post saved as draft');
      
      // Optionally redirect to posts page
      // router.push('/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save post';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading || isLoadingPlatforms || isLoadingTemplates) {
    return <LoadingSpinner text="Loading post data..." fullPage />
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
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size={16} text="" />
                      <span>Loading templates...</span>
                    </div>
                  </SelectItem>
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

          <div className="flex gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleSavePost}
              disabled={!content || isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Post"
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateContent}
              disabled={!content || selectedPlatforms.length === 0 || isGenerating}
              className="flex-1"
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
          </div>

          {error && (
            <div className="text-sm text-destructive">
              Error: {error}
            </div>
          )}

          <ImageUpload onImageChange={setImage} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Platforms</label>
            {isLoadingPlatforms ? (
              <div className="flex items-center gap-2 py-2">
                <LoadingSpinner size={16} text="Loading platforms..." />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
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
                ))}
              </div>
            )}
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