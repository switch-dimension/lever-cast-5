"use client"

import { useState } from "react"
import { mockTemplates, Template } from "@/lib/mock-data"
import { TemplateCard } from "./template-card"

export function TemplatesGrid() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)

  const handleSetDefault = (templateId: string) => {
    setTemplates(templates.map(template => ({
      ...template,
      isDefault: template.id === templateId
    })))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSetDefault={handleSetDefault}
          />
        ))}
      </div>
    </div>
  )
} 