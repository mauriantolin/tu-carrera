import { cn } from "@workspace/ui/lib/utils"
import React from "react"

function PageContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
      <div className={cn("relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24", className)} {...props}>
          {children}
      </div>
  )
}

export {
  PageContent
}