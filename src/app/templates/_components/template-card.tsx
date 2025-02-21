"use client"

import { Template, SocialMediaPlatform } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PencilIcon } from "lucide-react"

interface TemplateCardProps {
  template: Template & { platforms: SocialMediaPlatform[] }
  onEdit: () => void
}

export function TemplateCard({ template, onEdit }: TemplateCardProps) {
  // Parse the prompts data properly
  const getPromptContent = (platformId: string) => {
    try {
      const promptsData = template.prompts as any;
      
      // Handle array format
      if (Array.isArray(promptsData)) {
        const prompt = promptsData.find(p => p.platform === platformId);
        return prompt?.content || '';
      }
      
      // Handle object format
      if (typeof promptsData === 'object' && promptsData !== null) {
        return promptsData[platformId]?.content || promptsData[platformId] || '';
      }
      
      return '';
    } catch (error) {
      console.error('Error parsing prompt content:', error);
      return '';
    }
  };

  return (
    <Card className="relative group cursor-pointer hover:shadow-md transition-shadow" onClick={onEdit}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-xl font-bold">{template.name}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <PencilIcon className="h-4 w-4" />
            <span className="ml-2">Edit</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {template.platforms.map((platform) => (
          <div key={platform.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="capitalize">
                {platform.name}
              </Badge>
            </div>
            <Textarea
              placeholder="System prompt for content generation"
              value={getPromptContent(platform.id)}
              readOnly
              className="h-24 resize-none bg-muted cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
        {template.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {template.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 