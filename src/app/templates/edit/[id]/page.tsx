import { Template, mockTemplates } from "@/lib/mock-data"
import { EditTemplateForm } from "./_components/edit-template-form"
import { notFound } from "next/navigation"

export default function EditTemplatePage({
  params,
}: {
  params: { id: string }
}) {
  // In a real app, this would be a database query
  const template = mockTemplates.find(t => t.id === params.id)

  if (!template) {
    return notFound()
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
        <p className="text-muted-foreground">
          Modify your template settings and system prompts.
        </p>
      </div>
      <EditTemplateForm template={template} />
    </div>
  )
} 