import { cn } from "@workspace/ui/lib/utils"

function PageHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("relative overflow-hidden", className)} {...props}>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
                {children}
            </div>
        </div>
    </section>
  )
}

function PageHeaderHeading({
    className,
    ...props
}: React.ComponentProps<"h1">) {
    return (
        <h1 className={cn("font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-foreground leading-[1.1] text-balance tracking-tight", className)} 
        {...props}
        />
    )
}

function PageHeaderAlert({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-foreground text-sm font-medium", className)} 
        {...props}
        />
    )
}

function PageHeaderDescription({
    className,
    ...props
}: React.ComponentProps<"p">) {
    return (
        <p className={cn("text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed", className)} 
        {...props}
        />
    )
}

function PageHeaderActions({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-center gap-4 pt-4", className)} 
        {...props}
        />
    )
}

function PageHeaderFeatures({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (    
        <div className={cn("flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground", className)} 
        {...props}
        />
    )
}

export {
    PageHeader,
    PageHeaderHeading,
    PageHeaderAlert,
    PageHeaderDescription,
    PageHeaderActions,
    PageHeaderFeatures,
}
