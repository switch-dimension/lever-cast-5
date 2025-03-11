"use client"

import { Template, SocialMediaPlatform } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon } from "lucide-react"

interface PromptData {
  type: string;
  content: string;
  platform: string;
}

interface TemplateCardProps {
  template: Template & { platforms: SocialMediaPlatform[] }
  availablePlatforms: SocialMediaPlatform[]
  onEdit: () => void
}

export function TemplateCard({ template, availablePlatforms, onEdit }: TemplateCardProps) {
  console.log('Template data:', {
    templateId: template.id,
    platforms: template.platforms,
    prompts: template.prompts
  });

  // Parse the prompts data properly
  const getPromptContent = (platformId: string) => {
    try {
      const promptsData = (template.prompts as unknown) as Record<string, PromptData>;
      return promptsData[platformId]?.content || '';
    } catch (error) {
      console.error('Error parsing prompt content:', error);
      return '';
    }
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'linkedin':
        return <LinkedinIcon className="h-4 w-4 text-[#0A66C2]" />;
      case 'twitter':
        return <TwitterIcon className="h-4 w-4 text-[#1DA1F2]" />;
      case 'facebook':
        return <FacebookIcon className="h-4 w-4 text-[#1877F2]" />;
      case 'instagram':
        return <InstagramIcon className="h-4 w-4 text-[#E4405F]" />;
      default:
        return null;
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
        {availablePlatforms.map((platform) => {
          const promptContent = getPromptContent(platform.id);
          return (
            <div key={platform.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center gap-2">
                  {getPlatformIcon(platform.name)}
                  <span className="capitalize">{platform.name}</span>
                </Badge>
              </div>
              {promptContent ? (
                <Textarea
                  value={promptContent}
                  readOnly
                  className="h-24 resize-none bg-muted cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">No prompt set</p>
              )}
            </div>
          );
        })}
        {template.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {template.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 