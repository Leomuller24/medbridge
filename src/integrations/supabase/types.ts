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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      community_answers: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_answers_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_answers_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_mod_log: {
        Row: {
          author_id: string | null
          created_at: string
          decided_by: string
          decision: string
          excerpt: string
          id: string
          item_id: string
          item_kind: string
          reason: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          decided_by?: string
          decision: string
          excerpt?: string
          id?: string
          item_id: string
          item_kind: string
          reason?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          decided_by?: string
          decision?: string
          excerpt?: string
          id?: string
          item_id?: string
          item_kind?: string
          reason?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          body: string
          category: string
          created_at: string
          id: string
          language: string
          source: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          category?: string
          created_at?: string
          id?: string
          language?: string
          source?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          category?: string
          created_at?: string
          id?: string
          language?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          answer_id: string | null
          created_at: string
          detail: string | null
          id: string
          post_id: string | null
          reason: string
          reporter_id: string
        }
        Insert: {
          answer_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reporter_id: string
        }
        Update: {
          answer_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "community_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          answer_id: string | null
          counts: boolean
          created_at: string
          id: string
          post_id: string | null
          voter_id: string
        }
        Insert: {
          answer_id?: string | null
          counts?: boolean
          created_at?: string
          id?: string
          post_id?: string | null
          voter_id: string
        }
        Update: {
          answer_id?: string | null
          counts?: boolean
          created_at?: string
          id?: string
          post_id?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "community_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_warnings: {
        Row: {
          created_at: string
          created_by: string
          id: string
          item_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          item_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          item_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_role: string
          created_at: string
          display_name: string
          id: string
          interests: string[]
          languages: string[]
          notify_community: boolean
          notify_email: boolean
          onboarded: boolean
          role: string
          updated_at: string
        }
        Insert: {
          account_role?: string
          created_at?: string
          display_name?: string
          id: string
          interests?: string[]
          languages?: string[]
          notify_community?: boolean
          notify_email?: boolean
          onboarded?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          account_role?: string
          created_at?: string
          display_name?: string
          id?: string
          interests?: string[]
          languages?: string[]
          notify_community?: boolean
          notify_email?: boolean
          onboarded?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      translation_daily_usage: {
        Row: {
          count: number
          day: string
        }
        Insert: {
          count?: number
          day: string
        }
        Update: {
          count?: number
          day?: string
        }
        Relationships: []
      }
      translation_device_usage: {
        Row: {
          count: number
          device_hash: string
          hour_start: string
        }
        Insert: {
          count?: number
          device_hash: string
          hour_start: string
        }
        Update: {
          count?: number
          device_hash?: string
          hour_start?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      community_authors: {
        Args: { _ids: string[] }
        Returns: {
          display_name: string
          job_role: string
          points: number
          user_id: string
        }[]
      }
      community_first_helpful: { Args: { _post_id: string }; Returns: string }
      community_level: { Args: { _points: number }; Returns: string }
      community_my_stats: {
        Args: never
        Returns: {
          level: string
          points: number
          streak: number
        }[]
      }
      community_points_for: {
        Args: { _ids: string[] }
        Returns: {
          points: number
          user_id: string
        }[]
      }
      consume_translation_quota: {
        Args: { _daily: number; _device_hash: string; _hourly: number }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_community_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_provider: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
