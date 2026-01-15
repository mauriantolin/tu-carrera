"use client"

import { useChat } from '@ai-sdk/react'
import { useEffect } from "react"
import { useAtomValue } from 'jotai'
import { completedSubjectsAtom, curriculumAtom } from '@/atoms/study-plan-atoms'
import { Button } from "@workspace/ui/components/button"
import { Sparkles, X, Search, Database, ListOrdered } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Z_INDEX } from "@/lib/constants"

// AI Elements
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning'
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'

interface AIChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  careerId?: string
}

// Types for message parts
interface TextPart {
  type: 'text'
  text: string
}

interface ReasoningPart {
  type: 'reasoning'
  reasoning: string
}

interface ToolInvocationPart {
  type: string // 'tool-${toolName}' format
  toolCallId: string
  state: 'partial-call' | 'call' | 'result' | 'output-available'
  input?: Record<string, unknown>
  output?: unknown
}

type MessagePart = TextPart | ReasoningPart | ToolInvocationPart | { type: string }

function getMessageText(message: { parts?: MessagePart[] }): string {
  if (!message.parts) return ''
  return message.parts
    .filter((part): part is TextPart => part.type === 'text' && 'text' in part)
    .map((part) => part.text)
    .join('')
}

function getReasoningText(message: { parts?: MessagePart[] }): string | null {
  if (!message.parts) return null
  const reasoningPart = message.parts.find(
    (part): part is ReasoningPart => part.type === 'reasoning'
  )
  return reasoningPart?.reasoning || null
}

interface ParsedToolInvocation {
  toolName: string
  toolCallId: string
  state: string
  args?: Record<string, unknown>
  result?: unknown
}

function getToolInvocations(message: { parts?: MessagePart[] }): ParsedToolInvocation[] {
  if (!message.parts) return []
  return message.parts
    .filter((part): part is ToolInvocationPart =>
      part.type.startsWith('tool-') &&
      part.type !== 'tool-invocation' &&
      'toolCallId' in part
    )
    .map((part) => ({
      toolName: part.type.replace('tool-', ''),
      toolCallId: part.toolCallId,
      state: part.state,
      args: part.input,
      result: part.output,
    }))
}

// Map tool names to icons and labels (3 tools only)
const toolConfig: Record<string, { icon: typeof Search; label: string }> = {
  consulta_sql: { icon: Database, label: 'Consultando base de datos' },
  buscar_contenidos: { icon: Search, label: 'Buscando contenidos' },
  ordenar_materias_pendientes: { icon: ListOrdered, label: 'Ordenando materias' },
}

// Format tool arguments for display
function formatToolArgs(args?: Record<string, unknown>): string | null {
  if (!args || Object.keys(args).length === 0) return null
  return Object.entries(args)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(', ')
}

// Summarize tool results based on tool type (3 tools only)
function summarizeToolResult(toolName: string, result: unknown): string | null {
  if (!result) return null

  // Handle errors
  if (typeof result === 'object' && result !== null && 'error' in result) {
    return `Error: ${(result as { error: string }).error}`
  }

  // Summarize based on tool type
  const r = result as Record<string, unknown>
  switch (toolName) {
    case 'consulta_sql':
      return `${r.rowCount || 0} resultados`
    case 'buscar_contenidos':
      return `${(r.resultados as unknown[])?.length || 0} resultados`
    case 'ordenar_materias_pendientes':
      return `${r.total_pendientes || 0} materias en ${r.total_niveles || 0} niveles`
    default:
      return 'Completado'
  }
}

export function AIChat({ open, onOpenChange, careerId }: AIChatProps) {
  const completedSubjects = useAtomValue(completedSubjectsAtom)
  const curriculum = useAtomValue(curriculumAtom)
  const { messages, status, sendMessage } = useChat()
  const isLoading = status === 'streaming' || status === 'submitted'

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  const handleSubmit = (message: PromptInputMessage) => {
    const value = message.text
    if (!value.trim() || isLoading) return

    const approvedSubjects = curriculum?.subjects
      .filter(s => completedSubjects.has(s.id))
      .map(s => ({ code: s.codigo, name: s.nombre, year: s.anio })) || []

    const maxYear = curriculum?.subjects
      .reduce((max, s) => Math.max(max, parseInt(s.anio) || 0), 0) || 5

    sendMessage(
      { text: value },
      { body: { careerId, approvedSubjects, maxYear } }
    )
  }

  if (!open) return null

  return (
    <div className={cn(
      `fixed bottom-15 right-30 z-[${Z_INDEX.FLOATING_CHAT}]`,
      "w-[400px] h-[550px]",
      "flex flex-col",
      "bg-background/95 backdrop-blur-xl",
      "border-2 border-primary/20 rounded-2xl shadow-2xl",
      "animate-in slide-in-from-bottom-5 fade-in-0 duration-300"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary/5 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold">Titulín</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="h-8 w-8 cursor-pointer rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversation (AI Elements) */}
      <Conversation className="flex-1 flex flex-col overflow-hidden">
        <ConversationContent className="flex-1 p-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="h-12 w-12 text-muted-foreground" />}
              title="¿En qué puedo ayudarte?"
              description="Preguntame sobre materias, contenidos o correlativas"
            />
          ) : (
            messages.map((message) => {
              console.log('Mensaje AI Chat:', message)
              const reasoningText = getReasoningText(message)
              const toolInvocations = getToolInvocations(message)
              const textContent = getMessageText(message)
              const isAssistant = message.role === 'assistant'
              const hasToolCalls = toolInvocations.length > 0

              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {/* Reasoning (thinking) del modelo */}
                    {isAssistant && reasoningText && (
                      <Reasoning isStreaming={status === 'streaming'}>
                        <ReasoningTrigger />
                        <ReasoningContent>{reasoningText}</ReasoningContent>
                      </Reasoning>
                    )}

                    {/* Tool invocations como Chain of Thought */}
                    {isAssistant && hasToolCalls && (
                      <ChainOfThought className="mb-3">
                        <ChainOfThoughtHeader>
                          Consultando información...
                        </ChainOfThoughtHeader>
                        <ChainOfThoughtContent>
                          {toolInvocations.map((tool) => {
                            const config = toolConfig[tool.toolName] || {
                              icon: Database,
                              label: tool.toolName,
                            }
                            const Icon = config.icon
                            const isComplete = tool.state === 'result' || tool.state === 'output-available'

                            return (
                              <ChainOfThoughtStep
                                key={tool.toolCallId}
                                icon={Icon}
                                label={config.label}
                                description={isComplete
                                  ? summarizeToolResult(tool.toolName, tool.result)
                                  : formatToolArgs(tool.args)
                                }
                                status={isComplete ? 'complete' : 'active'}
                              />
                            )
                          })}
                        </ChainOfThoughtContent>
                      </ChainOfThought>
                    )}

                    {/* Respuesta de texto */}
                    {textContent && (
                      <MessageResponse>{textContent}</MessageResponse>
                    )}
                  </MessageContent>
                </Message>
              )
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input (AI Elements) */}
      <div className="p-3 border-t bg-muted/30 rounded-b-2xl">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea placeholder="Escribe tu pregunta..." />
          <PromptInputFooter>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
