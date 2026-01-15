"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { CheckCircle2, Lock, Info, ChevronUp, ChevronDown } from "lucide-react"

interface SubjectNodeData {
  label: string
  code: string
  hours: number
  isCompleted: boolean
  isAvailable: boolean
  isBlocked: boolean
  correlatives: string[]
  completedCorrelatives: number
  isShaking: boolean
  shakingColor: 'red' | 'green'
  onToggle: () => void
  onShowInfo: () => void
}

export const SubjectNode = memo(({ data }: { data: SubjectNodeData }) => {
  const {
    label,
    code,
    hours,
    isCompleted,
    isAvailable,
    isBlocked,
    correlatives,
    completedCorrelatives,
    isShaking,
    shakingColor,
    onToggle,
    onShowInfo,
  } = data

  const handleClick = () => {
    onToggle()
  }

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShowInfo()
  }

  // Handle superior = entrada (materias de años anteriores)
  const getTopHandleColor = () => {
    if (!correlatives || correlatives.length === 0) {
      return "!bg-blocked"
    } else if (isAvailable) {
      return "!bg-success"
    } else if (correlatives.length >= 2 && completedCorrelatives > 0) {
      return "!bg-destructive"
    } else {
      return "!bg-blocked"
    }
  }

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className={cn("!outline-none !border-0 !w-3 !h-3", getTopHandleColor())}
      />

      <Card
        onClick={handleClick}
        className={cn(
          "min-w-[300px] max-w-[650px] cursor-pointer transition-all hover:shadow-xl focus:outline-none focus-visible:outline-none border-2 bg-background p-0 overflow-hidden",
          isCompleted && "border-success shadow-success/20",
          isAvailable && !isCompleted && "border-accent shadow-accent/20",
          isBlocked && "border-blocked opacity-70 cursor-not-allowed",
          isShaking && shakingColor === 'red' && "!border-red-500 shake-animation !shadow-[0_0_25px_rgba(239,68,68,0.5),0_0_50px_rgba(239,68,68,0.3),0_0_75px_rgba(239,68,68,0.15)]",
          isShaking && shakingColor === 'green' && "!border-green-500 shake-animation !shadow-[0_0_25px_rgba(34,197,94,0.5),0_0_50px_rgba(34,197,94,0.3),0_0_75px_rgba(34,197,94,0.15)]",
        )}
      >
        <div className={cn(
          "p-5",
          isCompleted && "bg-success/20",
          isAvailable && !isCompleted && "bg-accent/15",
          isBlocked && "bg-blocked/15",
          isShaking && shakingColor === 'red' && "bg-red-500/10",
          isShaking && shakingColor === 'green' && "bg-green-500/10",
        )}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl text-muted-foreground font-bold ">{code}</span>
                {isCompleted && <CheckCircle2 className="h-7 w-7 text-xl text-success" />}
                {isBlocked && <Lock className="h-7 w-7 text-blocked text-xl" />}
              </div>
              <h3 className="text-5xl font-bold leading-tight text-foreground break-words">{label}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 focus:outline-none hover:bg-foreground/10"
              onClick={handleInfo}
            >
            <Info className="min-h-10 min-w-10" strokeWidth={2} />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline" className="text-3xl font-semibold border-border/50 px-3 py-1">
              {hours}hs
            </Badge>
            <span className="text-3xl font-medium text-muted-foreground">
              {isCompleted ? "Cursada" : isAvailable ? "Disponible" : "Bloqueada"}
            </span>
          </div>

          {/*<div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 focus:outline-none hover:bg-foreground/10 hover:text-foreground"
                onClick={(e: React.MouseEvent) => handleVote(e, 1)}
              >
                <ChevronUp className="h-6 w-6 text-2xl" />
              </Button>
              <span className="text-2xl font-bold min-w-[32px] text-center text-foreground">{votes}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 focus:outline-none hover:bg-destructive/20 hover:text-destructive"
                onClick={(e: React.MouseEvent) => handleVote(e, -1)}
              >
                <ChevronDown className="h-6 w-6 text-2xl" />
              </Button>
            </div>
            <span className="text-2xl font-medium text-muted-foreground">votos</span>
          </div>*/}
        </div>
      </Card>

      <Handle type="source" position={Position.Bottom} className="!bg-foreground !outline-none !border-0 !w-3 !h-3" />
    </div>
  )
})

SubjectNode.displayName = "SubjectNode"
