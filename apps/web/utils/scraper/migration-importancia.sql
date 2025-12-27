-- =============================================
-- Migración: Funciones para análisis de importancia de materias
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Función para obtener materias dependientes (qué materias desbloquea una materia)
CREATE OR REPLACE FUNCTION obtener_dependientes(
  materia_codigo_param VARCHAR,
  carrera_id_param UUID
)
RETURNS TABLE (
  codigo VARCHAR,
  nombre VARCHAR,
  anio VARCHAR,
  cuatrimestre VARCHAR,
  horas INTEGER
)
LANGUAGE sql STABLE
AS $$
  SELECT DISTINCT
    m.codigo,
    m.nombre,
    m.anio,
    m.cuatrimestre,
    m.horas
  FROM correlativas c
  JOIN materias m ON c.materia_id = m.id
  WHERE c.correlativa_codigo = materia_codigo_param
    AND m.carrera_id = carrera_id_param
  ORDER BY m.anio, m.cuatrimestre;
$$;

-- 2. Función para calcular el score de importancia de una materia
-- Score = dependientes_directos + (dependientes_indirectos * 0.5) + bonus por año temprano
CREATE OR REPLACE FUNCTION calcular_importancia_materia(
  materia_codigo_param VARCHAR,
  carrera_id_param UUID
)
RETURNS TABLE (
  dependientes_directos INTEGER,
  dependientes_totales INTEGER,
  score_importancia NUMERIC
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  directos INTEGER;
  totales INTEGER;
  anio_materia INTEGER;
  score NUMERIC;
BEGIN
  -- Contar dependientes directos
  SELECT COUNT(DISTINCT m.id) INTO directos
  FROM correlativas c
  JOIN materias m ON c.materia_id = m.id
  WHERE c.correlativa_codigo = materia_codigo_param
    AND m.carrera_id = carrera_id_param;

  -- Contar dependientes totales (hasta 2 niveles de profundidad)
  WITH RECURSIVE dependencias AS (
    -- Nivel 1: dependientes directos
    SELECT DISTINCT m.id, m.codigo, 1 as nivel
    FROM correlativas c
    JOIN materias m ON c.materia_id = m.id
    WHERE c.correlativa_codigo = materia_codigo_param
      AND m.carrera_id = carrera_id_param

    UNION

    -- Nivel 2+: dependientes de dependientes
    SELECT DISTINCT m.id, m.codigo, d.nivel + 1
    FROM dependencias d
    JOIN correlativas c ON c.correlativa_codigo = d.codigo
    JOIN materias m ON c.materia_id = m.id
    WHERE m.carrera_id = carrera_id_param
      AND d.nivel < 3
  )
  SELECT COUNT(DISTINCT id) INTO totales FROM dependencias;

  -- Obtener año de la materia para bonus
  SELECT COALESCE(m.anio::INTEGER, 1) INTO anio_materia
  FROM materias m
  WHERE m.codigo = materia_codigo_param
    AND m.carrera_id = carrera_id_param
  LIMIT 1;

  -- Calcular score: dependientes + bonus por ser de años tempranos
  -- Materias de 1er año tienen más impacto potencial
  score := directos * 2 + (totales - directos) * 0.5 + (5 - COALESCE(anio_materia, 1)) * 0.3;

  RETURN QUERY SELECT directos, totales, ROUND(score, 2);
END;
$$;

-- 3. Función para obtener las materias más críticas de una carrera
CREATE OR REPLACE FUNCTION obtener_materias_criticas(
  carrera_id_param UUID,
  limite INTEGER DEFAULT 10
)
RETURNS TABLE (
  codigo VARCHAR,
  nombre VARCHAR,
  anio VARCHAR,
  cuatrimestre VARCHAR,
  horas INTEGER,
  dependientes_directos BIGINT,
  score_importancia NUMERIC
)
LANGUAGE sql STABLE
AS $$
  WITH scores AS (
    SELECT
      m.codigo,
      m.nombre,
      m.anio,
      m.cuatrimestre,
      m.horas,
      COUNT(DISTINCT c.materia_id) as deps_directos
    FROM materias m
    LEFT JOIN correlativas c ON c.correlativa_codigo = m.codigo
      AND c.materia_id IN (SELECT id FROM materias WHERE carrera_id = carrera_id_param)
    WHERE m.carrera_id = carrera_id_param
    GROUP BY m.id, m.codigo, m.nombre, m.anio, m.cuatrimestre, m.horas
  )
  SELECT
    s.codigo,
    s.nombre,
    s.anio,
    s.cuatrimestre,
    s.horas,
    s.deps_directos as dependientes_directos,
    ROUND(
      s.deps_directos * 2 +
      (5 - COALESCE(s.anio::INTEGER, 1)) * 0.3,
      2
    ) as score_importancia
  FROM scores s
  WHERE s.deps_directos > 0
  ORDER BY score_importancia DESC, s.anio, s.cuatrimestre
  LIMIT limite;
$$;

-- 4. Función mejorada para analizar una materia completa
CREATE OR REPLACE FUNCTION analizar_materia(
  materia_nombre_param VARCHAR,
  carrera_id_param UUID
)
RETURNS TABLE (
  codigo VARCHAR,
  nombre VARCHAR,
  anio VARCHAR,
  cuatrimestre VARCHAR,
  horas INTEGER,
  prerrequisitos JSON,
  desbloquea JSON,
  dependientes_directos INTEGER,
  dependientes_totales INTEGER,
  score_importancia NUMERIC
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.codigo,
    m.nombre,
    m.anio,
    m.cuatrimestre,
    m.horas,
    -- Prerrequisitos (correlativas)
    COALESCE(
      (SELECT json_agg(json_build_object(
        'codigo', prereq.codigo,
        'nombre', prereq.nombre
      ))
      FROM correlativas c
      JOIN materias prereq ON prereq.id = c.correlativa_materia_id
      WHERE c.materia_id = m.id),
      '[]'::json
    ) as prerrequisitos,
    -- Materias que desbloquea
    COALESCE(
      (SELECT json_agg(json_build_object(
        'codigo', dep.codigo,
        'nombre', dep.nombre,
        'anio', dep.anio
      ))
      FROM correlativas c2
      JOIN materias dep ON dep.id = c2.materia_id
      WHERE c2.correlativa_codigo = m.codigo
        AND dep.carrera_id = carrera_id_param),
      '[]'::json
    ) as desbloquea,
    -- Importancia
    (SELECT ci.dependientes_directos FROM calcular_importancia_materia(m.codigo, carrera_id_param) ci),
    (SELECT ci.dependientes_totales FROM calcular_importancia_materia(m.codigo, carrera_id_param) ci),
    (SELECT ci.score_importancia FROM calcular_importancia_materia(m.codigo, carrera_id_param) ci)
  FROM materias m
  WHERE m.carrera_id = carrera_id_param
    AND m.nombre ILIKE '%' || materia_nombre_param || '%';
END;
$$;

-- 5. Verificar que se crearon las funciones
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'obtener_dependientes',
    'calcular_importancia_materia',
    'obtener_materias_criticas',
    'analizar_materia'
  );
