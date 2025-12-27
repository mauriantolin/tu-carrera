"use client"

import { useAtomValue } from 'jotai'
import { completedSubjectsAtom, curriculumAtom } from '@/atoms/study-plan-atoms'
import { Card } from '@workspace/ui/components/card'
import { CheckCircle2, BookDashed } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

export function ProgressPanel() {
  const completedSubjects = useAtomValue(completedSubjectsAtom)
  const curriculum = useAtomValue(curriculumAtom)

  const total = curriculum?.subjects.length || 0
  const completed = completedSubjects.size
  const remaining = total - completed
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <Card className="absolute top-4 left-4 z-50 p-3 bg-background/95 backdrop-blur-sm border shadow-lg min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <BookDashed className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Progreso</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            percentage === 100 ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{completed}</span> completadas
          </span>
        </div>
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{remaining}</span> restantes
        </div>
      </div>

      {/* Percentage badge */}
      <div className="mt-2 text-center">
        <span className={cn(
          "text-lg font-bold",
          percentage === 100 ? "text-success" : "text-primary"
        )}>
          {percentage}%
        </span>
      </div>
    </Card>
  )
}
