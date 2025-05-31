export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      article_reactions: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          reaction_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          reaction_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          reaction_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_reactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          content_quality_score: number | null
          created_at: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          generated_by_ai: boolean | null
          generation_metadata: Json | null
          id: string
          is_premium: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_count: number | null
          seo_score: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          generated_by_ai?: boolean | null
          generation_metadata?: Json | null
          id?: string
          is_premium?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_count?: number | null
          seo_score?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          generated_by_ai?: boolean | null
          generation_metadata?: Json | null
          id?: string
          is_premium?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_count?: number | null
          seo_score?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      astrological_interpretations: {
        Row: {
          ai_generated: boolean | null
          astrology_system: string | null
          birth_chart_id: string | null
          confidence_score: number | null
          content: string
          created_at: string | null
          id: string
          interpretation_type: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          astrology_system?: string | null
          birth_chart_id?: string | null
          confidence_score?: number | null
          content: string
          created_at?: string | null
          id?: string
          interpretation_type: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          astrology_system?: string | null
          birth_chart_id?: string | null
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          id?: string
          interpretation_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "astrological_interpretations_birth_chart_id_fkey"
            columns: ["birth_chart_id"]
            isOneToOne: false
            referencedRelation: "birth_charts"
            referencedColumns: ["id"]
          },
        ]
      }
      astrology_reports: {
        Row: {
          birth_chart_id: string | null
          chart_image_url: string | null
          content: string
          created_at: string | null
          id: string
          is_premium: boolean | null
          pdf_url: string | null
          report_type: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          birth_chart_id?: string | null
          chart_image_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          pdf_url?: string | null
          report_type: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          birth_chart_id?: string | null
          chart_image_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          pdf_url?: string | null
          report_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "astrology_reports_birth_chart_id_fkey"
            columns: ["birth_chart_id"]
            isOneToOne: false
            referencedRelation: "birth_charts"
            referencedColumns: ["id"]
          },
        ]
      }
      birth_charts: {
        Row: {
          birth_date: string
          birth_location: Json
          birth_time: string | null
          chart_data: Json
          chart_type: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          birth_date: string
          birth_location: Json
          birth_time?: string | null
          chart_data: Json
          chart_type?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          birth_date?: string
          birth_location?: Json
          birth_time?: string | null
          chart_data?: Json
          chart_type?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          ai_model: string | null
          ai_prompt: string | null
          content_structure: Json | null
          created_at: string | null
          description: string | null
          generation_frequency: string | null
          id: string
          image_generation_strategy: string | null
          image_prompt_template: string | null
          image_style: string | null
          layout_config: Json | null
          name: string
          output_format: string | null
          seo_settings: Json | null
          slug: string
        }
        Insert: {
          ai_model?: string | null
          ai_prompt?: string | null
          content_structure?: Json | null
          created_at?: string | null
          description?: string | null
          generation_frequency?: string | null
          id?: string
          image_generation_strategy?: string | null
          image_prompt_template?: string | null
          image_style?: string | null
          layout_config?: Json | null
          name: string
          output_format?: string | null
          seo_settings?: Json | null
          slug: string
        }
        Update: {
          ai_model?: string | null
          ai_prompt?: string | null
          content_structure?: Json | null
          created_at?: string | null
          description?: string | null
          generation_frequency?: string | null
          id?: string
          image_generation_strategy?: string | null
          image_prompt_template?: string | null
          image_style?: string | null
          layout_config?: Json | null
          name?: string
          output_format?: string | null
          seo_settings?: Json | null
          slug?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_reports: {
        Row: {
          astrology_system: string | null
          chart1_id: string | null
          chart2_id: string | null
          compatibility_score: number
          created_at: string | null
          detailed_analysis: Json
          id: string
          report_content: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          astrology_system?: string | null
          chart1_id?: string | null
          chart2_id?: string | null
          compatibility_score: number
          created_at?: string | null
          detailed_analysis: Json
          id?: string
          report_content: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          astrology_system?: string | null
          chart1_id?: string | null
          chart2_id?: string | null
          compatibility_score?: number
          created_at?: string | null
          detailed_analysis?: Json
          id?: string
          report_content?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_reports_chart1_id_fkey"
            columns: ["chart1_id"]
            isOneToOne: false
            referencedRelation: "birth_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_reports_chart2_id_fkey"
            columns: ["chart2_id"]
            isOneToOne: false
            referencedRelation: "birth_charts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_horoscopes: {
        Row: {
          ai_generated: boolean | null
          career_score: number | null
          content: string
          created_at: string | null
          date: string
          health_score: number | null
          id: string
          love_score: number | null
          lucky_colors: string[] | null
          lucky_numbers: number[] | null
          zodiac_sign: string
        }
        Insert: {
          ai_generated?: boolean | null
          career_score?: number | null
          content: string
          created_at?: string | null
          date: string
          health_score?: number | null
          id?: string
          love_score?: number | null
          lucky_colors?: string[] | null
          lucky_numbers?: number[] | null
          zodiac_sign: string
        }
        Update: {
          ai_generated?: boolean | null
          career_score?: number | null
          content?: string
          created_at?: string | null
          date?: string
          health_score?: number | null
          id?: string
          love_score?: number | null
          lucky_colors?: string[] | null
          lucky_numbers?: number[] | null
          zodiac_sign?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          audio_url: string
          created_at: string
          description: string | null
          duration: string | null
          guid: string
          id: string
          image_url: string | null
          podcast_id: string
          pub_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          description?: string | null
          duration?: string | null
          guid: string
          id?: string
          image_url?: string | null
          podcast_id: string
          pub_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          guid?: string
          id?: string
          image_url?: string | null
          podcast_id?: string
          pub_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      podcast_favorites: {
        Row: {
          created_at: string
          id: string
          podcast_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          podcast_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          podcast_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_favorites_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_playlist_episodes: {
        Row: {
          added_at: string
          episode_id: string
          id: string
          playlist_id: string
        }
        Insert: {
          added_at?: string
          episode_id: string
          id?: string
          playlist_id: string
        }
        Update: {
          added_at?: string
          episode_id?: string
          id?: string
          playlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_playlist_episodes_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_playlist_episodes_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "podcast_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_playlists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          admin_comments: string | null
          author: string | null
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          feed_url: string
          id: string
          image_url: string | null
          last_fetched_at: string | null
          name: string
          slug: string | null
          status: string | null
          submitter_id: string | null
          updated_at: string
        }
        Insert: {
          admin_comments?: string | null
          author?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          feed_url: string
          id?: string
          image_url?: string | null
          last_fetched_at?: string | null
          name: string
          slug?: string | null
          status?: string | null
          submitter_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_comments?: string | null
          author?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          feed_url?: string
          id?: string
          image_url?: string | null
          last_fetched_at?: string | null
          name?: string
          slug?: string | null
          status?: string | null
          submitter_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "podcast_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_premium: boolean | null
          name: string | null
          preferences: Json | null
          saved_content: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          name?: string | null
          preferences?: Json | null
          saved_content?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          name?: string | null
          preferences?: Json | null
          saved_content?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      related_articles: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          related_article_id: string | null
          relationship_type: string
          relevance_score: number
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          related_article_id?: string | null
          relationship_type: string
          relevance_score: number
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          related_article_id?: string | null
          relationship_type?: string
          relevance_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "related_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_articles_related_article_id_fkey"
            columns: ["related_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          astrology_features: Json | null
          created_at: string | null
          currency: string
          description: string | null
          features: string[] | null
          id: string
          interval: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          astrology_features?: Json | null
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          interval?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          astrology_features?: Json | null
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          interval?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transit_forecasts: {
        Row: {
          birth_chart_id: string | null
          created_at: string | null
          forecast_content: string
          forecast_date: string
          forecast_period: string | null
          id: string
          planetary_transits: Json
          significance_level: string | null
        }
        Insert: {
          birth_chart_id?: string | null
          created_at?: string | null
          forecast_content: string
          forecast_date: string
          forecast_period?: string | null
          id?: string
          planetary_transits: Json
          significance_level?: string | null
        }
        Update: {
          birth_chart_id?: string | null
          created_at?: string | null
          forecast_content?: string
          forecast_date?: string
          forecast_period?: string | null
          id?: string
          planetary_transits?: Json
          significance_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transit_forecasts_birth_chart_id_fkey"
            columns: ["birth_chart_id"]
            isOneToOne: false
            referencedRelation: "birth_charts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_podcast_with_episodes_txn: {
        Args:
          | {
              p_name: string
              p_category: string
              p_feed_url: string
              p_description: string
              p_image_url: string
              p_author: string
              p_episodes: Json
            }
          | {
              p_name: string
              p_category_id: string
              p_feed_url: string
              p_description: string
              p_image_url: string
              p_author: string
              p_episodes: Json
            }
        Returns: string
      }
      fix_loading_podcasts: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_article_read_count: {
        Args: { article_slug: string }
        Returns: undefined
      }
      slugify: {
        Args: { "": string }
        Returns: string
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
