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
      about_blocks: {
        Row: {
          body: string
          created_at: string
          icon: string | null
          id: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          category: string | null
          created_at: string
          description: string
          download_file: string | null
          id: string
          published: boolean
          resource_url: string | null
          sort_order: number
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string
          download_file?: string | null
          id?: string
          published?: boolean
          resource_url?: string | null
          sort_order?: number
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          download_file?: string | null
          id?: string
          published?: boolean
          resource_url?: string | null
          sort_order?: number
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          description: string
          download_file: string | null
          id: string
          price_label: string | null
          published: boolean
          resource_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          download_file?: string | null
          id?: string
          price_label?: string | null
          published?: boolean
          resource_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          download_file?: string | null
          id?: string
          price_label?: string | null
          published?: boolean
          resource_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          description: string
          featured: boolean
          gallery: string[]
          id: string
          live_url: string | null
          published: boolean
          short_description: string
          slug: string
          sort_order: number
          source_url: string | null
          technologies: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          gallery?: string[]
          id?: string
          live_url?: string | null
          published?: boolean
          short_description?: string
          slug: string
          sort_order?: number
          source_url?: string | null
          technologies?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          gallery?: string[]
          id?: string
          live_url?: string | null
          published?: boolean
          short_description?: string
          slug?: string
          sort_order?: number
          source_url?: string | null
          technologies?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_heading: string
          about_intro: string
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          brand_name: string
          contact_cta_label: string
          contact_email: string | null
          contact_heading: string
          contact_text: string
          footer_text: string
          hero_eyebrow: string
          hero_image: string | null
          hero_intro: string
          hero_name: string
          hero_title: string
          id: number
          meta_description: string
          meta_title: string
          primary_cta_href: string
          primary_cta_label: string
          secondary_cta_href: string
          secondary_cta_label: string
          show_about: boolean
          show_classes: boolean
          show_ebooks: boolean
          show_projects: boolean
          show_source_code: boolean
          show_stats: boolean
          show_support: boolean
          support_amounts: number[]
          support_heading: string
          support_text: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          about_heading?: string
          about_intro?: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          brand_name?: string
          contact_cta_label?: string
          contact_email?: string | null
          contact_heading?: string
          contact_text?: string
          footer_text?: string
          hero_eyebrow?: string
          hero_image?: string | null
          hero_intro?: string
          hero_name?: string
          hero_title?: string
          id?: number
          meta_description?: string
          meta_title?: string
          primary_cta_href?: string
          primary_cta_label?: string
          secondary_cta_href?: string
          secondary_cta_label?: string
          show_about?: boolean
          show_classes?: boolean
          show_ebooks?: boolean
          show_projects?: boolean
          show_source_code?: boolean
          show_stats?: boolean
          show_support?: boolean
          support_amounts?: number[]
          support_heading?: string
          support_text?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          about_heading?: string
          about_intro?: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          brand_name?: string
          contact_cta_label?: string
          contact_email?: string | null
          contact_heading?: string
          contact_text?: string
          footer_text?: string
          hero_eyebrow?: string
          hero_image?: string | null
          hero_intro?: string
          hero_name?: string
          hero_title?: string
          id?: number
          meta_description?: string
          meta_title?: string
          primary_cta_href?: string
          primary_cta_label?: string
          secondary_cta_href?: string
          secondary_cta_label?: string
          show_about?: boolean
          show_classes?: boolean
          show_ebooks?: boolean
          show_projects?: boolean
          show_source_code?: boolean
          show_stats?: boolean
          show_support?: boolean
          support_amounts?: number[]
          support_heading?: string
          support_text?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          label: string
          platform: string
          published: boolean
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          platform: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          platform?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      source_code: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          demo_url: string | null
          description: string
          download_file: string | null
          id: string
          price_label: string | null
          published: boolean
          repo_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          download_file?: string | null
          id?: string
          price_label?: string | null
          published?: boolean
          repo_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          download_file?: string | null
          id?: string
          price_label?: string | null
          published?: boolean
          repo_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          kind: string
          label: string
          published: boolean
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          kind?: string
          label: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          kind?: string
          label?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      support_payments: {
        Row: {
          amount: number
          created_at: string
          email: string
          id: string
          name: string | null
          receipt: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          id?: string
          name?: string | null
          receipt: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          receipt?: string
          status?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
