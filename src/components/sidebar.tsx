"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PenLine, ListTodo, Settings, LayoutTemplate, ChevronLeft, ChevronRight, Share2, UserCircle2 } from "lucide-react"
import { useState } from "react"

const navItems = [
  {
    title: "New Post",
    href: "/edit-post",
    icon: PenLine,
  },
  {
    title: "Recent Posts",
    href: "/posts",
    icon: ListTodo,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: LayoutTemplate,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative flex flex-col h-screen px-3 py-4 border-r",
      isCollapsed ? "w-16" : "w-64",
      "transition-all duration-300"
    )}>
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <Link href="/posts" className="text-xl font-bold flex items-center gap-2 pl-3">
            <Share2 className="text-yellow-500" size={20} />
            LeverCast
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-yellow-500"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "text-yellow-500",
              isCollapsed && "justify-center"
            )}
          >
            <item.icon size={20} />
            {!isCollapsed && <span className="text-foreground">{item.title}</span>}
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "text-yellow-500",
            isCollapsed && "justify-center"
          )}
        >
          <UserCircle2 size={24} />
          {!isCollapsed && <span className="text-foreground">Profile</span>}
        </Link>
      </div>
    </div>
  )
} 