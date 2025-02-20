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
  prompts: z.record(z.string(), z.string()),
})

type FormData = z.infer<typeof formSchema>

interface TemplateFormProps {
  template?: Template & { platforms: SocialMediaPlatform[] }
  availablePlatforms: SocialMediaPlatform[]
}

export function TemplateForm({ template, availablePlatforms }: TemplateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      platformIds: template?.platforms.map(p => p.id) || [],
      prompts: (template?.prompts as Record<string, string>) || {},
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const url = template
        ? `/api/templates/${template.id}`
        : "/api/templates"
      const method = template ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save template")
      }

      toast.success(
        template
          ? "Template updated successfully"
          : "Template created successfully"
      )
      router.push("/templates")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlatformIds = form.watch("platformIds")

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
              )
              if (!platform) return null

              return (
                <FormField
                  key={platformId}
                  control={form.control}
                  name={`prompts.${platformId}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{platform.name} Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Enter prompt for ${platform.name}`}
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
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