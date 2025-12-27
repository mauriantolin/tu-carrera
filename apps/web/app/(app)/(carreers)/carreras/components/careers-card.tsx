"use client"

import { Carrera } from "@/lib/types"
import { Button } from "@workspace/ui/components/button"
import { GraduationCap, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition } from "react"

export function CareerCard({ career, onOpenChange }: {career: Carrera, onOpenChange: (open: boolean) => void }) {
    const router = useRouter()

    const handleCareerSelect = (careerId: string) => {
        onOpenChange(false)
        startTransition(() => {
        router.push(`/carreras/${careerId}`)
    })
  }
  
    return (
        <div
        key={career.id}
        className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-foreground/20 hover:bg-muted/30 transition-all group cursor-pointer"
        onClick={() => handleCareerSelect(career.id)}
        >
            <div className="flex items-center gap-4">
                <div className="rounded-lg bg-foreground/5 p-2 group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5 text-foreground" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">{career.nombre}</h3>
                    <p className="text-sm text-muted-foreground">Ver plan de estudios completo</p>
                </div>
            </div>
            <Button
                size="sm"
                variant="ghost"
                className="group-hover:bg-foreground group-hover:text-background"
            >
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

