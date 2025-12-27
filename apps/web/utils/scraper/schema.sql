-- =============================================================================
-- SCRIPTS SQL PARA BASE DE DATOS RELACIONAL DE CARRERAS UADE
-- Cumple con Primera, Segunda y Tercera Forma Normal (1NF, 2NF, 3NF)
-- =============================================================================

-- Tabla: facultades
-- Almacena información de las facultades
CREATE TABLE IF NOT EXISTS facultades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(500) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: directores
-- Almacena información de directores de carrera
CREATE TABLE IF NOT EXISTS directores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: planes
-- Almacena información de planes de estudio
CREATE TABLE IF NOT EXISTS planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  anio INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: carreras
-- Almacena información de las carreras
CREATE TABLE IF NOT EXISTS carreras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(500) UNIQUE NOT NULL,
  facultad_id UUID REFERENCES facultades(id) ON DELETE SET NULL,
  director_id UUID REFERENCES directores(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES planes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: materias
-- Almacena información de las materias de cada carrera
CREATE TABLE IF NOT EXISTS materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(500) NOT NULL,
  horas INTEGER NOT NULL DEFAULT 0,
  prerrequisitos TEXT,
  href TEXT NOT NULL,
  carrera_id UUID NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  anio VARCHAR(10) NOT NULL,
  cuatrimestre VARCHAR(10) NOT NULL,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(codigo, carrera_id)
);

-- Tabla: contenidos
-- Almacena los contenidos de cada materia (relación 1:N)
CREATE TABLE IF NOT EXISTS contenidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  orden INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(materia_id, orden)
);

-- Tabla: correlativas
-- Relación muchos a muchos entre materias y sus correlativas
CREATE TABLE IF NOT EXISTS correlativas (
  materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  correlativa_codigo VARCHAR(50) NOT NULL,
  correlativa_materia_id UUID REFERENCES materias(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (materia_id, correlativa_codigo)
);

-- Tabla: titulos
-- Almacena los títulos intermedios de cada carrera
CREATE TABLE IF NOT EXISTS titulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(500) NOT NULL,
  carrera_id UUID NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  anio VARCHAR(10) NOT NULL,
  cuatrimestre VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_carreras_facultad ON carreras(facultad_id);
CREATE INDEX IF NOT EXISTS idx_carreras_director ON carreras(director_id);
CREATE INDEX IF NOT EXISTS idx_carreras_plan ON carreras(plan_id);
CREATE INDEX IF NOT EXISTS idx_materias_carrera ON materias(carrera_id);
CREATE INDEX IF NOT EXISTS idx_materias_codigo ON materias(codigo);
CREATE INDEX IF NOT EXISTS idx_materias_anio_cuatrimestre ON materias(anio, cuatrimestre);
CREATE INDEX IF NOT EXISTS idx_contenidos_materia ON contenidos(materia_id);
CREATE INDEX IF NOT EXISTS idx_correlativas_materia ON correlativas(materia_id);
CREATE INDEX IF NOT EXISTS idx_correlativas_codigo ON correlativas(correlativa_codigo);
CREATE INDEX IF NOT EXISTS idx_correlativas_materia_id ON correlativas(correlativa_materia_id);
CREATE INDEX IF NOT EXISTS idx_titulos_carrera ON titulos(carrera_id);

-- =============================================================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =============================================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabla con updated_at
CREATE TRIGGER update_facultades_updated_at
  BEFORE UPDATE ON facultades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_directores_updated_at
  BEFORE UPDATE ON directores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planes_updated_at
  BEFORE UPDATE ON planes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carreras_updated_at
  BEFORE UPDATE ON carreras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materias_updated_at
  BEFORE UPDATE ON materias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_titulos_updated_at
  BEFORE UPDATE ON titulos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Habilitar seguridad a nivel de fila en Supabase
-- =============================================================================

ALTER TABLE facultades ENABLE ROW LEVEL SECURITY;
ALTER TABLE directores ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE titulos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (ajustar según necesidades)
CREATE POLICY "Permitir lectura pública de facultades"
  ON facultades FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de directores"
  ON directores FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de planes"
  ON planes FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de carreras"
  ON carreras FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de materias"
  ON materias FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de contenidos"
  ON contenidos FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de correlativas"
  ON correlativas FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de titulos"
  ON titulos FOR SELECT
  USING (true);

-- =============================================================================
-- COMENTARIOS EN LAS TABLAS Y COLUMNAS
-- =============================================================================

COMMENT ON TABLE facultades IS 'Facultades de UADE';
COMMENT ON TABLE directores IS 'Directores de las carreras';
COMMENT ON TABLE planes IS 'Planes de estudio';
COMMENT ON TABLE carreras IS 'Carreras disponibles en UADE';
COMMENT ON TABLE materias IS 'Materias de cada carrera';
COMMENT ON TABLE contenidos IS 'Contenidos de cada materia';
COMMENT ON TABLE correlativas IS 'Materias correlativas requeridas';
COMMENT ON TABLE titulos IS 'Títulos intermedios obtenibles en cada carrera';

COMMENT ON COLUMN materias.codigo IS 'Código único de la materia (ej: 1.4.128)';
COMMENT ON COLUMN materias.anio IS 'Año del plan de estudios (1, 2, 3, etc.)';
COMMENT ON COLUMN materias.cuatrimestre IS 'Cuatrimestre del año (1 o 2)';
COMMENT ON COLUMN materias.position_x IS 'Posición X pre-calculada para visualización del plan';
COMMENT ON COLUMN materias.position_y IS 'Posición Y pre-calculada para visualización del plan';
COMMENT ON COLUMN contenidos.orden IS 'Orden del contenido en la lista';
COMMENT ON COLUMN correlativas.correlativa_materia_id IS 'UUID de la materia correlativa (resuelto desde correlativa_codigo)';
