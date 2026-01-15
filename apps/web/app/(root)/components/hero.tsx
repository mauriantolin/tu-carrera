"use client"

import { Button } from "@workspace/ui/components/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Shimmer } from "@/components/ai-elements/shimmer";
import Image from "next/image";

export function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-48 md:pb-32">
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-muted text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full bg-foreground opacity-75 rounded-full" />
              <span className="relativeinline-flex h-1.5 w-1.5 bg-foreground rounded-full" />
            </span>
            Gratis para siempre
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-balance leading-[1.1]">
            Conseguí tu título de forma <Shimmer duration={3} spread={10}>inteligente</Shimmer>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            Organizá tus materias, seguí tu progreso y hablá con Titulín para ver qué podés cursar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild size="lg" className="text-sm h-11 text-background px-6 rounded-none">
              <Link href="/carreras">
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-sm h-11 px-6 rounded-none bg-transparent">
              <Link href="#how-it-works">Ver cómo funciona</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
              Sin registro
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
              Múltiples carreras
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
              Con AI
            </div>
          </div>
        </div>

        <div className="mt-20 md:mt-32 border border-border bg-muted/20 p-1 dotted-background">
          <div className="aspect-video bg-background border border-border flex items-center justify-center overflow-hidden">
            <Image
              height={720}
              width={1280}
              src="/"
              alt="Vista previa de la aplicación"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
