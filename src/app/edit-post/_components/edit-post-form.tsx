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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [isPublishing, setIsPublishing] = useState(false)
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

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

  const handleSavePost = async (): Promise<{ post: Post } | null> => {
    if (!content) {
      toast.error("Please add some content first")
      return null
    }

    console.log("=== SAVE POST STARTED ===")
    setIsSaving(true)
    setError(null)

    try {
      console.log("Saving post with content:", content.substring(0, 20) + "...")

      // Prepare platform-specific content based on selection
      console.log("Selected template:", selectedTemplate)
      console.log("Selected platforms:", selectedPlatforms)

      // Create an array of platform-specific content objects
      const existingPlatformContentKeys = Object.keys(platformContent || {})
      console.log("Platform content keys:", existingPlatformContentKeys)

      // Find platforms that don't have content yet
      const platformsWithoutContent = selectedPlatforms.filter(
        (platformId) => !existingPlatformContentKeys.includes(platformId)
      )
      console.log("Platforms without content:", platformsWithoutContent)

      // Create platform content for all selected platforms if missing
      // For platforms without specific content, use the main content
      const platformContentsToSave = existingPlatformContentKeys
        .filter((platformId) => selectedPlatforms.includes(platformId))
        .map((platformId) => ({
          platformId,
          content: platformContent[platformId],
        }))
      
      // Add default content for platforms without specific content
      platformsWithoutContent.forEach(platformId => {
        platformContentsToSave.push({
          platformId,
          content: content // Use the main content as default
        });
      });

      console.log("Platform-specific content to save:", platformContentsToSave.length)
      
      // Prepare the request payload
      const savePayload = {
        id: post?.id,
        content,
        templateId: selectedTemplate || undefined,
        platformIds: selectedPlatforms,
        platformContents: platformContentsToSave,
      };
      
      // Log the full payload for debugging
      console.log("Full save payload:", JSON.stringify(savePayload, null, 2));
      
      // Call the API to save the post
      const response = await fetch('/api/posts', {
        method: post?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savePayload),
      });
      
      if (!response.ok) {
        console.error("Server returned error status:", response.status, response.statusText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Get the response body as text first
      const responseText = await response.text();
      console.log("Raw server response:", responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.error("Server returned empty response");
        throw new Error("Server returned empty response");
      }
      
      // Try to parse the JSON response
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed server response:", responseData);
      } catch (parseError) {
        console.error("Failed to parse server response:", parseError);
        throw new Error("Server returned an invalid response format");
      }
      
      console.log('Post saved successfully:', responseData.post?.id);
      
      // Update the post state with the response data
      if (responseData.post) {
        setPost(responseData.post);
      } else {
        console.warn("Server response did not include post data");
      }
      
      toast.success('Post saved as draft');
      console.log("=== SAVE POST COMPLETED ===");
      
      // Return the response data for use by other functions
      return responseData;
    } catch (error) {
      console.error('Error saving post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save post';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error; // Re-throw the error for handling by callers
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

  const handlePublishPosts = async () => {
    if (!content || selectedPlatforms.length === 0) {
      toast.error("Please select content and platforms to publish")
      return
    }
    
    console.log("=== START PUBLISH POSTS ===");
    console.log("Initial state:", { 
      content: content.substring(0, 50) + "...", 
      selectedPlatforms,
      post: post ? { id: post.id, content: post.content?.substring(0, 50) + "..." } : null
    });
    
    setIsPublishing(true)
    setError(null)
    
    try {
      // Get the selected platform names for the confirmation message
      const selectedPlatformNames = platforms
        .filter(platform => selectedPlatforms.includes(platform.id))
        .map(platform => platform.name)

      console.log("Publishing posts to platforms:", selectedPlatformNames)
      
      // First, save the post to ensure we have the latest version with all platform content
      let postId = post?.id;
      
      // First ensure we have content for each selected platform
      // If platformContent is empty, we need to generate it
      if (Object.keys(platformContent || {}).length === 0) {
        // For each selected platform, add the main content as the platform content
        const newPlatformContent: Record<string, string> = {};
        selectedPlatforms.forEach(platformId => {
          newPlatformContent[platformId] = content;
        });
        
        console.log("Generated default platform content:", newPlatformContent);
        setPlatformContent(newPlatformContent);
        
        // Add a small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      try {
        console.log("Saving post before publishing...");
        const saveResult = await handleSavePost();
        console.log("Save result:", saveResult ? "Success" : "No result");
        
        if (saveResult?.post) {
          postId = saveResult.post.id;
          console.log("Post saved successfully, ID:", postId);
        } else {
          console.log("Save returned success but no post data");
        }
      } catch (error) {
        console.error("Failed to save post before publishing:", error);
        throw new Error("Failed to save post before publishing");
      }
      
      // If we don't have a post ID yet (new post), we can't publish
      if (!postId) {
        console.error("No post ID available for publishing");
        throw new Error("Post must be saved before publishing")
      }
      
      // Call the API to publish the post
      console.log(`Calling publish API with postId: ${postId}`);
      
      // Show a toast notification that publishing is in progress
      const publishingToast = toast.loading(
        `Publishing to ${selectedPlatformNames.join(", ")}...`, 
        { duration: 60000 }  // Long duration as publishing might take time
      );
      
      // Enable test mode for debugging
      const useTestMode = false; // Set to false for real publishing
      
      // Using the real LinkedIn publishing endpoint
      const response = await fetch('/api/publish-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          platformIds: selectedPlatforms,
          testMode: useTestMode // Test mode flag for debugging
        }),
      });
      
      // Get the response body as text first
      const responseText = await response.text();
      console.log("Raw publish API response:", responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.error("Server returned empty response");
        throw new Error("Server returned empty response");
      }
      
      // Try to parse the JSON response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed publish API response:", data);
      } catch (parseError) {
        console.error("Error parsing publish API response:", parseError);
        throw new Error("Server returned an invalid response format");
      }
      
      // Dismiss the loading toast
      toast.dismiss(publishingToast);
      
      if (!response.ok) {
        console.error("Publish API returned error status:", response.status);
        const errorDetail = data?.error || data?.message || "Unknown error";
        throw new Error(`Failed to publish posts: ${errorDetail} (Status: ${response.status})`);
      }
      
      // Handle the response based on success status
      if (data.status === "success") {
        toast.success(data.message || "All posts published successfully")
        
        // Show a success message with the platforms that were published to
        toast.success(`Your content is now live on ${selectedPlatformNames.join(", ")}!`);
      } else if (data.status === "partial") {
        toast.warning(data.message || "Some posts were published successfully")
        
        // Show detailed results
        const successPlatforms: string[] = [];
        const failedPlatforms: {name: string, error: string}[] = [];
        
        data.results?.forEach((result: any) => {
          if (result.success) {
            successPlatforms.push(result.platformName);
          } else {
            failedPlatforms.push({
              name: result.platformName || "Unknown platform",
              error: result.message || "Unknown error"
            });
          }
        });
        
        if (successPlatforms.length > 0) {
          toast.success(`Successfully published to: ${successPlatforms.join(", ")}`);
        }
        
        failedPlatforms.forEach(platform => {
          toast.error(`Failed to publish to ${platform.name}: ${platform.error}`);
        });
      } else {
        throw new Error(data.message || "Failed to publish posts")
      }
      
      // Close the dialog
      setShowPublishDialog(false)
      console.log("=== END PUBLISH POSTS: SUCCESS ===");
      
    } catch (error) {
      console.error('Error publishing posts:', error);
      
      // Create a more detailed error message
      let errorMessage = 'Failed to publish posts';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Add stack trace to console for debugging
        console.error('Error stack:', error.stack);
      }
      
      // Log any additional context that might help debug
      console.error('Publishing context:', {
        postId: postId || 'unknown',
        selectedPlatforms: selectedPlatforms || [],
        platformCount: selectedPlatforms?.length || 0,
        platformNames: platforms
          .filter(p => selectedPlatforms?.includes(p.id))
          .map(p => p.name)
      });
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.log("=== END PUBLISH POSTS: ERROR ===");
    } finally {
      setIsPublishing(false)
    }
  }

  if (isLoading || isLoadingPlatforms || isLoadingTemplates) {
    return <LoadingSpinner text="Loading post data..." fullPage />
  }

  return (
    <div className="space-y-6">
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Publication</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to publish your content to the following platforms:
            </AlertDialogDescription>
            <ul className="mt-2 list-disc pl-5">
              {platforms
                .filter(platform => selectedPlatforms.includes(platform.id))
                .map(platform => (
                  <li key={platform.id} className="flex items-center gap-2">
                    {getPlatformIcon(platform.name)}
                    {platform.name}
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to continue?
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublishPosts}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
          onClick={handleSavePost}
          disabled={!content || selectedPlatforms.length === 0 || isContentTooLong || isSaving}
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>Save Post</>
          )}
        </Button>
        <Button
          onClick={() => setShowPublishDialog(true)}
          disabled={!content || selectedPlatforms.length === 0 || isContentTooLong || isSaving}
        >
          Publish Posts
        </Button>
      </div>
    </div>
  )
} 