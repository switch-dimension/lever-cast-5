"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PenLine, ListTodo, Settings, LayoutTemplate, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { useState } from "react"
import { UserButton } from "@clerk/nextjs"

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
      "relative flex flex-col h-screen px-3 py-4 border-r bg-zinc-800 border-zinc-500",
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
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                "hover:bg-zinc-900 hover:text-yellow-500",
                isActive ? "bg-accent text-black" : "text-yellow-500",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon size={20} className={isActive ? "text-black" : ""} />
              {!isCollapsed && <span className={isActive ? "text-black" : "text-foreground"}>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto">
        <div className={cn(
          "flex items-center px-3 py-2",
          isCollapsed && "justify-center"
        )}>
          <UserButton afterSignOutUrl="/" />
          {!isCollapsed && <span className="ml-3 text-foreground">Profile</span>}
        </div>
      </div>
    </div>
  )
} 