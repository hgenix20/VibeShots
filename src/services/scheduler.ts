// Scheduler service for TikTok uploads and analytics
import { supabase } from '../lib/supabase'
import cron from 'node-cron'

class SchedulerService {
  private isRunning = false

  // Schedule uploads every 15 minutes
  startUploadScheduler() {
    if (this.isRunning) return

    console.log('Starting TikTok upload scheduler...')
    this.isRunning = true

    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.processScheduledUploads()
    })

    // Run daily analytics at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.fetchAnalytics()
      await this.optimizeScheduleTimes()
    })

    // Run recycle job weekly on Sundays at 3 AM
    cron.schedule('0 3 * * 0', async () => {
      await this.recycleOldIdeas()
    })
  }

  private async processScheduledUploads() {
    try {
      console.log('Processing scheduled uploads...')

      // Get ready media that needs to be scheduled
      const { data: readyMedia, error } = await supabase
        .from('media')
        .select(`
          *,
          scripts(*),
          ideas(*)
        `)
        .eq('status', 'ready')
        .eq('type', 'video')
        .limit(60) // Max 60 concurrent uploads

      if (error) throw error

      for (const media of readyMedia || []) {
        await this.scheduleVideoUpload(media)
      }

      // Process pending uploads
      const { data: pendingSchedules } = await supabase
        .from('schedules')
        .select(`
          *,
          media(*),
          ideas(*)
        `)
        .eq('status', 'pending')
        .lte('scheduled_time', new Date().toISOString())
        .limit(10) // Process 10 at a time

      for (const schedule of pendingSchedules || []) {
        await this.uploadToTikTok(schedule)
      }

    } catch (error) {
      console.error('Error processing scheduled uploads:', error)
    }
  }

  private async scheduleVideoUpload(media: any) {
    try {
      // Get user preferences for optimal posting times
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('optimal_post_times, timezone, auto_schedule')
        .eq('user_id', media.user_id)
        .single()

      if (!preferences?.auto_schedule) return

      // Calculate next optimal posting time
      const nextPostTime = this.calculateNextPostTime(preferences.optimal_post_times, preferences.timezone)

      // Create schedule record
      await supabase
        .from('schedules')
        .insert([{
          media_id: media.id,
          idea_id: media.idea_id,
          user_id: media.user_id,
          scheduled_time: nextPostTime,
          status: 'pending'
        }])

      // Update idea status
      await supabase
        .from('ideas')
        .update({ status: 'scheduled' })
        .eq('id', media.idea_id)

      console.log(`Scheduled video upload for ${nextPostTime}`)

    } catch (error) {
      console.error('Error scheduling video upload:', error)
    }
  }

  private calculateNextPostTime(optimalTimes: string[], timezone: string): string {
    const now = new Date()
    const today = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    
    // Find next optimal time today or tomorrow
    for (const time of optimalTimes) {
      const [hours, minutes] = time.split(':').map(Number)
      const postTime = new Date(today)
      postTime.setHours(hours, minutes, 0, 0)
      
      if (postTime > now) {
        return postTime.toISOString()
      }
    }
    
    // If no time today, use first time tomorrow
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const [hours, minutes] = optimalTimes[0].split(':').map(Number)
    tomorrow.setHours(hours, minutes, 0, 0)
    
    return tomorrow.toISOString()
  }

  private async uploadToTikTok(schedule: any) {
    try {
      console.log(`Uploading video to TikTok: ${schedule.id}`)

      // Update status to uploading
      await supabase
        .from('schedules')
        .update({ 
          status: 'uploading',
          upload_attempt_count: schedule.upload_attempt_count + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', schedule.id)

      // Mock TikTok upload (replace with actual TikTok API)
      const uploadResult = await this.mockTikTokUpload(schedule)

      if (uploadResult.success) {
        await supabase
          .from('schedules')
          .update({
            status: 'published',
            tiktok_video_id: uploadResult.videoId,
            tiktok_share_url: uploadResult.shareUrl
          })
          .eq('id', schedule.id)

        await supabase
          .from('ideas')
          .update({ status: 'published' })
          .eq('id', schedule.idea_id)

        console.log(`Successfully uploaded video: ${uploadResult.videoId}`)
      } else {
        throw new Error(uploadResult.error)
      }

    } catch (error) {
      console.error('Error uploading to TikTok:', error)
      
      await supabase
        .from('schedules')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', schedule.id)
    }
  }

  private async mockTikTokUpload(schedule: any): Promise<{ success: boolean; videoId?: string; shareUrl?: string; error?: string }> {
    // Simulate upload time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 90% success rate for simulation
    if (Math.random() > 0.1) {
      const videoId = `tiktok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        success: true,
        videoId,
        shareUrl: `https://tiktok.com/@user/video/${videoId}`
      }
    } else {
      return {
        success: false,
        error: 'Upload failed due to network error'
      }
    }
  }

  private async fetchAnalytics() {
    try {
      console.log('Fetching TikTok analytics...')

      // Get published videos from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('status', 'published')
        .gte('updated_at', thirtyDaysAgo.toISOString())

      for (const schedule of schedules || []) {
        if (schedule.tiktok_video_id) {
          const metrics = await this.fetchVideoMetrics(schedule.tiktok_video_id)
          
          // Upsert analytics data
          await supabase
            .from('analytics')
            .upsert([{
              schedule_id: schedule.id,
              user_id: schedule.user_id,
              tiktok_video_id: schedule.tiktok_video_id,
              views: metrics.views,
              likes: metrics.likes,
              shares: metrics.shares,
              comments: metrics.comments,
              engagement_rate: metrics.engagementRate,
              revenue: metrics.revenue,
              fetch_date: new Date().toISOString()
            }], {
              onConflict: 'schedule_id,fetch_date'
            })
        }
      }

    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  private async fetchVideoMetrics(videoId: string) {
    // Mock TikTok analytics API call
    // Replace with actual TikTok Analytics API
    return {
      views: Math.floor(Math.random() * 100000) + 1000,
      likes: Math.floor(Math.random() * 10000) + 100,
      shares: Math.floor(Math.random() * 1000) + 10,
      comments: Math.floor(Math.random() * 500) + 5,
      engagementRate: Math.random() * 10 + 2,
      revenue: Math.random() * 50
    }
  }

  private async optimizeScheduleTimes() {
    try {
      console.log('Optimizing schedule times based on engagement...')

      // Get all users
      const { data: users } = await supabase.auth.admin.listUsers()

      for (const user of users.users) {
        // Get user's analytics data
        const { data: analytics } = await supabase
          .from('analytics')
          .select(`
            *,
            schedules(scheduled_time)
          `)
          .eq('user_id', user.id)
          .gte('fetch_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (!analytics || analytics.length < 5) continue

        // Analyze performance by hour
        const hourlyPerformance = this.analyzeHourlyPerformance(analytics)
        const optimalTimes = this.findOptimalTimes(hourlyPerformance)

        // Update user preferences
        await supabase
          .from('user_preferences')
          .upsert([{
            user_id: user.id,
            optimal_post_times: optimalTimes,
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'user_id'
          })

        console.log(`Updated optimal times for user ${user.id}:`, optimalTimes)
      }

    } catch (error) {
      console.error('Error optimizing schedule times:', error)
    }
  }

  private analyzeHourlyPerformance(analytics: any[]) {
    const hourlyStats: { [hour: number]: { totalEngagement: number; count: number } } = {}

    for (const record of analytics) {
      const hour = new Date(record.schedules.scheduled_time).getHours()
      const engagement = record.engagement_rate || 0

      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { totalEngagement: 0, count: 0 }
      }

      hourlyStats[hour].totalEngagement += engagement
      hourlyStats[hour].count += 1
    }

    // Calculate average engagement by hour
    const avgEngagementByHour: { [hour: number]: number } = {}
    for (const hour in hourlyStats) {
      const stats = hourlyStats[hour]
      avgEngagementByHour[hour] = stats.totalEngagement / stats.count
    }

    return avgEngagementByHour
  }

  private findOptimalTimes(hourlyPerformance: { [hour: number]: number }): string[] {
    // Sort hours by engagement rate
    const sortedHours = Object.entries(hourlyPerformance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 hours
      .map(([hour]) => parseInt(hour))
      .sort((a, b) => a - b) // Sort chronologically

    // Convert to time strings
    return sortedHours.map(hour => `${hour.toString().padStart(2, '0')}:00`)
  }

  private async recycleOldIdeas() {
    try {
      console.log('Recycling old ideas...')

      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      // Find published ideas older than 60 days
      const { data: oldIdeas } = await supabase
        .from('ideas')
        .select('*')
        .eq('status', 'published')
        .lt('updated_at', sixtyDaysAgo.toISOString())

      for (const idea of oldIdeas || []) {
        // Create new idea with updated text
        await supabase
          .from('ideas')
          .insert([{
            user_id: idea.user_id,
            text: `[RECYCLED] ${idea.text}`,
            status: 'queued',
            priority: 1,
            target_audience: idea.target_audience,
            keywords: idea.keywords
          }])

        console.log(`Recycled idea: ${idea.id}`)
      }

    } catch (error) {
      console.error('Error recycling old ideas:', error)
    }
  }

  stop() {
    this.isRunning = false
    console.log('Scheduler stopped')
  }
}

export const schedulerService = new SchedulerService()