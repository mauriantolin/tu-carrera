/**
 * Database Schema for SQL Agent
 * This schema is provided to the LLM to generate valid SQL queries
 */

export const DATABASE_SCHEMA = `
-- =============================================================================
-- SCHEMA: Base de datos academica UADE
-- =============================================================================

-- Tabla: facultades
-- Descripcion: Facultades de la universidad
CREATE TABLE facultades (
  id UUID PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Tabla: carreras
-- Descripcion: Programas academicos/carreras
CREATE TABLE carreras (
  id UUID PRIMARY KEY,
  nombre TEXT NOT NULL,
  facultad_id UUID REFERENCES facultades(id),
  director_id UUID,
  plan_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Tabla: materias
-- Descripcion: Materias/asignaturas de cada carrera
-- IMPORTANTE: Siempre filtrar por carrera_id
CREATE TABLE materias (
  id UUID PRIMARY KEY,
  codigo TEXT NOT NULL,           -- Codigo unico dentro de la carrera (ej: "ALG101")
  nombre TEXT NOT NULL,           -- Nombre de la materia
  horas INTEGER NOT NULL,         -- Carga horaria semanal
  anio TEXT NOT NULL,             -- Año de la carrera (1, 2, 3, 4, 5, 6)
  cuatrimestre TEXT NOT NULL,     -- Cuatrimestre (1, 2, o Anual)
  carrera_id UUID REFERENCES carreras(id),
  position_x INTEGER,             -- Posicion X para visualizacion
  position_y INTEGER,             -- Posicion Y para visualizacion
  href TEXT,                      -- URL del plan de estudios
  prerrequisitos TEXT,            -- Campo legacy (usar tabla correlativas)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Tabla: correlativas
-- Descripcion: Prerrequisitos entre materias (que materias necesitas aprobar antes)
-- IMPORTANTE: materia_id es la materia que REQUIERE la correlativa
CREATE TABLE correlativas (
  materia_id UUID REFERENCES materias(id),    -- Materia que tiene el prerrequisito
  correlativa_codigo TEXT NOT NULL,            -- Codigo de la materia prerrequisito
  correlativa_materia_id UUID REFERENCES materias(id), -- UUID del prerrequisito (puede ser NULL)
  created_at TIMESTAMPTZ,
  PRIMARY KEY (materia_id, correlativa_codigo)
);

-- Tabla: contenidos
-- Descripcion: Temas/unidades de cada materia
CREATE TABLE contenidos (
  id UUID PRIMARY KEY,
  materia_id UUID REFERENCES materias(id),
  contenido TEXT NOT NULL,        -- Descripcion del contenido/tema
  orden INTEGER NOT NULL,         -- Orden del contenido en el programa
  embedding VECTOR(1536),         -- Embedding para busqueda semantica
  created_at TIMESTAMPTZ
);

-- Tabla: titulos
-- Descripcion: Titulos intermedios obtenibles durante la carrera
CREATE TABLE titulos (
  id UUID PRIMARY KEY,
  nombre TEXT NOT NULL,
  carrera_id UUID REFERENCES carreras(id),
  anio TEXT NOT NULL,             -- Año en que se obtiene
  cuatrimestre TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- =============================================================================
-- REGLAS ESTRICTAS PARA GENERAR QUERIES
-- =============================================================================

-- 1. SOLO queries SELECT (read-only) - NUNCA INSERT, UPDATE, DELETE, DROP, ALTER
-- 2. SIEMPRE filtrar por carrera_id cuando consultes materias
-- 3. Usar ILIKE para busquedas de texto (insensible a mayusculas)
-- 4. Limitar resultados con LIMIT (maximo 50 filas)
-- 5. Ordenar por anio, cuatrimestre para materias
-- 6. NO acceder a tablas del sistema (pg_*)
-- 7. NO usar funciones que modifiquen datos

-- =============================================================================
-- EJEMPLOS DE QUERIES VALIDAS
-- =============================================================================

-- Contar materias de la carrera:
-- SELECT COUNT(*) as total_materias FROM materias WHERE carrera_id = 'uuid-carrera';

-- Materias por año:
-- SELECT anio, COUNT(*) as cantidad FROM materias WHERE carrera_id = 'uuid-carrera' GROUP BY anio ORDER BY anio;

-- Total de horas de un año:
-- SELECT SUM(horas) as total_horas FROM materias WHERE carrera_id = 'uuid-carrera' AND anio = '3';

-- Buscar materia por nombre:
-- SELECT codigo, nombre, anio, horas FROM materias WHERE carrera_id = 'uuid-carrera' AND nombre ILIKE '%programacion%';

-- Materias sin correlativas (primer año generalmente):
-- SELECT m.codigo, m.nombre FROM materias m
-- LEFT JOIN correlativas c ON m.id = c.materia_id
-- WHERE m.carrera_id = 'uuid-carrera' AND c.materia_id IS NULL;

-- Materias que desbloquea una correlativa:
-- SELECT m.codigo, m.nombre, m.anio FROM materias m
-- JOIN correlativas c ON m.id = c.materia_id
-- WHERE c.correlativa_codigo = 'ALG101' AND m.carrera_id = 'uuid-carrera';

-- Promedio de horas por año:
-- SELECT anio, ROUND(AVG(horas), 2) as promedio_horas FROM materias
-- WHERE carrera_id = 'uuid-carrera' GROUP BY anio ORDER BY anio;
`

/**
 * Schema for SQL query generation
 */
export const SQL_QUERY_SCHEMA = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Query SQL SELECT valida'
    },
    explanation: {
      type: 'string',
      description: 'Explicacion breve de que hace la query'
    }
  },
  required: ['query', 'explanation']
}

/**
 * Validates that a query is read-only (SELECT only)
 */
export function isReadOnlyQuery(query: string): boolean {
  const normalizedQuery = query.toUpperCase().trim()

  // Must start with SELECT
  if (!normalizedQuery.startsWith('SELECT')) {
    return false
  }

  // Must not contain dangerous keywords
  const forbiddenKeywords = [
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'ALTER',
    'CREATE',
    'TRUNCATE',
    'GRANT',
    'REVOKE',
    'EXECUTE',
    'INTO', // SELECT INTO
  ]

  return !forbiddenKeywords.some(keyword =>
    new RegExp(`\\b${keyword}\\b`).test(normalizedQuery)
  )
}

/**
 * Sanitizes a query by adding LIMIT if not present
 */
export function sanitizeQuery(query: string, maxLimit: number = 50): string {
  const upperQuery = query.toUpperCase()

  // If no LIMIT, add one
  if (!upperQuery.includes('LIMIT')) {
    return `${query.trim()} LIMIT ${maxLimit}`
  }

  return query
}
