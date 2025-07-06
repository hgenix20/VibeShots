import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    switch (req.method) {
      case 'GET':
        // Get scheduled media
        const { data: schedules, error: getError } = await supabaseClient
          .from('schedules')
          .select(`
            *,
            media(
              id,
              type,
              duration,
              file_size,
              format,
              file_path
            ),
            ideas(id, text, target_audience)
          `)
          .eq('user_id', user.id)
          .in('status', ['pending', 'uploading'])
          .order('scheduled_time', { ascending: true })

        if (getError) throw getError

        return new Response(
          JSON.stringify({ success: true, data: schedules }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'POST':
        const { media_id, scheduled_time } = await req.json()

        if (!media_id || !scheduled_time) {
          return new Response(
            JSON.stringify({ success: false, error: 'Media ID and scheduled time are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate scheduled time is in the future
        const scheduledDate = new Date(scheduled_time)
        if (scheduledDate <= new Date()) {
          return new Response(
            JSON.stringify({ success: false, error: 'Scheduled time must be in the future' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get media details
        const { data: media, error: mediaError } = await supabaseClient
          .from('media')
          .select('id, idea_id, user_id, status')
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

        // Create schedule
        const { data: newSchedule, error: scheduleError } = await supabaseClient
          .from('schedules')
          .insert([{
            media_id: media.id,
            idea_id: media.idea_id,
            user_id: user.id,
            scheduled_time: scheduled_time,
            status: 'pending'
          }])
          .select()
          .single()

        if (scheduleError) throw scheduleError

        // Update idea status to scheduled
        await supabaseClient
          .from('ideas')
          .update({ status: 'scheduled' })
          .eq('id', media.idea_id)

        return new Response(
          JSON.stringify({ success: true, data: newSchedule }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Schedules API error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})