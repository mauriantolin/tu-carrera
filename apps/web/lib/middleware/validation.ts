import type { AgentContext } from '../agents/types'

/**
 * Pattern to detect materia codes in text
 * Matches patterns like: ALG101, MAT201, BD301, etc.
 */
const CODIGO_MATERIA_PATTERN = /\b([A-Z]{2,4}\d{3,4})\b/g

/**
 * Extracts unique materia codes from text
 */
export function extractCodigosFromText(text: string): string[] {
  const matches = text.matchAll(CODIGO_MATERIA_PATTERN)
  const codigos = new Set<string>()

  for (const match of matches) {
    if (match[1]) {
      codigos.add(match[1])
    }
  }

  return Array.from(codigos)
}

/**
 * Validates that mentioned materias are not in approved list
 * Returns list of problematic codes
 */
export function findApprovedInText(
  text: string,
  approvedCodes: Set<string>
): string[] {
  const codigosMencionados = extractCodigosFromText(text)
  return codigosMencionados.filter(c => approvedCodes.has(c))
}

/**
 * Creates a warning message for approved materias
 */
export function createApprovedWarning(materiasYaAprobadas: string[]): string {
  if (materiasYaAprobadas.length === 0) return ''

  return materiasYaAprobadas.length === 1
    ? `\n\n**Nota**: La materia ${materiasYaAprobadas[0]} ya esta aprobada.`
    : `\n\n**Nota**: Las materias ${materiasYaAprobadas.join(', ')} ya estan aprobadas.`
}

/**
 * Post-process text to add warnings if approved materias are mentioned
 */
export function addApprovedWarningsToText(
  text: string,
  context: AgentContext | null
): string {
  if (!context || !text) return text

  const approvedCodes = new Set(context.approvedSubjects.map(s => s.code))
  const problemas = findApprovedInText(text, approvedCodes)

  if (problemas.length > 0) {
    return text + createApprovedWarning(problemas)
  }

  return text
}

// Note: Full wrapLanguageModel middleware removed due to AI SDK 6 type complexity
// Validation is handled via the validar_recomendaciones tool and system prompt rules
