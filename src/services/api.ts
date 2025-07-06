import { supabase } from '../lib/supabase'

export interface Idea {
  id: string
  user_id: string
  text: string
  status: 'queued' | 'processing' | 'script_generated' | 'media_ready' | 'scheduled' | 'published' | 'failed'
  priority: number
  target_audience?: string
  keywords?: string[]
  created_at: string
  updated_at: string
  processed_at?: string
  error_message?: string
  retry_count: number
  scripts?: any[]
  media?: any[]
  schedules?: any[]
}

export interface Media {
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
  idea?: Idea
  script?: any
}

export interface Schedule {
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
  media?: Media
  idea?: Idea
}
export interface DashboardData {
  overview: {
    totalVideos: number
    totalViews: number
    totalLikes: number
    totalShares: number
    totalRevenue: number
    avgEngagement: number
  }
  pipeline: {
    queued: number
    processing: number
    scriptGenerated: number
    mediaReady: number
    scheduled: number
    published: number
    failed: number
  }
  topVideos: Array<{
    id: string
    ideaText: string
    views: number
    likes: number
    shares: number
    engagementRate: number
    url?: string
  }>
  optimalTimes: string[]
  timezone: string
  timeRange: string
}

class ApiService {
  async getIdeas(): Promise<{ success: boolean; data?: Idea[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ideas', {
        method: 'GET'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching ideas:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ideas'
      }
    }
  }

  async addIdea(
    text: string, 
    options?: { 
      priority?: number
      targetAudience?: string
      keywords?: string[]
    }
  ): Promise<{ success: boolean; data?: Idea; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ideas', {
        method: 'POST',
        body: {
          text,
          priority: options?.priority,
          target_audience: options?.targetAudience,
          keywords: options?.keywords
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding idea:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add idea'
      }
    }
  }

  async getIdea(id: string): Promise<{ success: boolean; data?: Idea; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(`ideas/${id}`, {
        method: 'GET'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching idea:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch idea'
      }
    }
  }

  async getDashboardAnalytics(timeRange: string = '7d'): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-analytics', {
        method: 'GET',
        body: { range: timeRange }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      }
    }
  }

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password })
  }

  async signOut() {
    return await supabase.auth.signOut()
  }

  async getUser() {
    return await supabase.auth.getUser()
  }
}

  async getReadyMedia(): Promise<{ success: boolean; data?: Media[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('media', {
        method: 'GET',
        body: { status: 'ready' }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching ready media:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ready media'
      }
    }
  }

  async getScheduledMedia(): Promise<{ success: boolean; data?: Schedule[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('schedules', {
        method: 'GET'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching scheduled media:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scheduled media'
      }
    }
  }

  async scheduleMedia(
    mediaId: string, 
    scheduledTime: string
  ): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('schedules', {
        method: 'POST',
        body: {
          media_id: mediaId,
          scheduled_time: scheduledTime
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error scheduling media:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule media'
      }
    }
  }

  async postMediaNow(mediaId: string): Promise<{ success: boolean; data?: Schedule; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('post-now', {
        method: 'POST',
        body: { media_id: mediaId }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error posting media now:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post media'
      }
    }
  }

  async updateTikTokConnection(accessToken: string, refreshToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-auth', {
        method: 'POST',
        body: {
          access_token: accessToken,
          refresh_token: refreshToken
        }
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating TikTok connection:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update TikTok connection'
      }
    }
  }

  async disconnectTikTok(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('tiktok-auth', {
        method: 'DELETE'
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error disconnecting TikTok:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect TikTok'
      }
    }
  }
export const apiService = new ApiService()