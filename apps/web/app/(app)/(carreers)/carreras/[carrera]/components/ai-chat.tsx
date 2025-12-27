"use client"

import { useChat } from '@ai-sdk/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card } from "@workspace/ui/components/card"
import { Send, Loader2, Sparkles, User, Bot } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useRef, useEffect, useState, type FormEvent } from "react"
import ReactMarkdown from 'react-markdown'
import { useAtomValue } from 'jotai'
import { completedSubjectsAtom, curriculumAtom } from '@/atoms/study-plan-atoms'

interface AIChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  careerId?: string
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts) return ''
  return message.parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join('')
}

export function AIChat({ open, onOpenChange, careerId }: AIChatProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const completedSubjects = useAtomValue(completedSubjectsAtom)
  const curriculum = useAtomValue(curriculumAtom)

  const { messages, status, sendMessage } = useChat()

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages, status])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const approvedSubjects = curriculum?.subjects
      .filter(s => completedSubjects.has(s.id))
      .map(s => ({ code: s.codigo, name: s.nombre, year: s.anio })) || []

    const maxYear = curriculum?.subjects
      .reduce((max, s) => Math.max(max, parseInt(s.anio) || 0), 0) || 5

    sendMessage(
      { text: input },
      { body: { careerId, approvedSubjects, maxYear } }
    )
    setInput('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] flex flex-col p-0 z-[100] bg-background/95 backdrop-blur-xl border-l-2 border-primary/20 shadow-2xl"
      >
        <SheetHeader className="p-4 border-b bg-primary/5">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Asistente Académico
          </SheetTitle>
        </SheetHeader>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 bg-background">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">¿En qué puedo ayudarte?</p>
                <p className="text-sm">Preguntame sobre materias, contenidos o correlativas</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "justify-end"
                )}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <Card className={cn(
                  "max-w-[80%] p-3",
                  message.role === "user" && "bg-primary text-primary-foreground"
                )}>
                  {message.role === "assistant" ? (
                    <div className="text-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 max-w-none">
                      <ReactMarkdown>{getMessageText(message)}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{getMessageText(message)}</p>
                  )}
                </Card>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <Card className="p-3">
                  <p className="text-sm text-muted-foreground">Pensando...</p>
                </Card>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 bg-muted/30">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
