import { TemplatesGrid } from "./_components/templates-grid"

export default function TemplatesPage() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Manage your content templates and system prompts for different platforms.
        </p>
      </div>
      <TemplatesGrid />
    </div>
  )
} 