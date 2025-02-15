"use client"

import { Template } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StarIcon } from "lucide-react"
import { toast } from "sonner"

interface TemplateCardProps {
  template: Template
  onSetDefault: (templateId: string) => void
}

export function TemplateCard({ template, onSetDefault }: TemplateCardProps) {
  const handleSetDefault = () => {
    onSetDefault(template.id)
    toast.success(`Set "${template.name}" as the default template`)
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{template.name}</CardTitle>
        <Button
          variant={template.isDefault ? "default" : "outline"}
          size="sm"
          onClick={handleSetDefault}
          disabled={template.isDefault}
        >
          <StarIcon className="mr-2 h-4 w-4" />
          {template.isDefault ? "Default Template" : "Set as Default"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {template.platforms.map((platform) => (
          <div key={platform.platform} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="capitalize">
                {platform.platform}
              </Badge>
            </div>
            <Textarea
              placeholder="System prompt for content generation"
              value={platform.systemPrompt}
              readOnly
              className="h-24 resize-none"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 