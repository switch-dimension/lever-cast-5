"use client"

import { useState, useMemo, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  platformIds: z.array(z.string()).min(1, "Select at least one platform"),
  prompts: z.record(z.string(), z.object({
    content: z.string(),
    type: z.enum(['text', 'image', 'video']),
    platform: z.string()
  }))
})

type FormData = z.infer<typeof formSchema>
type PromptType = {
  content: string;
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

  const initialPrompts = useMemo(() => {
    if (!template?.prompts) return {};
    
    try {
      const rawPrompts = template.prompts as any;
      
      // If it's already in the correct object format
      if (typeof rawPrompts === 'object' && !Array.isArray(rawPrompts)) {
        return Object.entries(rawPrompts).reduce((acc, [platformId, prompt]) => {
          if (typeof prompt === 'object' && prompt !== null) {
            acc[platformId] = {
              content: String(prompt.content || ''),
              type: prompt.type || 'text',
              platform: prompt.platform || 'unknown'
            };
          } else {
            acc[platformId] = {
              content: String(prompt),
              type: 'text',
              platform: 'unknown'
            };
          }
          return acc;
        }, {} as Record<string, PromptType>);
      }
      
      // If it's an array, convert to object format using platform IDs
      if (Array.isArray(rawPrompts)) {
        return rawPrompts.reduce((acc, prompt, index) => {
          const platformId = template.platforms[index]?.id;
          if (!platformId) return acc;

          if (typeof prompt === 'object' && prompt !== null) {
            acc[platformId] = {
              content: String(prompt.content || ''),
              type: prompt.type || 'text',
              platform: prompt.platform || template.platforms[index].name.toLowerCase()
            };
          } else {
            acc[platformId] = {
              content: String(prompt),
              type: 'text',
              platform: template.platforms[index].name.toLowerCase()
            };
          }
          return acc;
        }, {} as Record<string, PromptType>);
      }

      return {};
    } catch (error) {
      console.error('Error parsing prompts:', error);
      return {};
    }
  }, [template]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      platformIds: template?.platforms.map(p => p.id) || [],
      prompts: initialPrompts,
    },
  })

  const selectedPlatformIds = form.watch("platformIds")

  useEffect(() => {
    const currentValues = form.getValues();
    const newPrompts: Record<string, PromptType> = {};
    
    selectedPlatformIds.forEach((platformId) => {
      const platform = availablePlatforms.find(p => p.id === platformId);
      if (!platform) return;

      const platformName = platform.name.toLowerCase();
      
      // Keep existing prompt if available
      if (currentValues.prompts?.[platformId]) {
        newPrompts[platformId] = currentValues.prompts[platformId];
      } else {
        // Create new prompt
        newPrompts[platformId] = {
          content: '',
          type: 'text',
          platform: platformName
        };
      }
    });

    form.setValue('prompts', newPrompts, { shouldValidate: true });
  }, [selectedPlatformIds, availablePlatforms, form]);

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
        body: JSON.stringify(data),
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

            <FormField
              control={form.control}
              name="platformIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platforms</FormLabel>
                  <Select
                    value={field.value.join(",")}
                    onValueChange={(value) =>
                      field.onChange(value ? value.split(",") : [])
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platforms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePlatforms.map((platform) => (
                        <SelectItem
                          key={platform.id}
                          value={platform.id}
                        >
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Platform Prompts</h3>
            {selectedPlatformIds.map((platformId) => {
              const platform = availablePlatforms.find(
                (p) => p.id === platformId
              );
              if (!platform) return null;

              return (
                <FormField
                  key={platformId}
                  control={form.control}
                  name={`prompts.${platformId}`}
                  render={({ field: { value, onChange, ...field } }) => {
                    const promptContent = value?.content || '';
                    
                    return (
                      <FormItem>
                        <FormLabel>{platform.name} Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`Enter prompt for ${platform.name}`}
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
              );
            })}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  )
} 