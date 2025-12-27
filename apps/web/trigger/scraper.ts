import { task, logger } from "@trigger.dev/sdk/v3";
import type { BrowserContext, Page } from 'playwright';
import type { SupabaseClient } from '@supabase/supabase-js';

const CARRERS_URL = 'https://www.webcampus.uade.edu.ar/Contenidos/ListaCarreras.aspx';
const BASE_URL = 'https://www.webcampus.uade.edu.ar';

// Lazy-loaded clients (inicializados dentro del task)
let supabase: SupabaseClient | null = null;

async function getSupabase(): Promise<SupabaseClient | null> {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(url, key);
  return supabase;
}

// ============= TIPOS =============

interface Materia {
  codigo: string;
  nombre: string;
  horas: number;
  correlativas: string[];
  prerrequisitos: string | null;
  href: string;
  contenidos: string;
}

interface Cuatrimestre {
  cuatrimestre: string;
  materias: Materia[];
}

interface PlanEstudios {
  anio: string;
  cuatrimestres: Cuatrimestre[];
}

interface Titulo {
  nombre: string;
  anio: string;
  cuatrimestre: string | null;
}

interface MateriaConPosicion {
  id: string;
  codigo: string;
  anio: string;
  cuatrimestre: string;
}

interface CarreraData {
  facultad: string;
  carrera: string;
  director: { nombre: string; mail: string };
  plan: { codigo: string; anio: number };
  plan_de_estudios: PlanEstudios[];
  titulos: Titulo[];
}

// ============= LOGIN =============

async function realizarLoginMicrosoft(page: Page): Promise<boolean> {
  const email = process.env.UADE_EMAIL;
  const password = process.env.UADE_PASSWORD;

  if (!email || !password) {
    logger.error('Credenciales UADE no configuradas');
    return false;
  }

  try {
    logger.info('Iniciando login Microsoft');

    // Click "Entrar" si estamos en Login.aspx
    if (page.url().includes('Login.aspx')) {
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForURL(url => url.toString().includes('login.microsoftonline.com'), { timeout: 15000 });
    }

    // Email
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', email);
    await page.click('input[type="submit"]');

    // Password
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    await page.fill('input[type="password"]', password);
    await page.click('input[type="submit"]');

    // "Mantener sesión" - opcional
    try {
      await page.waitForSelector('button:has-text("Sí"), button:has-text("Yes"), input[value="Yes"], input[value="Sí"]', { timeout: 5000 });
      await page.locator('button:has-text("Sí"), button:has-text("Yes"), input[value="Yes"], input[value="Sí"]').first().click();
    } catch { /* No apareció */ }

    // Esperar redirect a Webcampus
    await page.waitForURL(url =>
      url.toString().includes('webcampus.uade.edu.ar') && !url.toString().includes('Login.aspx'),
      { timeout: 30000 }
    );

    logger.info('Login completado');
    return true;
  } catch (error) {
    logger.error('Error en login', { error });
    return false;
  }
}

// ============= ALGORITMO POSICIONES =============

function calcularPosicionesOptimas(
  materias: MateriaConPosicion[],
  correlativasMap: Map<string, string[]>  // materia_id → [correlativa_materia_ids]
): Map<string, { x: number; y: number }> {
  // 1. Agrupar por año-cuatrimestre
  const grupos = new Map<string, MateriaConPosicion[]>();
  materias.forEach(mat => {
    const key = `${mat.anio}-${mat.cuatrimestre}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(mat);
  });

  // 2. Ordenar grupos cronológicamente
  const gruposOrdenados = Array.from(grupos.entries())
    .sort((a, b) => {
      const partsA = a[0].split('-').map(n => parseInt(n) || 0);
      const partsB = b[0].split('-').map(n => parseInt(n) || 0);
      const yearA = partsA[0] ?? 0;
      const cuatA = partsA[1] ?? 0;
      const yearB = partsB[0] ?? 0;
      const cuatB = partsB[1] ?? 0;
      if (yearA !== yearB) return yearA - yearB;
      return cuatA - cuatB;
    })
    .map(([, mats]) => mats);

  // 3. Asignar índices iniciales (por código)
  const indice = new Map<string, number>();
  gruposOrdenados.forEach(grupo => {
    grupo.sort((a, b) => a.codigo.localeCompare(b.codigo));
    grupo.forEach((mat, i) => indice.set(mat.id, i));
  });

  // 4. Construir mapa de dependientes (inverso de correlativas)
  const dependientes = new Map<string, string[]>();
  correlativasMap.forEach((corrs, materiaId) => {
    corrs.forEach(corrId => {
      if (corrId) {
        if (!dependientes.has(corrId)) dependientes.set(corrId, []);
        dependientes.get(corrId)!.push(materiaId);
      }
    });
  });

  // 5. Función mediana
  const mediana = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
      : (sorted[mid] ?? 0);
  };

  // 6. Tres pasadas de optimización
  for (let iter = 0; iter < 3; iter++) {
    // Pasada descendente: posicionar según prerrequisitos
    for (let g = 1; g < gruposOrdenados.length; g++) {
      const grupo = gruposOrdenados[g] || [];
      const posicionesIdeales = new Map<string, number>();

      grupo.forEach(mat => {
        const prereqs = correlativasMap.get(mat.id) || [];
        const prereqsValidos = prereqs.filter(p => p && indice.has(p));
        if (prereqsValidos.length > 0) {
          const posPrereqs = prereqsValidos.map(p => indice.get(p)!);
          posicionesIdeales.set(mat.id, mediana(posPrereqs));
        } else {
          posicionesIdeales.set(mat.id, indice.get(mat.id)!);
        }
      });

      grupo.sort((a, b) => {
        const diff = posicionesIdeales.get(a.id)! - posicionesIdeales.get(b.id)!;
        return diff !== 0 ? diff : a.codigo.localeCompare(b.codigo);
      });
      grupo.forEach((mat, i) => indice.set(mat.id, i));
    }

    // Pasada ascendente: posicionar según dependientes
    for (let g = gruposOrdenados.length - 2; g >= 0; g--) {
      const grupo = gruposOrdenados[g] || [];
      const posicionesIdeales = new Map<string, number>();

      grupo.forEach(mat => {
        const deps = dependientes.get(mat.id) || [];
        const depsValidos = deps.filter(d => indice.has(d));
        if (depsValidos.length > 0) {
          const posDeps = depsValidos.map(d => indice.get(d)!);
          posicionesIdeales.set(mat.id, mediana(posDeps));
        } else {
          posicionesIdeales.set(mat.id, indice.get(mat.id)!);
        }
      });

      grupo.sort((a, b) => {
        const diff = posicionesIdeales.get(a.id)! - posicionesIdeales.get(b.id)!;
        return diff !== 0 ? diff : a.codigo.localeCompare(b.codigo);
      });
      grupo.forEach((mat, i) => indice.set(mat.id, i));
    }
  }

  // 7. Convertir índices a coordenadas
  const HORIZONTAL_SPACING = 850;
  const VERTICAL_SPACING = 550;
  const START_X = 100, START_Y = 100;

  const posiciones = new Map<string, { x: number; y: number }>();
  gruposOrdenados.forEach((grupo, rowIndex) => {
    grupo.forEach(mat => {
      const colIndex = indice.get(mat.id)!;
      posiciones.set(mat.id, {
        x: START_X + colIndex * HORIZONTAL_SPACING,
        y: START_Y + rowIndex * VERTICAL_SPACING
      });
    });
  });

  return posiciones;
}

// ============= SCRAPING =============

async function extraerContenidosMateria(page: Page, href: string): Promise<string> {
  try {
    await page.goto(`${BASE_URL}/Contenidos/${href}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html = await page.locator('#ctl00_ContentPlaceHolderMain_lbl_Contenido').innerHTML({ timeout: 5000 });
    //return html.split(/<BR\s*\/?>|\.\s+/i).map(c => c.trim()).filter(c => c.length > 0).map(c => c.endsWith('.') ? c : c + '.');
    return html.replace(/<BR\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    return "";
  }
}

async function parsearCarrera(page: Page, context: BrowserContext, facultad: string): Promise<CarreraData> {
  const carrera = await page.locator('#ctl00_ContentPlaceHolderMain_lbl_TituloCarrera').textContent() || '';
  const directorLink = page.locator('#ctl00_ContentPlaceHolderMain_lnk_Director');
  const directorNombre = await directorLink.textContent() || '';
  const directorMail = (await directorLink.getAttribute('href') || '').replace('mailto:', '');

  let planCodigo = '', planAnio = 0;
  try {
    const planText = await page.locator('[class^="TablaTit"] span').textContent() || '';
    const match = planText.match(/Plan:\s*([A-Z]*\d+)\s*-\s*Año:\s*(\d+)/i);
    if (match) { planCodigo = match[1] ?? ''; planAnio = parseInt(match[2] ?? '0'); }
  } catch { /* ignorar */ }

  const planEstudios: PlanEstudios[] = [];
  const titulos: Titulo[] = [];
  const rows = page.locator('#ctl00_ContentPlaceHolderMain_tbl_Materias tr');
  const rowCount = await rows.count();

  let currentYear: string | null = null, currentCuatrimestre: string | null = null;
  let currentYearData: PlanEstudios | null = null, currentCuatrimestreData: Cuatrimestre | null = null;

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    const yearCell = row.locator('[class^="year"]');
    if (await yearCell.count() > 0) {
      const yearText = await yearCell.textContent() || '';
      currentYear = yearText.match(/(\d+)/)?.[1] || yearText.trim();
      currentYearData = { anio: currentYear, cuatrimestres: [] };
      planEstudios.push(currentYearData);
      continue;
    }

    const cuatCell = row.locator('[class^="cuatrimestre"]');
    if (await cuatCell.count() > 0) {
      const cuatText = await cuatCell.textContent() || '';
      currentCuatrimestre = cuatText.match(/(\d+)°/)?.[1] || null;
      if (currentCuatrimestre && currentYearData) {
        currentCuatrimestreData = { cuatrimestre: currentCuatrimestre, materias: [] };
        currentYearData.cuatrimestres.push(currentCuatrimestreData);
      }
      continue;
    }

    const tituloCell = row.locator('[class^="TituloFACU"]');
    if (await tituloCell.count() > 0) {
      const tituloText = await tituloCell.textContent() || '';
      const tituloNombre = tituloText.replace('Titulo:', '').trim();
      if (tituloNombre && currentYear) {
        titulos.push({ nombre: tituloNombre, anio: currentYear, cuatrimestre: currentCuatrimestre });
      }
      continue;
    }

    const cells = await row.locator('td').all();
    if (cells.length >= 3) {
      try {
        const cell0 = cells[0], cell1 = cells[1], cell2 = cells[2];
        if (!cell0 || !cell1 || !cell2) continue;
        const firstClass = await cell0.getAttribute('class');
        if (firstClass?.includes('materias2')) {
          const codigo = (await cell0.textContent({ timeout: 2000 }))?.trim() || '';
          const nombreLink = cell1.locator('a');
          const nombre = (await nombreLink.textContent({ timeout: 2000 }))?.trim() || '';
          const href = (await nombreLink.getAttribute('href', { timeout: 2000 })) || '';
          const horas = parseInt((await cell2.textContent({ timeout: 2000 }))?.trim() || '0') || 0;

          let correlativas: string[] = [];
          const cell3 = cells[3];
          if (cell3) {
            const corrText = (await cell3.textContent({ timeout: 2000 }))?.trim() || '';
            if (corrText && corrText !== '\u00a0') correlativas = corrText.split(/\s+/).filter(c => c.length > 0);
          }

          let prerrequisitos: string | null = null;
          const cell4 = cells[4];
          if (cell4) {
            const preText = (await cell4.textContent({ timeout: 2000 }))?.trim() || '';
            if (preText && preText !== '\u00a0') prerrequisitos = preText;
          }

          currentCuatrimestreData?.materias.push({ codigo, nombre, horas, correlativas, prerrequisitos, href, contenidos: '' });
        }
      } catch { /* ignorar errores individuales */ }
    }
  }

  // Extraer contenidos con pool de páginas reutilizables
  const todasMaterias: Materia[] = planEstudios.flatMap(a => a.cuatrimestres.flatMap(c => c.materias));
  const POOL_SIZE = 6;

  // Crear pool de páginas
  const pool: Page[] = await Promise.all(
    Array(Math.min(POOL_SIZE, todasMaterias.length)).fill(0).map(async () => {
      const p = await context.newPage();
      p.setDefaultTimeout(20000);
      return p;
    })
  );

  // Procesar materias distribuyendo en el pool
  const chunks = Array.from({ length: pool.length }, (_, i) =>
    todasMaterias.filter((_, idx) => idx % pool.length === i)
  );

  await Promise.all(chunks.map(async (chunk, poolIdx) => {
    const p = pool[poolIdx];
    if (!p) return;
    for (const mat of chunk) {
      mat.contenidos = await extraerContenidosMateria(p, mat.href);
    }
  }));

  // Cerrar pool
  await Promise.all(pool.map(p => p.close()));

  return {
    facultad,
    carrera: carrera.trim(),
    director: { nombre: directorNombre.trim(), mail: directorMail.trim() },
    plan: { codigo: planCodigo, anio: planAnio },
    plan_de_estudios: planEstudios,
    titulos
  };
}

async function navegarConReintentos(page: Page, url: string, maxReintentos = 3): Promise<void> {
  for (let i = 1; i <= maxReintentos; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      return;
    } catch (e) {
      if (i === maxReintentos) throw e;
      await page.waitForTimeout(2000);
    }
  }
}

// ============= SUPABASE =============

async function insertarASupabase(carreras: CarreraData[]): Promise<{ facultades: number; carreras: number; materias: number }> {
  const db = await getSupabase();
  if (!db) {
    logger.warn('Supabase no configurado, saltando inserción');
    return { facultades: 0, carreras: 0, materias: 0 };
  }

  logger.info('Insertando en Supabase', { totalCarreras: carreras.length });
  const supabase = db; // Alias local para compatibilidad

  const carrerasPorFacultad = new Map<string, CarreraData[]>();
  carreras.forEach(c => {
    const f = c.facultad || 'Sin Facultad';
    if (!carrerasPorFacultad.has(f)) carrerasPorFacultad.set(f, []);
    carrerasPorFacultad.get(f)!.push(c);
  });

  const cache = {
    facultades: new Map<string, string>(),
    directores: new Map<string, string>(),
    planes: new Map<string, string>(),
    materias: new Map<string, string>()
  };

  const stats = { facultades: 0, directores: 0, planes: 0, carreras: 0, materias: 0, contenidos: 0, correlativas: 0, titulos: 0 };

  for (const [facultadNombre, carrerasDeFac] of carrerasPorFacultad) {
    try {
      // Facultad
      let facultadId = cache.facultades.get(facultadNombre);
      if (!facultadId) {
        const { data } = await supabase.from('facultades').upsert({ nombre: facultadNombre }, { onConflict: 'nombre' }).select('id').single();
        const newId = data?.id as string | undefined;
        if (newId) { facultadId = newId; cache.facultades.set(facultadNombre, newId); stats.facultades++; }
      }
      if (!facultadId) continue;

      for (const carrera of carrerasDeFac) {
        try {
          // Director
          let directorId = cache.directores.get(carrera.director.mail);
          if (!directorId) {
            const { data } = await supabase.from('directores').upsert({ nombre: carrera.director.nombre, email: carrera.director.mail }, { onConflict: 'email' }).select('id').single();
            const newId = data?.id as string | undefined;
            if (newId) { directorId = newId; cache.directores.set(carrera.director.mail, newId); stats.directores++; }
          }

          // Plan
          let planId = cache.planes.get(carrera.plan.codigo);
          if (!planId) {
            const { data } = await supabase.from('planes').upsert({ codigo: carrera.plan.codigo, anio: carrera.plan.anio }, { onConflict: 'codigo' }).select('id').single();
            const newId = data?.id as string | undefined;
            if (newId) { planId = newId; cache.planes.set(carrera.plan.codigo, newId); stats.planes++; }
          }

          // Carrera
          const { data: carreraData } = await supabase.from('carreras')
            .upsert({ nombre: carrera.carrera, facultad_id: facultadId, director_id: directorId, plan_id: planId }, { onConflict: 'nombre' })
            .select('id').single();
          if (!carreraData) continue;
          const carreraId = carreraData.id;
          stats.carreras++;

          // Materias
          const materiasData: Array<{
            codigo: string; nombre: string; horas: number;
            prerrequisitos: string | null; href: string;
            carrera_id: string; anio: string; cuatrimestre: string;
          }> = [];
          for (const anio of carrera.plan_de_estudios) {
            for (const cuat of anio.cuatrimestres) {
              for (const mat of cuat.materias) {
                materiasData.push({
                  codigo: mat.codigo, nombre: mat.nombre, horas: mat.horas,
                  prerrequisitos: mat.prerrequisitos, href: mat.href,
                  carrera_id: carreraId, anio: anio.anio, cuatrimestre: cuat.cuatrimestre
                });
              }
            }
          }

          if (materiasData.length === 0) continue;

          const { data: materiasInsertadas } = await supabase.from('materias')
            .upsert(materiasData, { onConflict: 'codigo,carrera_id' }).select('id, codigo');

          if (!materiasInsertadas) continue;
          stats.materias += materiasInsertadas.length;

          materiasInsertadas.forEach(m => cache.materias.set(`${m.codigo}-${carreraId}`, m.id));

          // Contenidos y correlativas
          type ContenidoRow = { materia_id: string; contenido: string; orden: number };
          type CorrelativaRow = { materia_id: string; correlativa_codigo: string; correlativa_materia_id: string | null };
          const contenidos: ContenidoRow[] = [], correlativas: CorrelativaRow[] = [];
          for (const anio of carrera.plan_de_estudios) {
            for (const cuat of anio.cuatrimestres) {
              for (const mat of cuat.materias) {
                const matId = cache.materias.get(`${mat.codigo}-${carreraId}`);
                if (!matId) continue;
                contenidos.push({ materia_id: matId, contenido: mat.contenidos, orden: 1 });
                mat.correlativas.forEach(corr => {
                  correlativas.push({ materia_id: matId, correlativa_codigo: corr, correlativa_materia_id: cache.materias.get(`${corr}-${carreraId}`) || null });
                });
              }
            }
          }

          if (contenidos.length > 0) {
            await supabase.from('contenidos').upsert(contenidos, { onConflict: 'materia_id,orden' });
            stats.contenidos += contenidos.length;
          }

          if (correlativas.length > 0) {
            await supabase.from('correlativas').upsert(correlativas, { onConflict: 'materia_id,correlativa_codigo' });
            stats.correlativas += correlativas.length;
          }

          // Posiciones - BATCH UPDATE
          const materiasPos: MateriaConPosicion[] = materiasInsertadas.map(m => {
            const orig = materiasData.find(md => md.codigo === m.codigo);
            return { id: m.id, codigo: m.codigo, anio: orig?.anio || '1', cuatrimestre: orig?.cuatrimestre || '1' };
          });

          const corrMap = new Map<string, string[]>();
          correlativas.forEach(c => {
            if (!corrMap.has(c.materia_id)) corrMap.set(c.materia_id, []);
            if (c.correlativa_materia_id) corrMap.get(c.materia_id)!.push(c.correlativa_materia_id);
          });

          const posiciones = calcularPosicionesOptimas(materiasPos, corrMap);

          // Actualizar posiciones en la base de datos
          for (const [materiaId, pos] of posiciones) {
            const { error: posError } = await supabase
              .from('materias')
              .update({ position_x: pos.x, position_y: pos.y })
              .eq('id', materiaId);

            if (posError) {
              console.error(`Error actualizando posición de materia ${materiaId}:`, posError);
            }
          }


          // Títulos
          if (carrera.titulos.length > 0) {
            const titulosData = carrera.titulos.map(t => ({ nombre: t.nombre, carrera_id: carreraId, anio: t.anio, cuatrimestre: t.cuatrimestre }));
            try {
              await supabase.from('titulos').insert(titulosData);
              stats.titulos += titulosData.length;
            } catch { /* duplicados */ }
          }

        } catch (e) {
          logger.warn('Error procesando carrera', { carrera: carrera.carrera, error: e });
        }
      }
    } catch (e) {
      logger.warn('Error procesando facultad', { facultad: facultadNombre, error: e });
    }
  }

  logger.info('Inserción completada', stats);
  return { facultades: stats.facultades, carreras: stats.carreras, materias: stats.materias };
}

// ============= MAIN =============

async function ejecutarScraping() {
  logger.info('Iniciando scraper UADE');

  // Dynamic import de playwright (mejora tiempo de startup)
  const { chromium } = await import('playwright');

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 760 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    await navegarConReintentos(page, CARRERS_URL);

    // Login si es necesario
    const url = page.url();
    if (url.includes('Login.aspx') || url.includes('login.microsoftonline.com')) {
      const ok = await realizarLoginMicrosoft(page);
      if (!ok) throw new Error('Login falló. Verifica UADE_EMAIL y UADE_PASSWORD.');
      await navegarConReintentos(page, CARRERS_URL);
    }

    // Extraer facultades y carreras
    const carreraFacultadMap = new Map<string, string>();
    const facultadElements = page.locator('[class^="TitulosFACU"]');
    const facultadCount = await facultadElements.count();

    for (let i = 0; i < facultadCount; i++) {
      const el = facultadElements.nth(i);
      const nombre = (await el.textContent())?.trim() || '';
      const links = el.locator('xpath=following::table[1]').locator('td[align="left"][valign="top"] a');
      const count = await links.count();
      for (let j = 0; j < count; j++) {
        const href = await links.nth(j).getAttribute('href');
        if (href) carreraFacultadMap.set(href, nombre);
      }
    }

    logger.info('Estructura extraída', { facultades: facultadCount, carreras: carreraFacultadMap.size });

    const hrefs = Array.from(carreraFacultadMap.keys());
    if (hrefs.length === 0) throw new Error('No se encontraron carreras');

    const todasLasCarreras: CarreraData[] = [];
    const BATCH_SIZE = 6;
    const totalBatches = Math.ceil(hrefs.length / BATCH_SIZE);

    for (let b = 0; b < totalBatches; b++) {
      const start = b * BATCH_SIZE;
      const batch = hrefs.slice(start, start + BATCH_SIZE);

      const results = await Promise.allSettled(batch.map(async (href) => {
        const p = await context.newPage();
        p.setDefaultTimeout(30000);
        try {
          await navegarConReintentos(p, `${BASE_URL}/Contenidos/${href}`);
          const data = await parsearCarrera(p, context, carreraFacultadMap.get(href) || 'Sin Facultad');
          return data;
        } finally {
          await p.close();
        }
      }));

      results.forEach(r => { if (r.status === 'fulfilled') todasLasCarreras.push(r.value); });
      logger.info('Lote procesado', { lote: b + 1, total: totalBatches, procesadas: todasLasCarreras.length });
    }

    const dbStats = await insertarASupabase(todasLasCarreras);
    await browser.close();

    return { success: true, carreras: todasLasCarreras.length, total: hrefs.length, db: dbStats };

  } catch (error) {
    await browser.close();
    throw error;
  }
}

// ============= TASK =============

export const uadeScraper = task({
  id: "scraper-uade",
  retry: { maxAttempts: 2 },
  maxDuration: 7200,
  run: async () => {
    const result = await ejecutarScraping();
    logger.info('Scraping completado', result);
    return result;
  },
});
