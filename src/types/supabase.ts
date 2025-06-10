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
      ad_analytics: {
        Row: {
          ad_banner_id: string | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
          zone: string | null
        }
        Insert: {
          ad_banner_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          zone?: string | null
        }
        Update: {
          ad_banner_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_analytics_ad_banner_id_fkey"
            columns: ["ad_banner_id"]
            isOneToOne: false
            referencedRelation: "ad_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_banners: {
        Row: {
          ad_type: string
          content: string
          created_at: string | null
          created_by: string | null
          cta_text: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          start_date: string | null
          target_url: string | null
          title: string
          updated_at: string | null
          zones: string[] | null
        }
        Insert: {
          ad_type: string
          content: string
          created_at?: string | null
          created_by?: string | null
          cta_text?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          start_date?: string | null
          target_url?: string | null
          title: string
          updated_at?: string | null
          zones?: string[] | null
        }
        Update: {
          ad_type?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          cta_text?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          start_date?: string | null
          target_url?: string | null
          title?: string
          updated_at?: string | null
          zones?: string[] | null
        }
        Relationships: []
      }
      ad_zones: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          max_height: number | null
          max_width: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          max_height?: number | null
          max_width?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          max_height?: number | null
          max_width?: number | null
          name?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          admin_comments: string | null
          author_avatar: string | null
          author_id: string | null
          author_name: string | null
          category_id: string | null
          comment_count: number | null
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
          like_count: number | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          seo_score: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          admin_comments?: string | null
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          comment_count?: number | null
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
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_score?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          admin_comments?: string | null
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          comment_count?: number | null
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
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_score?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          admin_comments: string | null
          article_id: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_comments?: string | null
          article_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_comments?: string | null
          article_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
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
          {
            foreignKeyName: "comments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      content_moderation_queue: {
        Row: {
          assigned_moderator_id: string | null
          auto_flagged_reasons: string[] | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          moderation_notes: string | null
          priority: number | null
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          submitter_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_moderator_id?: string | null
          auto_flagged_reasons?: string[] | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          moderation_notes?: string | null
          priority?: number | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitter_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_moderator_id?: string | null
          auto_flagged_reasons?: string[] | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          moderation_notes?: string | null
          priority?: number | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitter_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_queue_assigned_moderator_id_fkey"
            columns: ["assigned_moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_moderation_queue_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_episodes: {
        Row: {
          added_at: string | null
          episode_id: string | null
          id: string
          playlist_id: string | null
          position: number
        }
        Insert: {
          added_at?: string | null
          episode_id?: string | null
          id?: string
          playlist_id?: string | null
          position: number
        }
        Update: {
          added_at?: string | null
          episode_id?: string | null
          id?: string
          playlist_id?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_episodes_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_episodes_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_episodes_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "podcast_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_analytics: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          device_type: string | null
          duration_listened: number | null
          episode_id: string | null
          id: string
          ip_address: unknown | null
          play_ended_at: string | null
          play_started_at: string | null
          podcast_id: string | null
          total_duration: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          device_type?: string | null
          duration_listened?: number | null
          episode_id?: string | null
          id?: string
          ip_address?: unknown | null
          play_ended_at?: string | null
          play_started_at?: string | null
          podcast_id?: string | null
          total_duration?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          device_type?: string | null
          duration_listened?: number | null
          episode_id?: string | null
          id?: string
          ip_address?: unknown | null
          play_ended_at?: string | null
          play_started_at?: string | null
          podcast_id?: string | null
          total_duration?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_analytics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_analytics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_analytics_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_analytics_podcast_id_fkey"
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
      podcast_downloads: {
        Row: {
          created_at: string | null
          download_completed_at: string | null
          download_started_at: string | null
          download_url: string | null
          episode_id: string | null
          error_message: string | null
          expires_at: string | null
          file_size: number | null
          id: string
          local_path: string | null
          podcast_id: string | null
          progress_percentage: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          download_completed_at?: string | null
          download_started_at?: string | null
          download_url?: string | null
          episode_id?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          id?: string
          local_path?: string | null
          podcast_id?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          download_completed_at?: string | null
          download_started_at?: string | null
          download_url?: string | null
          episode_id?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size?: number | null
          id?: string
          local_path?: string | null
          podcast_id?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_downloads_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_downloads_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_downloads_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_downloads_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "episode_stats"
            referencedColumns: ["id"]
          },
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
      podcast_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          podcast_id: string | null
          rating: number
          reported_count: number | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          podcast_id?: string | null
          rating: number
          reported_count?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          podcast_id?: string | null
          rating?: number
          reported_count?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_reviews_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_reviews_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_search_index: {
        Row: {
          content_type: string
          created_at: string | null
          description: string | null
          episode_id: string | null
          id: string
          keywords: string[] | null
          podcast_id: string | null
          search_vector: unknown | null
          tags: string[] | null
          title: string
          topics: string[] | null
          updated_at: string | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          description?: string | null
          episode_id?: string | null
          id?: string
          keywords?: string[] | null
          podcast_id?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          description?: string | null
          episode_id?: string | null
          id?: string
          keywords?: string[] | null
          podcast_id?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_search_index_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_search_index_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_search_index_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_search_index_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_subscriptions: {
        Row: {
          auto_download: boolean | null
          id: string
          notification_enabled: boolean | null
          podcast_id: string | null
          subscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_download?: boolean | null
          id?: string
          notification_enabled?: boolean | null
          podcast_id?: string | null
          subscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_download?: boolean | null
          id?: string
          notification_enabled?: boolean | null
          podcast_id?: string | null
          subscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_subscriptions_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_subscriptions_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
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
          reviewed_at: string | null
          reviewed_by: string | null
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
          reviewed_at?: string | null
          reviewed_by?: string | null
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
          reviewed_at?: string | null
          reviewed_by?: string | null
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
          {
            foreignKeyName: "podcasts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      report_templates: {
        Row: {
          average_rating: number | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          layout: string | null
          name: string
          preview: string | null
          sections: Json | null
          styles: Json | null
          tags: string[] | null
          theme: Json | null
          type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          layout?: string | null
          name: string
          preview?: string | null
          sections?: Json | null
          styles?: Json | null
          tags?: string[] | null
          theme?: Json | null
          type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          layout?: string | null
          name?: string
          preview?: string | null
          sections?: Json | null
          styles?: Json | null
          tags?: string[] | null
          theme?: Json | null
          type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
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
      template_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      template_customizations: {
        Row: {
          created_at: string | null
          customizations: Json
          is_private: boolean | null
          name: string | null
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customizations: Json
          is_private?: boolean | null
          name?: string | null
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customizations?: Json
          is_private?: boolean | null
          name?: string | null
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_customizations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_ratings: {
        Row: {
          created_at: string | null
          rating: number
          review: string | null
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          rating: number
          review?: string | null
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          rating?: number
          review?: string | null
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_ratings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_themes: {
        Row: {
          border_radius: string | null
          colors: Json
          fonts: Json
          id: string
          name: string
          shadows: Json | null
          spacing: Json | null
        }
        Insert: {
          border_radius?: string | null
          colors: Json
          fonts: Json
          id: string
          name: string
          shadows?: Json | null
          spacing?: Json | null
        }
        Update: {
          border_radius?: string | null
          colors?: Json
          fonts?: Json
          id?: string
          name?: string
          shadows?: Json | null
          spacing?: Json | null
        }
        Relationships: []
      }
      template_usage: {
        Row: {
          created_at: string | null
          customizations: Json | null
          id: string
          report_id: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customizations?: Json | null
          id?: string
          report_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customizations?: Json | null
          id?: string
          report_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_usage_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
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
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      episode_stats: {
        Row: {
          avg_completion_rate: number | null
          download_count: number | null
          id: string | null
          podcast_id: string | null
          title: string | null
          total_listen_time: number | null
          total_plays: number | null
          unique_listeners: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcast_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_stats: {
        Row: {
          average_rating: number | null
          avg_completion_rate: number | null
          id: string | null
          name: string | null
          review_count: number | null
          subscriber_count: number | null
          total_listen_time: number | null
          total_plays: number | null
          unique_listeners: number | null
        }
        Relationships: []
      }
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
      cleanup_expired_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      fix_loading_podcasts: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_ads_for_zone: {
        Args: { zone_name: string }
        Returns: {
          id: string
          title: string
          ad_type: string
          content: string
          cta_text: string
          target_url: string
          priority: number
        }[]
      }
      increment_article_read_count: {
        Args: { article_slug: string }
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          p_admin_id: string
          p_action: string
          p_target_type: string
          p_target_id?: string
          p_details?: Json
        }
        Returns: string
      }
      slugify: {
        Args: { "": string }
        Returns: string
      }
      track_ad_event: {
        Args: {
          p_ad_banner_id: string
          p_event_type: string
          p_user_id?: string
          p_zone?: string
          p_user_agent?: string
          p_ip_address?: unknown
        }
        Returns: undefined
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
