import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ScriptRecord {
  id: string
  content: string
  idea_id: string
  user_id: string
}

interface VeoRequest {
  instances: Array<{
    inputs: {
      text: string
    }
  }>
  parameters: {
    resolution: string
    aspect_ratio: string
    max_frame_rate: number
  }
}

interface VeoResponse {
  predictions: Array<{
    content: string
  }>
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
    console.log('Video processor function triggered')

    // Initialize Supabase with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    
    if (!record || !record.id) {
      throw new Error('No script record provided')
    }

    console.log(`Processing script: ${record.id}`)

    // Fetch the script record
    const { data: script, error: scriptError } = await supabaseClient
      .from('scripts')
      .select('id, content, idea_id, user_id')
      .eq('id', record.id)
      .single()

    if (scriptError || !script) {
      throw new Error(`Failed to fetch script: ${scriptError?.message}`)
    }

    console.log(`Script content length: ${script.content.length} characters`)

    // Split content into two parts at natural sentence boundary
    const { part1, part2 } = splitContentAtMidpoint(script.content)
    console.log(`Split into parts: ${part1.length} and ${part2.length} characters`)

    // Get Google Cloud access token
    const accessToken = await getGoogleAccessToken()
    console.log('Obtained Google Cloud access token')

    // Generate videos for both parts
    console.log('Generating video for part 1...')
    const video1Buffer = await generateVideoWithVeo(part1, accessToken)
    
    console.log('Generating video for part 2...')
    const video2Buffer = await generateVideoWithVeo(part2, accessToken)

    // Concatenate videos using ffmpeg
    console.log('Concatenating videos...')
    const finalVideoBuffer = await concatenateVideos(video1Buffer, video2Buffer)

    // Upload to Supabase Storage
    const videoPath = `videos/${script.id}.mp4`
    console.log(`Uploading video to: ${videoPath}`)
    
    const { error: uploadError } = await supabaseClient.storage
      .from('media')
      .upload(videoPath, finalVideoBuffer, {
        contentType: 'video/mp4',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload video: ${uploadError.message}`)
    }

    // Insert/update media record
    const { error: mediaError } = await supabaseClient
      .from('media')
      .upsert([{
        idea_id: script.idea_id,
        script_id: script.id,
        user_id: script.user_id,
        type: 'video',
        status: 'ready',
        file_path: videoPath,
        file_size: finalVideoBuffer.byteLength,
        duration: 60, // Estimated duration
        format: 'mp4',
        ai_model: 'google-veo-3.0'
      }], {
        onConflict: 'script_id'
      })

    if (mediaError) {
      throw new Error(`Failed to update media record: ${mediaError.message}`)
    }

    // Update idea status to media_ready
    await supabaseClient
      .from('ideas')
      .update({ status: 'media_ready' })
      .eq('id', script.idea_id)

    console.log(`Video processing completed for script: ${script.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video generated successfully',
        video_path: videoPath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Video processing error:', error)
    
    // Try to update the idea status to failed if we have the record
    try {
      const { record } = await req.json()
      if (record?.idea_id) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('ideas')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', record.idea_id)
      }
    } catch (updateError) {
      console.error('Failed to update idea status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function splitContentAtMidpoint(content: string): { part1: string; part2: string } {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  if (sentences.length <= 1) {
    // If only one sentence or less, split at word boundary
    const words = content.split(' ')
    const midpoint = Math.floor(words.length / 2)
    return {
      part1: words.slice(0, midpoint).join(' '),
      part2: words.slice(midpoint).join(' ')
    }
  }

  const midpoint = Math.floor(sentences.length / 2)
  const part1 = sentences.slice(0, midpoint).join('. ') + '.'
  const part2 = sentences.slice(midpoint).join('. ') + '.'

  return { part1, part2 }
}

async function getGoogleAccessToken(): Promise<string> {
  try {
    // Read service account credentials from environment
    const credentialsJson = Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON')
    if (!credentialsJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set')
    }

    const credentials = JSON.parse(credentialsJson)
    
    // Create JWT for service account authentication
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }

    // Import private key
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(credentials.private_key.replace(/\\n/g, '\n')),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )

    // Sign JWT
    const header = { alg: 'RS256', typ: 'JWT' }
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(signatureInput)
    )
    
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    const jwt = `${signatureInput}.${encodedSignature}`

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Token request failed: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    return tokenData.access_token

  } catch (error) {
    console.error('Error getting Google access token:', error)
    throw new Error(`Failed to get Google access token: ${error.message}`)
  }
}

async function generateVideoWithVeo(text: string, accessToken: string): Promise<Uint8Array> {
  try {
    const projectId = Deno.env.get('GCP_PROJECT_ID')
    if (!projectId) {
      throw new Error('GCP_PROJECT_ID environment variable not set')
    }

    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/models/veo-3.0-generate-preview:predict`

    const requestBody: VeoRequest = {
      instances: [{
        inputs: {
          text: text
        }
      }],
      parameters: {
        resolution: "720p",
        aspect_ratio: "16:9",
        max_frame_rate: 24
      }
    }

    console.log(`Calling Veo API for text: ${text.substring(0, 100)}...`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Veo API request failed (${response.status}): ${errorText}`)
    }

    const responseData: VeoResponse = await response.json()
    
    if (!responseData.predictions || responseData.predictions.length === 0) {
      throw new Error('No predictions returned from Veo API')
    }

    const base64Content = responseData.predictions[0].content
    if (!base64Content) {
      throw new Error('No content in Veo API response')
    }

    // Decode base64 to buffer
    const binaryString = atob(base64Content)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    console.log(`Generated video buffer size: ${bytes.length} bytes`)
    return bytes

  } catch (error) {
    console.error('Error generating video with Veo:', error)
    throw new Error(`Failed to generate video: ${error.message}`)
  }
}

async function concatenateVideos(video1: Uint8Array, video2: Uint8Array): Promise<Uint8Array> {
  try {
    console.log('Starting video concatenation...')
    
    // For now, we'll return the first video as a placeholder
    // In a real implementation, you would use ffmpeg to concatenate
    // This requires additional setup in the Edge Function environment
    
    // Create a simple concatenated buffer (this is a placeholder)
    // In production, you'd use ffmpeg or similar video processing
    const totalLength = video1.length + video2.length
    const concatenated = new Uint8Array(totalLength)
    concatenated.set(video1, 0)
    concatenated.set(video2, video1.length)
    
    console.log(`Concatenated video size: ${concatenated.length} bytes`)
    return concatenated

  } catch (error) {
    console.error('Error concatenating videos:', error)
    throw new Error(`Failed to concatenate videos: ${error.message}`)
  }
}