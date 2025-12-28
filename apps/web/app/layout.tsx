import { Inter, Besley, Instrument_Serif, Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"


import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"

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
        className={`${fontSans.variable} ${fontMono.variable} ${inter.variable} ${besley.variable} ${instrumentSerif.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
