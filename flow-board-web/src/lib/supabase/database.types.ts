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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      boards: {
        Row: {
          created_at: string
          id: string
          owner: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      card_labels: {
        Row: {
          card_id: string
          label_id: string
          owner: string
        }
        Insert: {
          card_id: string
          label_id: string
          owner?: string
        }
        Update: {
          card_id?: string
          label_id?: string
          owner?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_labels_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_labels_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "today_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          board_id: string
          created_at: string
          description: string | null
          due_date: string | null
          focus_slot: number | null
          id: string
          is_focus_active: boolean
          list_id: string
          owner: string
          position: number
          priority: number | null
          search: unknown
          title: string
          updated_at: string
        }
        Insert: {
          board_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          focus_slot?: number | null
          id?: string
          is_focus_active?: boolean
          list_id: string
          owner?: string
          position?: number
          priority?: number | null
          search?: unknown
          title: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          focus_slot?: number | null
          id?: string
          is_focus_active?: boolean
          list_id?: string
          owner?: string
          position?: number
          priority?: number | null
          search?: unknown
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      category_suggestions: {
        Row: {
          card_id: string
          card_updated_at: string
          created_at: string
          id: string
          owner: string
          suggested_label_id: string | null
          suggested_priority: number | null
        }
        Insert: {
          card_id: string
          card_updated_at: string
          created_at?: string
          id?: string
          owner?: string
          suggested_label_id?: string | null
          suggested_priority?: number | null
        }
        Update: {
          card_id?: string
          card_updated_at?: string
          created_at?: string
          id?: string
          owner?: string
          suggested_label_id?: string | null
          suggested_priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "category_suggestions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_suggestions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "today_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_suggestions_suggested_label_id_fkey"
            columns: ["suggested_label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          board_id: string
          color: string
          created_at: string
          id: string
          name: string
          owner: string
        }
        Insert: {
          board_id: string
          color: string
          created_at?: string
          id?: string
          name: string
          owner?: string
        }
        Update: {
          board_id?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
          owner?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          board_id: string
          created_at: string
          id: string
          owner: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          owner?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          owner?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          timezone: string
        }
        Insert: {
          created_at?: string
          id: string
          timezone?: string
        }
        Update: {
          created_at?: string
          id?: string
          timezone?: string
        }
        Relationships: []
      }
    }
    Views: {
      today_cards: {
        Row: {
          board_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          focus_slot: number | null
          id: string | null
          is_focus_active: boolean | null
          list_id: string | null
          owner: string | null
          position: number | null
          priority: number | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apply_suggestion: {
        Args: { p_suggestion_id: string }
        Returns: {
          board_id: string
          created_at: string
          description: string | null
          due_date: string | null
          focus_slot: number | null
          id: string
          is_focus_active: boolean
          list_id: string
          owner: string
          position: number
          priority: number | null
          search: unknown
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "cards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      move_card: {
        Args: {
          p_after_card_id: string
          p_before_card_id: string
          p_card_id: string
          p_target_list_id: string
        }
        Returns: {
          board_id: string
          created_at: string
          description: string | null
          due_date: string | null
          focus_slot: number | null
          id: string
          is_focus_active: boolean
          list_id: string
          owner: string
          position: number
          priority: number | null
          search: unknown
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "cards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_focus: {
        Args: { p_card_id: string; p_slot: number }
        Returns: {
          board_id: string
          created_at: string
          description: string | null
          due_date: string | null
          focus_slot: number | null
          id: string
          is_focus_active: boolean
          list_id: string
          owner: string
          position: number
          priority: number | null
          search: unknown
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "cards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
