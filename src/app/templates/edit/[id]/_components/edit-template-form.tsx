"use client"

import { useState } from "react"
import { Template, mockTemplates } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StarIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"

interface EditTemplateFormProps {
  template: Template
}

export function EditTemplateForm({ template: initialTemplate }: EditTemplateFormProps) {
  const router = useRouter()
  const [template, setTemplate] = useState<Template>(initialTemplate)
  const [isSaving, setIsSaving] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate(prev => ({
      ...prev,
      name: e.target.value
    }))
  }

  const handlePromptChange = (platform: Template["platforms"][0]["platform"], value: string) => {
    setTemplate(prev => ({
      ...prev,
      platforms: prev.platforms.map(p => 
        p.platform === platform ? { ...p, systemPrompt: value } : p
      )
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // Validate
      if (!template.name.trim()) {
        toast.error("Template name is required")
        return
      }
      
      if (template.platforms.some(p => !p.systemPrompt.trim())) {
        toast.error("All platform prompts are required")
        return
      }

      // In a real app, this would be an API call
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Template saved successfully")
      router.push("/templates")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save template")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="name"
                value={template.name}
                onChange={handleNameChange}
                placeholder="Enter template name"
              />
              {template.isDefault && (
                <Badge variant="default" className="shrink-0">
                  <StarIcon className="mr-1 h-3 w-3" />
                  Default Template
                </Badge>
              )}
            </div>
          </div>

          {template.platforms.map((platform) => (
            <div key={platform.platform} className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Badge variant="secondary" className="capitalize">
                  {platform.platform}
                </Badge>
                <span>System Prompt</span>
              </Label>
              <Textarea
                value={platform.systemPrompt}
                onChange={(e) => handlePromptChange(platform.platform, e.target.value)}
                placeholder={`Enter system prompt for ${platform.platform}`}
                className="h-32 resize-none"
              />
            </div>
          ))}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push("/templates")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 