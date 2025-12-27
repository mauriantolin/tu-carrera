/**
 * Tipos TypeScript generados para la base de datos de Supabase
 * Carreras UADE
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      facultades: {
        Row: {
          id: string
          nombre: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      directores: {
        Row: {
          id: string
          nombre: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      planes: {
        Row: {
          id: string
          codigo: string
          anio: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          anio: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          anio?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      carreras: {
        Row: {
          id: string
          nombre: string
          facultad_id: string | null
          director_id: string | null
          plan_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          facultad_id?: string | null
          director_id?: string | null
          plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          facultad_id?: string | null
          director_id?: string | null
          plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carreras_facultad_id_fkey"
            columns: ["facultad_id"]
            referencedRelation: "facultades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreras_director_id_fkey"
            columns: ["director_id"]
            referencedRelation: "directores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreras_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "planes"
            referencedColumns: ["id"]
          }
        ]
      }
      materias: {
        Row: {
          id: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nombre: string
          horas?: number
          prerrequisitos?: string | null
          href: string
          carrera_id: string
          anio: string
          cuatrimestre: string
          position_x?: number
          position_y?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nombre?: string
          horas?: number
          prerrequisitos?: string | null
          href?: string
          carrera_id?: string
          anio?: string
          cuatrimestre?: string
          position_x?: number
          position_y?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materias_carrera_id_fkey"
            columns: ["carrera_id"]
            referencedRelation: "carreras"
            referencedColumns: ["id"]
          }
        ]
      }
      contenidos: {
        Row: {
          id: string
          materia_id: string
          contenido: string
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          materia_id: string
          contenido: string
          orden: number
          created_at?: string
        }
        Update: {
          id?: string
          materia_id?: string
          contenido?: string
          orden?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contenidos_materia_id_fkey"
            columns: ["materia_id"]
            referencedRelation: "materias"
            referencedColumns: ["id"]
          }
        ]
      }
      correlativas: {
        Row: {
          materia_id: string
          correlativa_codigo: string
          correlativa_materia_id: string | null
          created_at: string
        }
        Insert: {
          materia_id: string
          correlativa_codigo: string
          correlativa_materia_id?: string | null
          created_at?: string
        }
        Update: {
          materia_id?: string
          correlativa_codigo?: string
          correlativa_materia_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correlativas_materia_id_fkey"
            columns: ["materia_id"]
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correlativas_correlativa_materia_id_fkey"
            columns: ["correlativa_materia_id"]
            referencedRelation: "materias"
            referencedColumns: ["id"]
          }
        ]
      }
      titulos: {
        Row: {
          id: string
          nombre: string
          carrera_id: string
          anio: string
          cuatrimestre: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          carrera_id: string
          anio: string
          cuatrimestre?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          carrera_id?: string
          anio?: string
          cuatrimestre?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "titulos_carrera_id_fkey"
            columns: ["carrera_id"]
            referencedRelation: "carreras"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =============================================================================
// TIPOS AUXILIARES PARA USO EN LA APLICACIÓN
// =============================================================================

export type Facultad = Database['public']['Tables']['facultades']['Row']
export type Director = Database['public']['Tables']['directores']['Row']
export type Plan = Database['public']['Tables']['planes']['Row']
export type Carrera = Database['public']['Tables']['carreras']['Row']
export type Materia = Database['public']['Tables']['materias']['Row']
export type Contenido = Database['public']['Tables']['contenidos']['Row']
export type Correlativa = Database['public']['Tables']['correlativas']['Row']
export type Titulo = Database['public']['Tables']['titulos']['Row']

// Tipos con relaciones expandidas
export type CarreraConRelaciones = Carrera & {
  facultad?: Facultad
  director?: Director
  plan?: Plan
  materias?: Materia[]
  titulos?: Titulo[]
}

export type MateriaConRelaciones = Materia & {
  carrera?: Carrera
  contenidos?: Contenido[]
  correlativas?: Correlativa[]
}

// Tipos para inserción
export type NuevaFacultad = Database['public']['Tables']['facultades']['Insert']
export type NuevoDirector = Database['public']['Tables']['directores']['Insert']
export type NuevoPlan = Database['public']['Tables']['planes']['Insert']
export type NuevaCarrera = Database['public']['Tables']['carreras']['Insert']
export type NuevaMateria = Database['public']['Tables']['materias']['Insert']
export type NuevoContenido = Database['public']['Tables']['contenidos']['Insert']
export type NuevaCorrelativa = Database['public']['Tables']['correlativas']['Insert']
export type NuevoTitulo = Database['public']['Tables']['titulos']['Insert']

// Tipos para actualización
export type ActualizarFacultad = Database['public']['Tables']['facultades']['Update']
export type ActualizarDirector = Database['public']['Tables']['directores']['Update']
export type ActualizarPlan = Database['public']['Tables']['planes']['Update']
export type ActualizarCarrera = Database['public']['Tables']['carreras']['Update']
export type ActualizarMateria = Database['public']['Tables']['materias']['Update']
export type ActualizarContenido = Database['public']['Tables']['contenidos']['Update']
export type ActualizarCorrelativa = Database['public']['Tables']['correlativas']['Update']
export type ActualizarTitulo = Database['public']['Tables']['titulos']['Update']
