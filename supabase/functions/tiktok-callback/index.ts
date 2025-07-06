import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TikTokWebhookPayload {
  event: string
  video_id: string
  status: 'success' | 'failed'
  share_url?: string
  error_message?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: TikTokWebhookPayload = await req.json()
    console.log('TikTok webhook received:', payload)

    // Verify webhook signature (implement based on TikTok's requirements)
    const signature = req.headers.get('x-tiktok-signature')
    if (!verifyWebhookSignature(payload, signature)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the schedule record by TikTok video ID
    const { data: schedule, error: scheduleError } = await supabaseClient
      .from('schedules')
      .select(`
        *,
        media(*),
        ideas(*)
      `)
      .eq('tiktok_video_id', payload.video_id)
      .single()

    if (scheduleError || !schedule) {
      console.error('Schedule not found for video ID:', payload.video_id)
      return new Response(
        JSON.stringify({ success: false, error: 'Schedule not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (payload.event === 'video.published' && payload.status === 'success') {
      // Update schedule status to published
      await supabaseClient
        .from('schedules')
        .update({
          status: 'published',
          tiktok_share_url: payload.share_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)

      // Update idea status to published
      await supabaseClient
        .from('ideas')
        .update({
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.idea_id)

      // Delete video file from storage to save space
      if (schedule.media?.file_path) {
        const { error: deleteError } = await supabaseClient.storage
          .from('videos')
          .remove([schedule.media.file_path])

        if (deleteError) {
          console.error('Error deleting video file:', deleteError)
        } else {
          // Update media status to uploaded (file deleted)
          await supabaseClient
            .from('media')
            .update({
              status: 'uploaded',
              updated_at: new Date().toISOString()
            })
            .eq('id', schedule.media.id)
        }
      }

      // Initialize analytics record
      await supabaseClient
        .from('analytics')
        .insert([{
          schedule_id: schedule.id,
          user_id: schedule.user_id,
          tiktok_video_id: payload.video_id,
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          engagement_rate: 0,
          revenue: 0
        }])

      console.log('Video published successfully:', payload.video_id)

    } else if (payload.status === 'failed') {
      // Update schedule status to failed
      await supabaseClient
        .from('schedules')
        .update({
          status: 'failed',
          error_message: payload.error_message,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)

      // Get current retry count for the idea
      const { data: currentIdea } = await supabaseClient
        .from('ideas')
        .select('retry_count')
        .eq('id', schedule.idea_id)
        .single()
      
      const newRetryCount = (currentIdea?.retry_count || 0) + 1

      // Update idea status to failed
      await supabaseClient
        .from('ideas')
        .update({
          status: 'failed',
          error_message: payload.error_message,
          retry_count: newRetryCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.idea_id)

      console.log('Video upload failed:', payload.video_id, payload.error_message)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('TikTok webhook error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // Implement TikTok webhook signature verification
  // This is a placeholder - implement according to TikTok's documentation
  return true
}