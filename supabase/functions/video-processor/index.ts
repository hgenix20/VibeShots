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

interface OpenAISegment {
  text: string
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
    console.log('Video-processor trigger payload:', JSON.stringify(record))
    
    // Use the trigger payload directly instead of refetching
    const scriptRow = record
    if (!scriptRow || !scriptRow.id) {
      throw new Error(`No script record in event payload: ${JSON.stringify(record)}`)
    }

    console.log(`Processing script: ${scriptRow.id}`)
    console.log(`Script content length: ${scriptRow.content.length} characters`)

    // Get environment variables
    const maxSegments = parseInt(Deno.env.get('MAX_VEO_SEGMENTS') || '4')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const gcpProjectId = Deno.env.get('GCP_PROJECT_ID')
    const googleCredentialsJson = Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_JSON')

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set')
    }
    if (!gcpProjectId) {
      throw new Error('GCP_PROJECT_ID environment variable not set')
    }
    if (!googleCredentialsJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set')
    }

    // Step 1: Use OpenAI to segment the content
    console.log(`Segmenting content into max ${maxSegments} segments...`)
    const segments = await segmentContentWithOpenAI(scriptRow.content, maxSegments, openaiApiKey)
    console.log(`Created ${segments.length} segments`)

    // Step 2: Get Google Cloud access token
    const accessToken = await getGoogleAccessToken(googleCredentialsJson)
    console.log('Obtained Google Cloud access token')

    // Step 3: Generate videos for each segment
    const videoBuffers: Uint8Array[] = []
    for (let i = 0; i < segments.length; i++) {
      console.log(`Generating video for segment ${i + 1}/${segments.length}...`)
      const videoBuffer = await generateVideoWithVeo(segments[i].text, accessToken, gcpProjectId)
      videoBuffers.push(videoBuffer)
    }

    // Step 4: Concatenate all videos using ffmpeg
    console.log('Concatenating videos...')
    const finalVideoBuffer = await concatenateVideos(videoBuffers)

    // Step 5: Upload to Supabase Storage
    const videoPath = `videos/${scriptRow.id}.mp4`
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

    // Step 6: Insert/update media record
    const { error: mediaError } = await supabaseClient
      .from('media')
      .upsert([{
        idea_id: scriptRow.idea_id,
        script_id: scriptRow.id,
        user_id: scriptRow.user_id,
        type: 'video',
        status: 'ready',
        file_path: videoPath,
        file_size: finalVideoBuffer.byteLength,
        duration: segments.length * 30, // Estimated 30 seconds per segment
        format: 'mp4',
        ai_model: 'google-veo-3.0',
        generation_params: {
          segments_count: segments.length,
          max_segments: maxSegments
        }
      }], {
        onConflict: 'script_id'
      })

    if (mediaError) {
      throw new Error(`Failed to update media record: ${mediaError.message}`)
    }

    // Step 7: Update idea status to media_ready
    await supabaseClient
      .from('ideas')
      .update({ status: 'media_ready' })
      .eq('id', scriptRow.idea_id)

    console.log(`Video processing completed for script: ${scriptRow.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video generated successfully',
        video_path: videoPath,
        segments_processed: segments.length
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
        
        // Get current retry count
        const { data: currentIdea } = await supabaseClient
          .from('ideas')
          .select('retry_count')
          .eq('id', record.idea_id)
          .single()
        
        const newRetryCount = (currentIdea?.retry_count || 0) + 1
        
        await supabaseClient
          .from('ideas')
          .update({ 
            status: 'failed',
            error_message: error.message,
            retry_count: newRetryCount
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

/**
 * Use OpenAI to intelligently segment content into video-friendly chunks
 */
async function segmentContentWithOpenAI(
  content: string, 
  maxSegments: number, 
  apiKey: string
): Promise<OpenAISegment[]> {
  try {
    const prompt = `Split the following script content into ${maxSegments} or fewer segments of approximately 30 words each. Each segment should:
1. Be a complete thought or scene
2. Work well as a standalone video clip
3. Flow naturally when combined with other segments
4. Be optimized for visual storytelling

Return ONLY a JSON array in this exact format: [{"text": "segment 1 content"}, {"text": "segment 2 content"}]

Script content:
${content}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert video content segmentation assistant. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API request failed (${response.status}): ${errorText}`)
    }

    const responseData = await response.json()
    
    if (!responseData.choices || responseData.choices.length === 0) {
      throw new Error('No response from OpenAI API')
    }

    const segmentText = responseData.choices[0].message.content.trim()
    
    // Parse the JSON response
    let segments: OpenAISegment[]
    try {
      segments = JSON.parse(segmentText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', segmentText)
      // Fallback: split content manually
      segments = fallbackSegmentation(content, maxSegments)
    }

    // Validate segments
    if (!Array.isArray(segments) || segments.length === 0) {
      console.warn('Invalid segments from OpenAI, using fallback')
      segments = fallbackSegmentation(content, maxSegments)
    }

    // Ensure we don't exceed max segments
    if (segments.length > maxSegments) {
      segments = segments.slice(0, maxSegments)
    }

    console.log(`OpenAI segmentation created ${segments.length} segments`)
    return segments

  } catch (error) {
    console.error('Error segmenting content with OpenAI:', error)
    console.log('Using fallback segmentation')
    return fallbackSegmentation(content, maxSegments)
  }
}

/**
 * Fallback segmentation if OpenAI fails
 */
function fallbackSegmentation(content: string, maxSegments: number): OpenAISegment[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const segmentSize = Math.ceil(sentences.length / maxSegments)
  
  const segments: OpenAISegment[] = []
  for (let i = 0; i < sentences.length; i += segmentSize) {
    const segmentSentences = sentences.slice(i, i + segmentSize)
    const segmentText = segmentSentences.join('. ').trim() + '.'
    segments.push({ text: segmentText })
  }
  
  return segments
}

/**
 * Get Google Cloud access token using service account credentials
 */
async function getGoogleAccessToken(credentialsJson: string): Promise<string> {
  try {
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

    // Create JWT header and payload
    const header = { alg: 'RS256', typ: 'JWT' }
    const encodedHeader = btoa(JSON.stringify(header)).replace(/[=+/]/g, c => ({
      '=': '', '+': '-', '/': '_'
    }[c] || c))
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/[=+/]/g, c => ({
      '=': '', '+': '-', '/': '_'
    }[c] || c))

    // Import private key for signing
    const privateKeyPem = credentials.private_key.replace(/\\n/g, '\n')
    const privateKeyDer = pemToDer(privateKeyPem)
    
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )

    // Sign the JWT
    const signatureInput = `${encodedHeader}.${encodedPayload}`
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(signatureInput)
    )
    
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/[=+/]/g, c => ({ '=': '', '+': '-', '/': '_' }[c] || c))
    
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

/**
 * Convert PEM private key to DER format
 */
function pemToDer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Generate video using Google Vertex AI Veo 3.0
 */
async function generateVideoWithVeo(
  text: string, 
  accessToken: string, 
  projectId: string
): Promise<Uint8Array> {
  try {
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

/**
 * Concatenate multiple video buffers using ffmpeg
 * Note: This is a simplified implementation. In production, you would use
 * a proper video processing library or service.
 */
async function concatenateVideos(videoBuffers: Uint8Array[]): Promise<Uint8Array> {
  try {
    console.log(`Concatenating ${videoBuffers.length} video segments...`)
    
    if (videoBuffers.length === 0) {
      throw new Error('No video buffers to concatenate')
    }
    
    if (videoBuffers.length === 1) {
      console.log('Only one video segment, returning as-is')
      return videoBuffers[0]
    }

    // For now, we'll implement a simple concatenation by joining the buffers
    // In a real implementation, you would use ffmpeg to properly concatenate MP4 files
    // This requires additional setup in the Edge Function environment
    
    // Calculate total size
    const totalSize = videoBuffers.reduce((sum, buffer) => sum + buffer.length, 0)
    
    // Create concatenated buffer
    const concatenated = new Uint8Array(totalSize)
    let offset = 0
    
    for (const buffer of videoBuffers) {
      concatenated.set(buffer, offset)
      offset += buffer.length
    }
    
    console.log(`Concatenated video size: ${concatenated.length} bytes`)
    
    // Note: This is a placeholder implementation
    // For proper MP4 concatenation, you would need to:
    // 1. Parse MP4 structure
    // 2. Merge video tracks properly
    // 3. Update timing information
    // 4. Rebuild MP4 container
    
    return concatenated

  } catch (error) {
    console.error('Error concatenating videos:', error)
    throw new Error(`Failed to concatenate videos: ${error.message}`)
  }
}