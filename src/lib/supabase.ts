import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables Supabase manquantes !');
  console.error('URL:', supabaseUrl ? '✅' : '❌');
  console.error('Key:', supabaseAnonKey ? '✅' : '❌');
}

// Client Supabase pour le côté client
// Note: Les valeurs par défaut sont utilisées uniquement si les variables d'environnement ne sont pas définies
export const supabase = createClient(
  supabaseUrl || 'https://hzaiqudxyhrpxcqsxbrj.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6YWlxdWR4eWhycHhjcXN4YnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDU3ODksImV4cCI6MjA3NDEyMTc4OX0.5qj4VE89gQvc4Cmy_qM8VN0Bx9lwEKi8o_NkX8uOiq4'
)

// Types générés automatiquement depuis Supabase - Updated: 23 septembre 2025
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          present: boolean
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          present?: boolean
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          present?: boolean
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_name: string
          created_at: string
          day: string
          id: string
          level: number
          room: string
          teacher_name: string
        }
        Insert: {
          class_name: string
          created_at?: string
          day: string
          id?: string
          level: number
          room: string
          teacher_name: string
        }
        Update: {
          class_name?: string
          created_at?: string
          day?: string
          id?: string
          level?: number
          room?: string
          teacher_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          class_id: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          parent_phone: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          first_name: string
          id: string
          last_name: string
          parent_phone?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          parent_phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
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

// Types utiles pour votre application
export type Profile = Database['public']['Tables']['profiles']['Row'] 
export type Class = Database['public']['Tables']['classes']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row'] 