import Link from "next/link"

import { ModeSwitcher } from "@/components/mode-switcher"
// import blocks from "@/registry/__blocks__.json"
import { Button } from "@workspace/ui/components/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export default function SiteHeader({
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
) {

  return (
    <header className="sticky top-5 z-50 px-6 lg:px-8" {...props}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between rounded-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/30 shadow-lg border border-border">
        <Link href="/" className="flex items-center gap-3 group">
            <Image src="/assets/logo.png" alt="Logo de TuCarrera" width={76} height={76}/>
        </Link>

        {children}

        <div className="flex items-center gap-4">
        <ModeSwitcher />

        <Button asChild size="sm" className="bg-foreground hover:bg-foreground/90 text-background">
            <Link href="/carreras">
            Carreras
            <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
        </div>
        </div>
    </header>
  )
}