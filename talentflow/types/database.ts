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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          ai_notes: string | null
          ai_score: number | null
          applied_at: string
          candidate_id: string
          created_at: string
          id: string
          job_id: string
          recruiter_notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          ai_notes?: string | null
          ai_score?: number | null
          applied_at?: string
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
          recruiter_notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          ai_notes?: string | null
          ai_score?: number | null
          applied_at?: string
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
          recruiter_notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_embeddings: {
        Row: {
          candidate_id: string
          created_at: string
          embedding: string
          embedding_text: string | null
          id: string
          model: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          embedding: string
          embedding_text?: string | null
          id?: string
          model?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          embedding?: string
          embedding_text?: string | null
          id?: string
          model?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_embeddings_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          ai_score: number | null
          ai_score_breakdown: Json | null
          created_at: string
          dedup_confidence: number | null
          dedup_hash: string | null
          duplicate_of: string | null
          education: Json | null
          email: string
          experience_years: number | null
          full_name: string
          headline: string | null
          id: string
          is_duplicate: boolean
          linkedin_url: string | null
          location: string | null
          needs_review: boolean | null
          parsed_at: string | null
          phone: string | null
          raw_resume_text: string | null
          resume_url: string | null
          skills: string[]
          source: Database["public"]["Enums"]["candidate_source"]
          source_id: string | null
          sources: string[] | null
          summary: string | null
          updated_at: string
          work_history: Json | null
        }
        Insert: {
          ai_score?: number | null
          ai_score_breakdown?: Json | null
          created_at?: string
          dedup_confidence?: number | null
          dedup_hash?: string | null
          duplicate_of?: string | null
          education?: Json | null
          email: string
          experience_years?: number | null
          full_name: string
          headline?: string | null
          id?: string
          is_duplicate?: boolean
          linkedin_url?: string | null
          location?: string | null
          needs_review?: boolean | null
          parsed_at?: string | null
          phone?: string | null
          raw_resume_text?: string | null
          resume_url?: string | null
          skills?: string[]
          source: Database["public"]["Enums"]["candidate_source"]
          source_id?: string | null
          sources?: string[] | null
          summary?: string | null
          updated_at?: string
          work_history?: Json | null
        }
        Update: {
          ai_score?: number | null
          ai_score_breakdown?: Json | null
          created_at?: string
          dedup_confidence?: number | null
          dedup_hash?: string | null
          duplicate_of?: string | null
          education?: Json | null
          email?: string
          experience_years?: number | null
          full_name?: string
          headline?: string | null
          id?: string
          is_duplicate?: boolean
          linkedin_url?: string | null
          location?: string | null
          needs_review?: boolean | null
          parsed_at?: string | null
          phone?: string | null
          raw_resume_text?: string | null
          resume_url?: string | null
          skills?: string[]
          source?: Database["public"]["Enums"]["candidate_source"]
          source_id?: string | null
          sources?: string[] | null
          summary?: string | null
          updated_at?: string
          work_history?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_logs: {
        Row: {
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          metadata: Json | null
          source: Database["public"]["Enums"]["candidate_source"]
          started_at: string
          status: Database["public"]["Enums"]["ingestion_status"]
          total_duplicates: number
          total_failed: number
          total_fetched: number
          total_inserted: number
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          metadata?: Json | null
          source: Database["public"]["Enums"]["candidate_source"]
          started_at?: string
          status?: Database["public"]["Enums"]["ingestion_status"]
          total_duplicates?: number
          total_failed?: number
          total_fetched?: number
          total_inserted?: number
        }
        Update: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          metadata?: Json | null
          source?: Database["public"]["Enums"]["candidate_source"]
          started_at?: string
          status?: Database["public"]["Enums"]["ingestion_status"]
          total_duplicates?: number
          total_failed?: number
          total_fetched?: number
          total_inserted?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string
          department: string | null
          description: string
          external_id: string | null
          external_source: string | null
          id: string
          location: string | null
          recruiter_id: string | null
          remote: boolean
          requirements: string[]
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          description: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          location?: string | null
          recruiter_id?: string | null
          remote?: boolean
          requirements?: string[]
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          description?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          location?: string | null
          recruiter_id?: string | null
          remote?: boolean
          requirements?: string[]
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shortlists: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_id: string
          notes: string | null
          rank: number | null
          score: number | null
          shortlisted_by: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
          rank?: number | null
          score?: number | null
          shortlisted_by?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          rank?: number | null
          score?: number | null
          shortlisted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shortlists_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shortlists_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          candidates_imported: number
          config: Json
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          name: string
          type: Database["public"]["Enums"]["candidate_source"]
          updated_at: string
        }
        Insert: {
          candidates_imported?: number
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          name: string
          type: Database["public"]["Enums"]["candidate_source"]
          updated_at?: string
        }
        Update: {
          candidates_imported?: number
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          name?: string
          type?: Database["public"]["Enums"]["candidate_source"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_candidates: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          ai_score: number
          email: string
          experience_years: number
          full_name: string
          headline: string
          id: string
          similarity: number
          skills: string[]
          source: Database["public"]["Enums"]["candidate_source"]
        }[]
      }
      match_candidates_v2: {
        Args: { match_count: number; query_embedding: string }
        Returns: {
          candidate_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      application_status:
        | "new"
        | "reviewing"
        | "shortlisted"
        | "interviewing"
        | "offered"
        | "hired"
        | "rejected"
      candidate_source:
        | "gmail"
        | "indeed"
        | "merge_ats"
        | "resume_upload"
        | "linkedin"
        | "zoho"
      ingestion_status: "pending" | "processing" | "completed" | "failed"
      job_status: "draft" | "open" | "closed" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
