import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { apiService } from '../services/api'

export const TikTokCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`TikTok authorization failed: ${error}`)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received from TikTok')
        return
      }

      // Exchange code for access token
      const tokenResponse = await exchangeCodeForToken(code)
      
      if (tokenResponse.success) {
        // Update user's TikTok connection
        const updateResponse = await apiService.updateTikTokConnection(
          tokenResponse.access_token,
          tokenResponse.refresh_token
        )

        if (updateResponse.success) {
          setStatus('success')
          setMessage('TikTok account connected successfully!')
          
          // Redirect to analytics page after 2 seconds
          setTimeout(() => {
            navigate('/?tab=analytics')
          }, 2000)
        } else {
          throw new Error(updateResponse.error)
        }
      } else {
        throw new Error(tokenResponse.error)
      }
    } catch (error) {
      console.error('TikTok callback error:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to connect TikTok account')
    }
  }

  const exchangeCodeForToken = async (code: string) => {
    try {
      // This would normally be done on your backend to keep client secret secure
      const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: import.meta.env.VITE_TIKTOK_CLIENT_KEY || 'sbaw95xcifhll8mkef',
          client_secret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || 'a0XybhtW3jsL5VX4BpsBEID7BiDkB9MP',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: import.meta.env.VITE_TIKTOK_REDIRECT_URI || `${window.location.origin}/auth/tiktok/callback`,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        return { success: false, error: data.error_description || data.error }
      }

      return {
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to exchange code for token'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl inline-block mb-6">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Connecting TikTok</h1>
            <p className="text-gray-600">Please wait while we connect your TikTok account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 p-4 rounded-xl inline-block mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Success!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you back to the app...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 p-4 rounded-xl inline-block mb-6">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Connection Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:from-purple-700 hover:to-pink-700"
            >
              Return to App
            </button>
          </>
        )}
      </div>
    </div>
  )
}