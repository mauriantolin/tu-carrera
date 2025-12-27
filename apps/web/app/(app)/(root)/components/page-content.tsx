import { cn } from "@workspace/ui/lib/utils"

// Generic Section Components
function PageSection({
    className,
    children,
    ...props
}: React.ComponentProps<"section">) {
    return (
        <section className={cn("py-20 lg:py-28", className)} {...props}>
            {children}
        </section>
    )
}

function PageContainer({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("max-w-7xl mx-auto px-6 lg:px-8", className)} {...props}>
            {children}
        </div>
    )
}

function PageSectionHeader({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("text-center space-y-4 mb-16", className)} {...props}>
            {children}
        </div>
    )
}

function PageGrid({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("grid gap-8", className)} {...props}>
            {children}
        </div>
    )
}

function PageCard({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("p-8 rounded-2xl bg-card border border-border", className)} {...props}>
            {children}
        </div>
    )
}

function PageList({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("space-y-6", className)} {...props}>
            {children}
        </div>
    )
}

function PageActions({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("text-center mt-12", className)} {...props}>
            {children}
        </div>
    )
}

// Footer Components (more specific, justified)
function Footer({
    className,
    children,
    ...props
}: React.ComponentProps<"footer">) {
    return (
        <footer className={cn("border-t border-border py-12 lg:py-16", className)} {...props}>
            {children}
        </footer>
    )
}

function FooterGrid({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-8 mb-8", className)} {...props}>
            {children}
        </div>
    )
}

function FooterBottom({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("pt-8 border-t border-border text-center", className)} {...props}>
            {children}
        </div>
    )
}

export {
    // Generic components
    PageSection,
    PageContainer,
    PageSectionHeader,
    PageGrid,
    PageCard,
    PageList,
    PageActions,
    // Footer specific
    Footer,
    FooterGrid,
    FooterBottom,
}
