import React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const hasCustomRounding = /rounded-(full|none|sm|lg|xl|2xl|3xl)/.test(className);
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200/90 dark:bg-slate-700/60",
        !hasCustomRounding && "rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
