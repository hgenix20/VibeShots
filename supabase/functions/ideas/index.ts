import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface Idea {
  id?: string
  user_id?: string
  text: string
  status?: string
  priority?: number
  target_audience?: string
  keywords?: string[]
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

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const ideaId = pathSegments[pathSegments.length - 1]

    switch (req.method) {
      case 'GET':
        if (ideaId && ideaId !== 'ideas') {
          // Get specific idea
          const { data, error } = await supabaseClient
            .from('ideas')
            .select(`
              *,
              scripts(*),
              media(*),
              schedules(*)
            `)
            .eq('id', ideaId)
            .single()

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Get all ideas for user
          const { data, error } = await supabaseClient
            .from('ideas')
            .select(`
              *,
              scripts(id, content, estimated_duration),
              media(id, type, status, duration),
              schedules(id, scheduled_time, status, tiktok_share_url)
            `)
            .order('created_at', { ascending: false })

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        const { text, priority, target_audience, keywords }: Idea = await req.json()

        if (!text?.trim()) {
          return new Response(
            JSON.stringify({ success: false, error: 'Idea text is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get user from JWT
        const { data: { user } } = await supabaseClient.auth.getUser()
        if (!user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: newIdea, error } = await supabaseClient
          .from('ideas')
          .insert([{
            user_id: user.id,
            text: text.trim(),
            priority: priority || 1,
            target_audience,
            keywords
          }])
          .select()
          .single()

        if (error) throw error

        // Trigger script generation pipeline
        await triggerScriptGeneration(newIdea.id, supabaseClient)

        return new Response(
          JSON.stringify({ success: true, data: newIdea }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Ideas API error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function triggerScriptGeneration(ideaId: string, supabaseClient: any) {
  try {
    // Update idea status to processing
    await supabaseClient
      .from('ideas')
      .update({ status: 'processing', processed_at: new Date().toISOString() })
      .eq('id', ideaId)

    // Call OpenAI to generate script
    const { data: idea } = await supabaseClient
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    const script = await generateScript(idea.text, idea.target_audience)

    // Save script
    const { data: newScript } = await supabaseClient
      .from('scripts')
      .insert([{
        idea_id: ideaId,
        user_id: idea.user_id,
        content: script.content,
        hook: script.hook,
        call_to_action: script.cta,
        estimated_duration: script.duration,
        ai_model: 'openai-gpt-4'
      }])
      .select()
      .single()

    // Update idea status
    await supabaseClient
      .from('ideas')
      .update({ status: 'script_generated' })
      .eq('id', ideaId)

    // Trigger audio generation
    await triggerAudioGeneration(newScript.id, supabaseClient)

  } catch (error) {
    console.error('Script generation error:', error)
    
    // Get current retry count
    const { data: currentIdea } = await supabaseClient
      .from('ideas')
      .select('retry_count')
      .eq('id', ideaId)
      .single()
    
    const newRetryCount = (currentIdea?.retry_count || 0) + 1
    
    await supabaseClient
      .from('ideas')
      .update({ 
        status: 'failed', 
        error_message: error.message,
        retry_count: newRetryCount
      })
      .eq('id', ideaId)
  }
}

async function generateScript(ideaText: string, targetAudience?: string) {
  const prompt = `Create an engaging TikTok script for: "${ideaText}"
${targetAudience ? `Target audience: ${targetAudience}` : ''}

Requirements:
- Strong hook in first 3 seconds
- 45-60 seconds total duration
- Clear call-to-action
- Engaging and viral-worthy content

Format your response as JSON:
{
  "hook": "Opening hook text",
  "content": "Full script content",
  "cta": "Call to action",
  "duration": 60
}`

  // Mock OpenAI response for now
  return {
    hook: "Wait, this will change everything you know about...",
    content: `Wait, this will change everything you know about ${ideaText}! Here's what nobody tells you... [Continue with engaging content about ${ideaText}] Try this today and let me know how it goes!`,
    cta: "Follow for more tips like this!",
    duration: 55
  }
}

async function triggerAudioGeneration(scriptId: string, supabaseClient: any) {
  try {
    const { data: script } = await supabaseClient
      .from('scripts')
      .select('*, ideas(*)')
      .eq('id', scriptId)
      .single()

    // Create media record for audio
    const { data: audioMedia } = await supabaseClient
      .from('media')
      .insert([{
        script_id: scriptId,
        idea_id: script.idea_id,
        user_id: script.user_id,
        type: 'audio',
        status: 'generating',
        ai_model: 'coqui-tts'
      }])
      .select()
      .single()

    // Simulate audio generation (replace with actual Coqui TTS)
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Update audio media as ready
    await supabaseClient
      .from('media')
      .update({ 
        status: 'ready',
        file_path: `audio/${audioMedia.id}.wav`,
        duration: script.estimated_duration,
        format: 'wav'
      })
      .eq('id', audioMedia.id)

    // Trigger video generation
    await triggerVideoGeneration(scriptId, audioMedia.id, supabaseClient)

  } catch (error) {
    console.error('Audio generation error:', error)
  }
}

async function triggerVideoGeneration(scriptId: string, audioMediaId: string, supabaseClient: any) {
  try {
    const { data: script } = await supabaseClient
      .from('scripts')
      .select('*, ideas(*)')
      .eq('id', scriptId)
      .single()

    // Create media record for video
    const { data: videoMedia } = await supabaseClient
      .from('media')
      .insert([{
        script_id: scriptId,
        idea_id: script.idea_id,
        user_id: script.user_id,
        type: 'video',
        status: 'generating',
        ai_model: 'huggingface-video-gen'
      }])
      .select()
      .single()

    // Simulate video generation
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Update video media as ready
    await supabaseClient
      .from('media')
      .update({ 
        status: 'ready',
        file_path: `videos/${videoMedia.id}.mp4`,
        duration: script.estimated_duration,
        format: 'mp4'
      })
      .eq('id', videoMedia.id)

    // Update idea status to media_ready
    await supabaseClient
      .from('ideas')
      .update({ status: 'media_ready' })
      .eq('id', script.idea_id)

  } catch (error) {
    console.error('Video generation error:', error)
  }
}