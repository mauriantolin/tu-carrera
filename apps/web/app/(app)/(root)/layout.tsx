import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"
import Link from "next/link"
import "@workspace/ui/globals.css"
import SiteHeader from "@/components/site-header"
import { CustomCursor } from "@/components/custom-cursor"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Carrera", "Facultad", "UADE", "Plan de Estudios"],
  metadataBase: new URL(siteConfig.url),
  authors: [
    {
      name: "mauriantolin",
      url: "https://twitter.com/mauriantolin",
    },
  ],
  creator: "mauriantolin",
  icons: {
    icon: "/assets/logo.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}


export default function RootAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
    <CustomCursor />
    <SiteHeader>
      <nav className="hidden md:flex items-center gap-8">
            <Link
            href="/#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
            Características
            </Link>
            <Link
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
            Cómo funciona
            </Link>
            <Link
            href="/#faq"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
            FAQ
            </Link>
        </nav>
    </SiteHeader> 
    {children}
    </>
)
}
