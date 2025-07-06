import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const { media_id } = await req.json()

    if (!media_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Media ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get media details
    const { data: media, error: mediaError } = await supabaseClient
      .from('media')
      .select(`
        id, 
        idea_id, 
        user_id, 
        status, 
        file_path,
        ideas(id, text),
        scripts(content, hook, call_to_action)
      `)
      .eq('id', media_id)
      .eq('user_id', user.id)
      .eq('status', 'ready')
      .single()

    if (mediaError || !media) {
      return new Response(
        JSON.stringify({ success: false, error: 'Media not found or not ready' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has TikTok connection
    const { data: userData } = await supabaseClient.auth.getUser()
    const tiktokToken = userData.user?.user_metadata?.tiktokAccessToken

    if (!tiktokToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'TikTok account not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create immediate schedule (current time)
    const { data: newSchedule, error: scheduleError } = await supabaseClient
      .from('schedules')
      .insert([{
        media_id: media.id,
        idea_id: media.idea_id,
        user_id: user.id,
        scheduled_time: new Date().toISOString(),
        status: 'uploading'
      }])
      .select()
      .single()

    if (scheduleError) throw scheduleError

    // Update idea status to scheduled
    await supabaseClient
      .from('ideas')
      .update({ status: 'scheduled' })
      .eq('id', media.idea_id)

    // Trigger immediate upload to TikTok
    try {
      const uploadResult = await uploadToTikTok(media, tiktokToken)
      
      if (uploadResult.success) {
        // Update schedule with success
        await supabaseClient
          .from('schedules')
          .update({
            status: 'published',
            tiktok_video_id: uploadResult.videoId,
            tiktok_share_url: uploadResult.shareUrl
          })
          .eq('id', newSchedule.id)

        // Update idea status to published
        await supabaseClient
          .from('ideas')
          .update({ status: 'published' })
          .eq('id', media.idea_id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              ...newSchedule, 
              status: 'published',
              tiktok_video_id: uploadResult.videoId,
              tiktok_share_url: uploadResult.shareUrl
            } 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        throw new Error(uploadResult.error)
      }
    } catch (uploadError) {
      // Update schedule with failure
      await supabaseClient
        .from('schedules')
        .update({
          status: 'failed',
          error_message: uploadError.message,
          upload_attempt_count: 1
        })
        .eq('id', newSchedule.id)

      // Update idea status to failed
      await supabaseClient
        .from('ideas')
        .update({ 
          status: 'failed',
          error_message: uploadError.message 
        })
        .eq('id', media.idea_id)

      return new Response(
        JSON.stringify({ success: false, error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Post now API error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function uploadToTikTok(media: any, accessToken: string) {
  // Mock TikTok upload for now - replace with actual TikTok API
  console.log('Uploading to TikTok:', media.id)
  
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