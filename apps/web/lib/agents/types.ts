import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export interface AgentContext {
  careerId: string
  approvedSubjects: ApprovedSubject[]
  maxYear: number
  supabase: SupabaseClient
}

export interface ApprovedSubject {
  code: string
  name: string
  year: string
}

// =============================================================================
// ZOD SCHEMAS - Reusable for tool validation
// =============================================================================

/**
 * Basic materia schema
 */
export const MateriaSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  anio: z.string(),
  cuatrimestre: z.string(),
  horas: z.number(),
})

/**
 * Materia with scoring information
 */
export const MateriaConScoreSchema = MateriaSchema.extend({
  score_final: z.number(),
  score_impacto: z.number().optional(),
  score_proximidad: z.number().optional(),
  dependientes_directos: z.number(),
  razon: z.string(),
})

/**
 * Materia for validation input (partial)
 */
export const MateriaParaValidarSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  score_final: z.number().optional(),
})

/**
 * Validation error types
 */
export const ValidationErrorTypeSchema = z.enum([
  'NOT_IN_CATALOG',
  'ALREADY_APPROVED',
  'MISSING_CORRELATIVAS',
  'INVALID_SCORE'
])

/**
 * Single validation error
 */
export const ValidationErrorSchema = z.object({
  codigo: z.string(),
  tipo: ValidationErrorTypeSchema,
  mensaje: z.string(),
})

/**
 * Complete validation result
 */
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  validMaterias: z.array(MateriaConScoreSchema),
  errors: z.array(ValidationErrorSchema),
})

/**
 * SQL query result
 */
export const SQLQueryResultSchema = z.object({
  query: z.string(),
  data: z.array(z.record(z.unknown())),
  rowCount: z.number(),
  error: z.string().optional(),
})

/**
 * Output schema for obtener_mejores_materias
 */
export const MejoresMateriasOutputSchema = z.object({
  mejores_materias: z.array(MateriaConScoreSchema),
  total_disponibles: z.number(),
  criterio: z.string(),
})

/**
 * Output schema for obtener_materias_disponibles
 */
export const MateriasDisponiblesOutputSchema = z.object({
  materias_disponibles: z.array(MateriaConScoreSchema),
  total_disponibles: z.number(),
  total_aprobadas: z.number(),
})

/**
 * Output schema for analizar_materia
 */
export const AnalisisMateriaOutputSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  anio: z.string(),
  cuatrimestre: z.string(),
  horas: z.number(),
  prerrequisitos: z.array(z.object({
    codigo: z.string(),
    nombre: z.string(),
  })),
  desbloquea: z.array(z.object({
    codigo: z.string(),
    nombre: z.string(),
    anio: z.string().optional(),
  })),
  dependientes_directos: z.number(),
  score_importancia: z.number(),
})

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Materia = z.infer<typeof MateriaSchema>
export type MateriaConScore = z.infer<typeof MateriaConScoreSchema>
export type MateriaParaValidar = z.infer<typeof MateriaParaValidarSchema>
export type ValidationErrorType = z.infer<typeof ValidationErrorTypeSchema>
export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type ValidationResult = z.infer<typeof ValidationResultSchema>
export type SQLQueryResult = z.infer<typeof SQLQueryResultSchema>
export type MejoresMateriasOutput = z.infer<typeof MejoresMateriasOutputSchema>
export type MateriasDisponiblesOutput = z.infer<typeof MateriasDisponiblesOutputSchema>
export type AnalisisMateriaOutput = z.infer<typeof AnalisisMateriaOutputSchema>
