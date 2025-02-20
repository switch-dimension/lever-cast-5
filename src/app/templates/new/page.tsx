import { TemplateForm } from "../_components/template-form"
import { platformService } from "@/services/platform.service"

export default async function NewTemplatePage() {
  const platforms = await platformService.getAllPlatforms()

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
        <p className="text-muted-foreground">
          Create a new content template with prompts for different platforms.
        </p>
      </div>
      <TemplateForm availablePlatforms={platforms} />
    </div>
  )
} 