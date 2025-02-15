"use client"

import { Template } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, StarIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TemplateCardProps {
  template: Template
  onSetDefault: (templateId: string) => void
}

export function TemplateCard({ template, onSetDefault }: TemplateCardProps) {
  const router = useRouter()

  const handleSetDefault = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSetDefault(template.id)
    toast.success(`Set "${template.name}" as the default template`)
  }

  const handleEdit = () => {
    router.push(`/templates/edit/${template.id}`)
  }

  return (
    <Card className="relative group cursor-pointer hover:shadow-md transition-shadow" onClick={handleEdit}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-xl font-bold">{template.name}</CardTitle>
          {template.isDefault && (
            <Badge variant="default" className="ml-2">
              <StarIcon className="mr-1 h-3 w-3" />
              Default
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit()
            }}
          >
            <PencilIcon className="h-4 w-4" />
            <span className="ml-2">Edit</span>
          </Button>
          {!template.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetDefault}
            >
              <StarIcon className="mr-2 h-4 w-4" />
              Set as Default
            </Button>
          )}
        </div>
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
              className="h-24 resize-none bg-muted cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 