import { notFound } from "next/navigation"
import { TemplateForm } from "../../_components/template-form"
import { platformService } from "@/services/platform.service"
import { templateService } from "@/services/template.service"

interface EditTemplatePageProps {
  params: {
    id: string
  }
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const [template, platforms] = await Promise.all([
    templateService.getTemplate(params.id),
    platformService.getAllPlatforms()
  ])

  if (!template) {
    notFound()
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
        <p className="text-muted-foreground">
          Update your content template and platform prompts.
        </p>
      </div>
      <TemplateForm template={template} availablePlatforms={platforms} />
    </div>
  )
} 