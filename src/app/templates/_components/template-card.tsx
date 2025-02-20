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
  const prompts = template.prompts as Record<string, string>

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
              value={prompts[platform.id] || ''}
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