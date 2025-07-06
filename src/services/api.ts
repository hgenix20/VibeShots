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

export const apiService = new ApiService()