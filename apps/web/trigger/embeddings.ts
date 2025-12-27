import { task, logger } from "@trigger.dev/sdk/v3";
import type { SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

async function getSupabase(): Promise<SupabaseClient> {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase no configurado');
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(url, key);
  return supabase;
}

// ============= TIPOS =============

interface MateriaParaEmbedding {
  id: string;
  codigo: string;
  nombre: string;
  horas: number;
  anio: string;
  cuatrimestre: string;
  contenido: string;
  carrera_nombre: string;
  facultad_nombre: string;
}

// ============= CHUNK BUILDER =============

function construirChunkParaEmbedding(materia: MateriaParaEmbedding): string {
  return `Facultad: ${materia.facultad_nombre}
Carrera: ${materia.carrera_nombre}
Materia: ${materia.nombre} (${materia.codigo})
Año: ${materia.anio}, Cuatrimestre: ${materia.cuatrimestre}
Carga horaria: ${materia.horas} horas

Contenidos: ${materia.contenido}`.trim();
}

// ============= DATABASE =============

async function obtenerMateriasParaEmbedding(): Promise<MateriaParaEmbedding[]> {
  const db = await getSupabase();

  // Obtener contenidos que no tienen embedding
  const { data, error } = await db
    .from('contenidos')
    .select(`
      id,
      contenido,
      materia:materias!inner (
        id,
        codigo,
        nombre,
        horas,
        anio,
        cuatrimestre,
        carrera:carreras!inner (
          nombre,
          facultad:facultades!inner (
            nombre
          )
        )
      )
    `)
    .is('embedding', null)
    .not('contenido', 'is', null)
    .neq('contenido', '');

  if (error) throw error;
  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    codigo: row.materia.codigo,
    nombre: row.materia.nombre,
    horas: row.materia.horas,
    anio: row.materia.anio,
    cuatrimestre: row.materia.cuatrimestre,
    contenido: row.contenido,
    carrera_nombre: row.materia.carrera.nombre,
    facultad_nombre: row.materia.carrera.facultad.nombre,
  }));
}

async function guardarEmbedding(contenidoId: string, embedding: number[]): Promise<void> {
  const db = await getSupabase();

  const { error } = await db
    .from('contenidos')
    .update({ embedding })
    .eq('id', contenidoId);

  if (error) throw error;
}

// ============= TASK =============

export const generarEmbeddings = task({
  id: "embeddings-uade",
  retry: { maxAttempts: 3 },
  maxDuration: 3600,
  run: async () => {
    const { embed } = await import('ai');
    const { openai } = await import('@ai-sdk/openai');

    const materias = await obtenerMateriasParaEmbedding();
    logger.info('Materias para procesar', { total: materias.length });

    if (materias.length === 0) {
      return { success: true, procesadas: 0, mensaje: 'No hay materias pendientes' };
    }

    const BATCH_SIZE = 50;
    let procesadas = 0;
    let errores = 0;

    for (let i = 0; i < materias.length; i += BATCH_SIZE) {
      const batch = materias.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (materia) => {
          const chunk = construirChunkParaEmbedding(materia);

          const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: chunk,
          });

          await guardarEmbedding(materia.id, embedding);
          return materia.id;
        })
      );

      results.forEach((r) => {
        if (r.status === 'fulfilled') procesadas++;
        else errores++;
      });

      logger.info('Batch procesado', {
        batch: Math.floor(i / BATCH_SIZE) + 1,
        total: Math.ceil(materias.length / BATCH_SIZE),
        procesadas,
        errores,
      });
    }

    return { success: true, procesadas, errores };
  },
});
