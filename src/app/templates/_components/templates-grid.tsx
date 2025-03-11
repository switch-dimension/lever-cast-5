"use client"

import { useTemplates } from "@/hooks/use-templates"
import { TemplateCard } from "./template-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SocialMediaPlatform } from "@prisma/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function TemplatesGrid() {
  const router = useRouter()
  const { templates, isLoading, error } = useTemplates()
  const [platforms, setPlatforms] = useState<SocialMediaPlatform[]>([])
  const [loadingPlatforms, setLoadingPlatforms] = useState(true)

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoadingPlatforms(true)
        const response = await fetch('/api/platforms');
        if (!response.ok) throw new Error('Failed to fetch platforms');
        const data = await response.json();
        setPlatforms(data);
      } catch (error) {
        console.error('Error fetching platforms:', error);
      } finally {
        setLoadingPlatforms(false)
      }
    };
    fetchPlatforms();
  }, []);

  if (isLoading || loadingPlatforms) {
    return <LoadingSpinner text="Loading templates..." fullPage />
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => router.push('/templates/new')}
          className="ml-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>
      <div className="flex flex-col space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No templates yet. Create your first template to get started.
          </div>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              availablePlatforms={platforms}
              onEdit={() => router.push(`/templates/edit/${template.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
} 