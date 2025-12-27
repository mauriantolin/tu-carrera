'use server'

import { revalidateTag } from 'next/cache'

/**
 * Server Action para forzar la recarga de las posiciones de los nodos
 * desde la base de datos, invalidando el cache de posiciones
 */
export async function rollbackPositions(careerId: string): Promise<{ success: boolean; message: string }> {
  try {
    revalidateTag(`materias-${careerId}`, 'max')
    revalidateTag('materias', 'max')

    return {
      success: true,
      message: 'Posiciones restauradas a los valores de la base de datos'
    }
  } catch (error) {
    console.error('Error al restaurar las posiciones:', error)
    return {
      success: false,
      message: 'Error al restaurar las posiciones'
    }
  }
}
