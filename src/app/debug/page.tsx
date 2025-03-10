"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { transformContent } from "@/app/actions/transform-content"

export default function DebugPage() {
  const [content, setContent] = useState<string>("")
  const [platformIds, setPlatformIds] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [openaiTest, setOpenaiTest] = useState<any>(null)
  const [openaiError, setOpenaiError] = useState<string | null>(null)
  const [isTestingOpenai, setIsTestingOpenai] = useState<boolean>(false)
  const [promptTemplate, setPromptTemplate] = useState<string>("Rewrite this content for social media in a more engaging way.")
  
  const handleTransformContent = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const platformIdArray = platformIds.split(',').map(id => id.trim())
      console.log("Testing with platform IDs:", platformIdArray)
      console.log("Content:", content)
      
      const transformResult = await transformContent(content, platformIdArray)
      console.log("Transform result:", transformResult)
      
      setResult(transformResult)
    } catch (err) {
      console.error("Error in transform content:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleTestOpenai = async () => {
    setIsTestingOpenai(true)
    setOpenaiError(null)
    setOpenaiTest(null)
    
    try {
      const response = await fetch('/api/debug/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          promptTemplate,
        }),
      })
      
      const data = await response.json()
      console.log("OpenAI test result:", data)
      
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to test OpenAI")
      }
      
      setOpenaiTest(data)
    } catch (err) {
      console.error("Error testing OpenAI:", err)
      setOpenaiError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsTestingOpenai(false)
    }
  }
  
  const fetchTemplateDebug = async () => {
    try {
      const response = await fetch('/api/debug/templates')
      const data = await response.json()
      console.log("Template debug data:", data)
      
      // If there are platforms, set the platform IDs field
      if (data.platforms && data.platforms.length > 0) {
        setPlatformIds(data.platforms.map((p: any) => p.id).join(', '))
      }
      
      setResult(data)
    } catch (err) {
      console.error("Error fetching template debug:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }
  
  return (
    <div className="container py-10 space-y-8">
      <h1 className="text-2xl font-bold">Debug Content Transformation</h1>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Test Content Transformation</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content to transform"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Platform IDs (comma-separated)</label>
          <Textarea
            value={platformIds}
            onChange={(e) => setPlatformIds(e.target.value)}
            placeholder="Enter platform IDs (comma-separated)"
          />
        </div>
        
        <div className="flex gap-4">
          <Button onClick={handleTransformContent} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Transform Content"
            )}
          </Button>
          
          <Button onClick={fetchTemplateDebug} variant="outline">
            Fetch Template Debug
          </Button>
        </div>
        
        {error && (
          <div className="text-destructive text-sm">
            Error: {error}
          </div>
        )}
        
        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Result:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </Card>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Test OpenAI Integration</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content to transform"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt Template</label>
          <Textarea
            value={promptTemplate}
            onChange={(e) => setPromptTemplate(e.target.value)}
            placeholder="Enter prompt template"
            className="min-h-[100px]"
          />
        </div>
        
        <Button onClick={handleTestOpenai} disabled={isTestingOpenai}>
          {isTestingOpenai ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing OpenAI...
            </>
          ) : (
            "Test OpenAI"
          )}
        </Button>
        
        {openaiError && (
          <div className="text-destructive text-sm">
            Error: {openaiError}
          </div>
        )}
        
        {openaiTest && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">OpenAI Test Result:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs">
              {JSON.stringify(openaiTest, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  )
} 