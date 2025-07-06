import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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
      case 'POST':
        // Update TikTok connection
        const { access_token, refresh_token } = await req.json()

        if (!access_token) {
          return new Response(
            JSON.stringify({ success: false, error: 'Access token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update user metadata with TikTok tokens
        const { error: updateError } = await supabaseClient.auth.updateUser({
          data: {
            tiktokAccessToken: access_token,
            tiktokRefreshToken: refresh_token,
            tiktokConnectedAt: new Date().toISOString()
          }
        })

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ success: true, message: 'TikTok account connected successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        // Disconnect TikTok account
        const { error: disconnectError } = await supabaseClient.auth.updateUser({
          data: {
            tiktokAccessToken: null,
            tiktokRefreshToken: null,
            tiktokConnectedAt: null
          }
        })

        if (disconnectError) throw disconnectError

        return new Response(
          JSON.stringify({ success: true, message: 'TikTok account disconnected successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('TikTok auth API error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})