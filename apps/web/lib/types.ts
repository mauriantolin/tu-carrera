// =============================================================================
// DATABASE TYPES - Generated from Supabase Schema
// =============================================================================

/**
 * Base type for database tables with timestamps
 */
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

/**
 * Base type for database tables with only created_at
 */
export interface CreatedEntity {
  id: string
  created_at: string
}

// =============================================================================
// TABLE TYPES
// =============================================================================

/**
 * Facultad (Faculty)
 * Represents a faculty/school within UADE
 */
export interface Facultad extends BaseEntity {
  nombre: string
}

/**
 * Director (Program Director)
 * Represents a program director
 */
export interface Director extends BaseEntity {
  nombre: string
  email: string
}

/**
 * Plan (Study Plan)
 * Represents a curriculum/study plan
 */
export interface Plan extends BaseEntity {
  codigo: string
  anio: number
}

/**
 * Carrera (Career/Degree Program)
 * Represents a degree program
 */
export interface Carrera extends BaseEntity {
  nombre: string
  facultad_id: string | null
  director_id: string | null
  plan_id: string | null
}

/**
 * Materia (Course/Subject)
 * Represents a course within a degree program
 */
export interface Materia extends BaseEntity {
  codigo: string
  nombre: string
  horas: number
  prerrequisitos: string | null
  href: string
  carrera_id: string
  anio: string
  cuatrimestre: string
  position_x: number
  position_y: number
}

/**
 * Contenido (Course Content)
 * Represents content items for a course
 */
export interface Contenido extends CreatedEntity {
  materia_id: string
  contenido: string
  orden: number
}

/**
 * Correlativa (Prerequisite)
 * Represents prerequisite relationships between courses
 */
export interface Correlativa {
  materia_id: string
  correlativa_codigo: string
  correlativa_materia_id: string | null
  created_at: string
}

/**
 * Titulo (Intermediate Title/Degree)
 * Represents intermediate degrees/titles obtainable
 */
export interface Titulo extends BaseEntity {
  nombre: string
  carrera_id: string
  anio: string
  cuatrimestre: string | null
}

// =============================================================================
// EXTENDED TYPES WITH RELATIONSHIPS
// =============================================================================

/**
 * Carrera with related entities
 */
export interface CarreraWithRelations extends Carrera {
  facultad?: Facultad | null
  director?: Director | null
  plan?: Plan | null
  materias?: Materia[]
  titulos?: Titulo[]
}

/**
 * Materia with related entities
 */
export interface MateriaWithRelations extends Materia {
  carrera?: Carrera
  contenidos?: Contenido[]
  correlativas?: Correlativa[]
}

/**
 * Facultad with list of carreras
 */
export interface FacultadConCarreras extends Facultad {
  carreras?: Carrera[]
}

// =============================================================================
// INSERT TYPES (without id, created_at, updated_at)
// =============================================================================

export type FacultadInsert = Omit<Facultad, 'id' | 'created_at' | 'updated_at'>
export type DirectorInsert = Omit<Director, 'id' | 'created_at' | 'updated_at'>
export type PlanInsert = Omit<Plan, 'id' | 'created_at' | 'updated_at'>
export type CarreraInsert = Omit<Carrera, 'id' | 'created_at' | 'updated_at'>
export type MateriaInsert = Omit<Materia, 'id' | 'created_at' | 'updated_at'>
export type ContenidoInsert = Omit<Contenido, 'id' | 'created_at'>
export type CorrelativaInsert = Omit<Correlativa, 'created_at'>
export type TituloInsert = Omit<Titulo, 'id' | 'created_at' | 'updated_at'>

// =============================================================================
// UPDATE TYPES (all fields optional except id)
// =============================================================================

export type FacultadUpdate = Partial<FacultadInsert>
export type DirectorUpdate = Partial<DirectorInsert>
export type PlanUpdate = Partial<PlanInsert>
export type CarreraUpdate = Partial<CarreraInsert>
export type MateriaUpdate = Partial<MateriaInsert>
export type ContenidoUpdate = Partial<Omit<Contenido, 'id' | 'created_at'>>
export type TituloUpdate = Partial<TituloInsert>

// =============================================================================
// QUERY RESULT TYPES
// =============================================================================

/**
 * Grouped carreras by facultad
 */
export interface FacultadWithCarreras {
  facultad: Facultad
  carreras: Carrera[]
}

/**
 * Materia with all related data for display
 */
export interface MateriaDetalle extends Materia {
  contenidos: Contenido[]
  correlativas: string[] // Array of prerequisite codes
}

/**
 * Carrera summary for listings
 */
export interface CarreraSummary {
  id: string
  nombre: string
  facultad_nombre: string
  plan_codigo: string | null
  plan_anio: number | null
  total_materias: number
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Database tables enum
 */
export enum Tables {
  FACULTADES = 'facultades',
  DIRECTORES = 'directores',
  PLANES = 'planes',
  CARRERAS = 'carreras',
  MATERIAS = 'materias',
  CONTENIDOS = 'contenidos',
  CORRELATIVAS = 'correlativas',
  TITULOS = 'titulos',
}

/**
 * Type for database table names
 */
export type TableName = `${Tables}`
