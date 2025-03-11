"use client"

import { useState, useEffect } from "react"
import { Template, SocialMediaPlatform } from "@prisma/client"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  prompts: z.record(z.string(), z.object({
    content: z.string().optional(),
    type: z.enum(['text', 'image', 'video']),
    platform: z.string()
  }))
})

type FormData = z.infer<typeof formSchema>
type PromptType = {
  content?: string;
  type: 'text' | 'image' | 'video';
  platform: string;
}

interface TemplateFormProps {
  template?: Template & { platforms: SocialMediaPlatform[] }
  availablePlatforms: SocialMediaPlatform[]
}

export function TemplateForm({ template, availablePlatforms }: TemplateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (template) {
      console.log('Template data:', {
        template,
        prompts: template.prompts
      });
    }
  }, [template]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name ?? "",
      description: template?.description ?? "",
      prompts: template?.prompts ?? availablePlatforms.reduce((acc, platform) => ({
        ...acc,
        [platform.id]: {
          content: "",
          type: "text" as const,
          platform: platform.name.toLowerCase()
        }
      }), {})
    }
  })

  const formValues = form.watch();
  useEffect(() => {
    console.log('Form values:', formValues);
  }, [formValues]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const url = template
        ? `/api/templates/${template.id}`
        : "/api/templates"
      const method = template ? "PATCH" : "POST"

      console.log('Submitting template data:', data)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          prompts: Object.entries(data.prompts).reduce((acc, [platformId, prompt]) => {
            if (prompt.content?.trim()) {
              acc[platformId] = prompt;
            }
            return acc;
          }, {} as Record<string, PromptType>)
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(errorText || "Failed to save template")
      }

      const result = await response.json()
      console.log('Template saved successfully:', result)

      toast.success(
        template
          ? "Template updated successfully"
          : "Template created successfully"
      )
      router.push("/templates")
      router.refresh()
    } catch (error) {
      console.error('Template submission error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to save template")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Template name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Template description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Platform Prompts</h3>
            <div className="grid gap-6">
              {availablePlatforms.map((platform) => (
                <FormField
                  key={platform.id}
                  control={form.control}
                  name={`prompts.${platform.id}`}
                  render={({ field: { value, onChange, ...field } }) => {
                    const promptContent = value?.content ?? '';
                    
                    return (
                      <FormItem>
                        <FormLabel>{platform.name} Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`Enter prompt for ${platform.name} (optional)`}
                            className="h-32"
                            value={promptContent}
                            onChange={(e) => {
                              const newValue: PromptType = {
                                content: e.target.value,
                                type: 'text',
                                platform: platform.name.toLowerCase()
                              };
                              onChange(newValue);
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!form.formState.isValid || form.formState.isSubmitting || isLoading}
          >
            {isLoading ? "Saving..." : template ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 