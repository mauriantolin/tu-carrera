import { Inter, Besley, Instrument_Serif, Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"
import "@/styles/globals.css"
import "@workspace/ui/styles/globals.css"
import { Providers } from "@/components/providers"
import SiteHeader from "@/components/site-header"
import Link from "next/link"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const besley = Besley({
  subsets: ["latin"],
  variable: "--font-display",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: ["Carrera", "Facultad", "UADE", "Plan de Estudios", "Titulo"],
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${inter.variable} ${besley.variable} ${instrumentSerif.variable} font-sans antialiased pt-24`}
      >
        <Providers>
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
        </Providers>
      </body>
    </html>
  )
}
