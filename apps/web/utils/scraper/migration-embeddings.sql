-- =============================================
-- Migración: Agregar soporte de embeddings para semantic search
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Habilitar extensión pgvector (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Agregar columna embedding a la tabla contenidos
ALTER TABLE contenidos
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Crear índice HNSW para búsqueda rápida por similitud
-- (HNSW es más rápido que IVFFlat para datasets pequeños/medianos)
CREATE INDEX IF NOT EXISTS idx_contenidos_embedding
ON contenidos USING hnsw (embedding vector_cosine_ops);

-- 4. Función RPC para semantic search filtrado por carrera
CREATE OR REPLACE FUNCTION search_contenidos(
  query_embedding vector(1536),
  carrera_id_filter uuid DEFAULT NULL,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  materia_id uuid,
  contenido text,
  similarity float,
  materia_nombre text,
  materia_codigo text,
  carrera_nombre text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.id,
    c.materia_id,
    c.contenido,
    1 - (c.embedding <=> query_embedding) as similarity,
    m.nombre as materia_nombre,
    m.codigo as materia_codigo,
    ca.nombre as carrera_nombre
  FROM contenidos c
  JOIN materias m ON c.materia_id = m.id
  JOIN carreras ca ON m.carrera_id = ca.id
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
    AND (carrera_id_filter IS NULL OR m.carrera_id = carrera_id_filter)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. Verificar que se creó correctamente
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'contenidos'
  AND column_name = 'embedding';
