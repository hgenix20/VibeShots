import React from 'react'
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'

interface TikTokConnectorProps {
  user: any
}

export const TikTokConnector: React.FC<TikTokConnectorProps> = ({ user }) => {
  // Check if user has TikTok access token (you'll need to add this field to your user data)
  const isConnected = Boolean(user?.tiktokAccessToken)

  const connectTikTok = () => {
    const params = new URLSearchParams({
      client_key: import.meta.env.VITE_TIKTOK_CLIENT_KEY || '',
      response_type: 'code',
      scope: 'user.info.basic,video.upload',
      redirect_uri: `${window.location.origin}/api/tiktok/callback`,
      state: crypto.randomUUID(), // CSRF token
    }).toString()

    window.location.href = `https://open-api.tiktok.com/platform/oauth/connect?${params}`
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-orange-100'}`}>
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">TikTok Integration</h3>
            <p className="text-sm text-gray-600">
              {isConnected 
                ? 'Your TikTok account is connected and ready for auto-posting' 
                : 'Connect your TikTok account to enable automatic video publishing'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <button
              onClick={connectTikTok}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Connect TikTok</span>
            </button>
          )}
        </div>
      </div>
      
      {!isConnected && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-700">
              <p className="font-medium mb-1">Action Required</p>
              <p>
                To start auto-posting your generated videos, you need to connect your TikTok account. 
                This allows Vibe Shots to publish content on your behalf according to your schedule preferences.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}