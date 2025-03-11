import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: number
  text?: string
  className?: string
  fullPage?: boolean
}

export function LoadingSpinner({ 
  size = 24, 
  text = "Loading...", 
  className = "",
  fullPage = false
}: LoadingSpinnerProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`h-${size/4} w-${size/4} animate-spin text-muted-foreground`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        {content}
      </div>
    )
  }

  return content
} 