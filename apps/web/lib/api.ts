import { createClientDb } from '@/utils/db/server'
import type {
  Facultad,
  Carrera,
  Materia,
  Director,
  Plan,
  Contenido,
  Correlativa,
  Titulo,
  CarreraWithRelations,
  MateriaWithRelations,
  FacultadConCarreras,
  MateriaDetalle,
} from './types'

// =============================================================================
// FACULTADES QUERIES
// =============================================================================

/**
 * Get all facultades
 */
export async function getFacultades(): Promise<Facultad[]> {
  'use cache'
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('facultades')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Get facultad by ID
 */
export async function getFacultadById(id: string): Promise<Facultad | null> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('facultades')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get facultades with their carreras
 */
export async function getFacultadesWithCarreras(): Promise<FacultadConCarreras[]> {
  'use cache'
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('facultades')
    .select(`
      *,
      carreras (
        id,
        nombre,
        plan_id,
        director_id,
        created_at,
        updated_at
      )
    `)
    .order('nombre')

  if (error) throw error
  return data || []
}

// =============================================================================
// CARRERAS QUERIES
// =============================================================================

/**
 * Get all carreras
 */
export async function getCarreras(): Promise<Carrera[]> {
  'use cache'
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('carreras')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Get carrera by ID
 */
export async function getCarreraById(id: string): Promise<Carrera | null> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('carreras')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get carrera with all relations
 */
export async function getCarreraWithRelations(id: string): Promise<CarreraWithRelations | null> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('carreras')
    .select(`
      *,
      facultad:facultades(*),
      director:directores(*),
      plan:planes(*),
      materias(*),
      titulos(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get carreras by facultad ID
 */
export async function getCarrerasByFacultad(facultadId: string): Promise<Carrera[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('carreras')
    .select('*')
    .eq('facultad_id', facultadId)
    .order('nombre')

  if (error) throw error
  return data || []
}

// =============================================================================
// MATERIAS QUERIES
// =============================================================================

/**
 * Get all materias for a carrera
 */
export async function getMateriasByCarrera(carreraId: string): Promise<Materia[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .eq('carrera_id', carreraId)
    .order('anio')
    .order('cuatrimestre')

  if (error) throw error
  return data || []
}

/**
 * Get materia by ID
 */
export async function getMateriaById(id: string): Promise<Materia | null> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get materia with all relations
 */
export async function getMateriaWithRelationsById(id: string): Promise<MateriaWithRelations | null> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('materias')
    .select(`
      *,
      carrera:carreras(*),
      contenidos(*),
      correlativas!correlativas_materia_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get all materias with all relations
 */
export async function getMateriasWithRelations(id: string): Promise<Omit<MateriaWithRelations, 'carrera'>[] | null> {
  'use cache'
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('materias')
    .select(`
      *,
      contenidos(*),
      correlativas!correlativas_materia_id_fkey(*)
    `)
    .eq('carrera_id', id)

  if (error) throw error
  return data
}

/**
 * Get materia detalle (with contenidos and correlativas arrays)
 */
export async function getMateriaDetalle(id: string): Promise<MateriaDetalle | null> {
  const supabase = await createClientDb()

  // Get materia
  const { data: materia, error: materiaError } = await supabase
    .from('materias')
    .select('*')
    .eq('id', id)
    .single()

  if (materiaError) throw materiaError
  if (!materia) return null

  // Get contenidos
  const { data: contenidos, error: contenidosError } = await supabase
    .from('contenidos')
    .select('*')
    .eq('materia_id', id)
    .order('orden')

  if (contenidosError) throw contenidosError

  // Get correlativas
  const { data: correlativas, error: correlativasError } = await supabase
    .from('correlativas')
    .select('correlativa_codigo')
    .eq('materia_id', id)

  if (correlativasError) throw correlativasError

  return {
    ...materia,
    contenidos: contenidos || [],
    correlativas: correlativas?.map(c => c.correlativa_codigo) || [],
  }
}

/**
 * Get materias by year and semester
 */
export async function getMateriasByAnioYCuatrimestre(
  carreraId: string,
  anio: string,
  cuatrimestre: string
): Promise<Materia[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .eq('carrera_id', carreraId)
    .eq('anio', anio)
    .eq('cuatrimestre', cuatrimestre)

  if (error) throw error
  return data || []
}

// =============================================================================
// DIRECTORES QUERIES
// =============================================================================

/**
 * Get all directores
 */
export async function getDirectores(): Promise<Director[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('directores')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Get director by ID
 */
export async function getDirectorById(id: string): Promise<Director | null> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('directores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// =============================================================================
// PLANES QUERIES
// =============================================================================

/**
 * Get all planes
 */
export async function getPlanes(): Promise<Plan[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('planes')
    .select('*')
    .order('anio', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get plan by ID
 */
export async function getPlanById(id: string): Promise<Plan | null> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('planes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// =============================================================================
// CONTENIDOS QUERIES
// =============================================================================

/**
 * Get contenidos by materia ID
 */
export async function getContenidosByMateria(materiaId: string): Promise<Contenido[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('contenidos')
    .select('*')
    .eq('materia_id', materiaId)
    .order('orden')

  if (error) throw error
  return data || []
}

// =============================================================================
// CORRELATIVAS QUERIES
// =============================================================================

/**
 * Get correlativas by materia ID
 */
export async function getCorrelativasByMateria(materiaId: string): Promise<Correlativa[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('correlativas')
    .select('*')
    .eq('materia_id', materiaId)

  if (error) throw error
  return data || []
}

/**
 * Get materias that have a specific materia as correlativa
 */
export async function getMateriasDependant(correlativaCodigo: string): Promise<string[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('correlativas')
    .select('materia_id')
    .eq('correlativa_codigo', correlativaCodigo)

  if (error) throw error
  return data?.map(c => c.materia_id) || []
}

// =============================================================================
// TITULOS QUERIES
// =============================================================================

/**
 * Get titulos by carrera ID
 */
export async function getTitulosByCarrera(carreraId: string): Promise<Titulo[]> {
  const supabase = await createClientDb()
  const { data, error } = await supabase
    .from('titulos')
    .select('*')
    .eq('carrera_id', carreraId)
    .order('anio')

  if (error) throw error
  return data || []
}

// =============================================================================
// COMPLEX QUERIES
// =============================================================================

/**
 * Search materias by name or code
 */
export async function searchMaterias(
  query: string,
  carreraId?: string
): Promise<Materia[]> {
  const supabase = await createClientDb()

  let queryBuilder = supabase
    .from('materias')
    .select('*')
    .or(`nombre.ilike.%${query}%,codigo.ilike.%${query}%`)

  if (carreraId) {
    queryBuilder = queryBuilder.eq('carrera_id', carreraId)
  }

  const { data, error } = await queryBuilder.limit(20)

  if (error) throw error
  return data || []
}

/**
 * Get carrera with materias grouped by year and semester
 */
export async function getCarreraWithMateriasAgrupadas(carreraId: string) {
  const materias = await getMateriasByCarrera(carreraId)

  const grouped = materias.reduce((acc, materia) => {
    const key = `${materia.anio}-${materia.cuatrimestre}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(materia)
    return acc
  }, {} as Record<string, Materia[]>)

  return grouped
}

/**
 * Get statistics for a carrera
 */
export async function getCarreraStats(carreraId: string) {
  const materias = await getMateriasByCarrera(carreraId)

  return {
    total_materias: materias.length,
    total_horas: materias.reduce((sum, m) => sum + m.horas, 0),
    por_anio: materias.reduce((acc, m) => {
      acc[m.anio] = (acc[m.anio] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}
