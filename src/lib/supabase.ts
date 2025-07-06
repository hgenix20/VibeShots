import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          id: string
          user_id: string | null
          optimal_post_times: string[]
          timezone: string
          content_style: string
          auto_schedule: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string | null
          optimal_post_times?: string[]
          timezone?: string
          content_style?: string
          auto_schedule?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          optimal_post_times?: string[]
          timezone?: string
          content_style?: string
          auto_schedule?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string | null
          text: string
          status: 'queued' | 'processing' | 'script_generated' | 'media_ready' | 'scheduled' | 'published' | 'failed'
          priority: number
          target_audience: string | null
          keywords: string[] | null
          created_at: string
          updated_at: string
          processed_at: string | null
          error_message: string | null
          retry_count: number
        }
        Insert: {
          id?: string
          user_id: string | null
          text: string
          status?: 'queued' | 'processing' | 'script_generated' | 'media_ready' | 'scheduled' | 'published' | 'failed'
          priority?: number
          target_audience?: string | null
          keywords?: string[] | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
        }
        Update: {
          id?: string
          user_id?: string | null
          text?: string
          status?: 'queued' | 'processing' | 'script_generated' | 'media_ready' | 'scheduled' | 'published' | 'failed'
          priority?: number
          target_audience?: string | null
          keywords?: string[] | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
        }
      }
      scripts: {
        Row: {
          id: string
          idea_id: string | null
          user_id: string | null
          content: string
          hook: string | null
          call_to_action: string | null
          estimated_duration: number | null
          ai_model: string | null
          generation_prompt: string | null
          created_at: string
        }
      }
      media: {
        Row: {
          id: string
          script_id: string | null
          idea_id: string | null
          user_id: string | null
          type: 'audio' | 'video'
          status: 'generating' | 'ready' | 'uploaded' | 'deleted' | 'failed'
          file_path: string | null
          file_size: number | null
          duration: number | null
          format: string | null
          ai_model: string | null
          generation_params: any | null
          created_at: string
          updated_at: string
        }
      }
      schedules: {
        Row: {
          id: string
          media_id: string | null
          idea_id: string | null
          user_id: string | null
          scheduled_time: string
          status: 'pending' | 'uploading' | 'published' | 'failed' | 'cancelled'
          tiktok_video_id: string | null
          tiktok_share_url: string | null
          upload_attempt_count: number
          last_attempt_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
      }
      analytics: {
        Row: {
          id: string
          schedule_id: string | null
          user_id: string | null
          tiktok_video_id: string
          views: number
          likes: number
          shares: number
          comments: number
          engagement_rate: number | null
          revenue: number
          fetch_date: string
          created_at: string
        }
      }
    }
  }
}