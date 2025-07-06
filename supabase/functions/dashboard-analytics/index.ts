import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const timeRange = url.searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get analytics data
    const { data: analytics, error: analyticsError } = await supabaseClient
      .from('analytics')
      .select(`
        *,
        schedules(
          idea_id,
          tiktok_share_url,
          ideas(text)
        )
      `)
      .eq('user_id', user.id)
      .gte('fetch_date', startDate.toISOString())
      .order('fetch_date', { ascending: false })

    if (analyticsError) throw analyticsError

    // Get pipeline stats
    const { data: pipelineStats, error: pipelineError } = await supabaseClient
      .from('ideas')
      .select('status')
      .eq('user_id', user.id)

    if (pipelineError) throw pipelineError

    // Calculate totals
    const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0)
    const totalLikes = analytics.reduce((sum, a) => sum + (a.likes || 0), 0)
    const totalShares = analytics.reduce((sum, a) => sum + (a.shares || 0), 0)
    const totalRevenue = analytics.reduce((sum, a) => sum + (a.revenue || 0), 0)

    // Calculate engagement rate
    const avgEngagement = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analytics.length 
      : 0

    // Pipeline status counts
    const statusCounts = pipelineStats.reduce((acc, idea) => {
      acc[idea.status] = (acc[idea.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top performing videos
    const topVideos = analytics
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        ideaText: a.schedules?.ideas?.text || 'Unknown',
        views: a.views || 0,
        likes: a.likes || 0,
        shares: a.shares || 0,
        engagementRate: a.engagement_rate || 0,
        url: a.schedules?.tiktok_share_url
      }))

    // Get user preferences for optimal posting times
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('optimal_post_times, timezone')
      .eq('user_id', user.id)
      .single()

    const dashboardData = {
      overview: {
        totalVideos: analytics.length,
        totalViews,
        totalLikes,
        totalShares,
        totalRevenue,
        avgEngagement: Math.round(avgEngagement * 100) / 100
      },
      pipeline: {
        queued: statusCounts.queued || 0,
        processing: statusCounts.processing || 0,
        scriptGenerated: statusCounts.script_generated || 0,
        mediaReady: statusCounts.media_ready || 0,
        scheduled: statusCounts.scheduled || 0,
        published: statusCounts.published || 0,
        failed: statusCounts.failed || 0
      },
      topVideos,
      optimalTimes: preferences?.optimal_post_times || ['09:00', '15:00', '21:00'],
      timezone: preferences?.timezone || 'UTC',
      timeRange
    }

    return new Response(
      JSON.stringify({ success: true, data: dashboardData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})