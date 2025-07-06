import React from 'react'
import { ExternalLink, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface TikTokConnectorProps {
  user: any
}

export const TikTokConnector: React.FC<TikTokConnectorProps> = ({ user }) => {
  // Check if user has TikTok access token (you'll need to add this field to your user data)
  const isConnected = Boolean(user?.user_metadata?.tiktokAccessToken)

  const connectTikTok = () => {
    const params = new URLSearchParams({
      client_key: import.meta.env.VITE_TIKTOK_CLIENT_KEY || 'sbaw95xcifhll8mkef',
      response_type: 'code',
      scope: 'user.info.basic,video.upload',
      redirect_uri: import.meta.env.VITE_TIKTOK_REDIRECT_URI || `${window.location.origin}/auth/tiktok/callback`,
      state: crypto.randomUUID(), // CSRF token
    }).toString()

    window.location.href = `https://open-api.tiktok.com/platform/oauth/connect?${params}`
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${isConnected ? 'bg-green-100' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
            {isConnected ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingUp className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">TikTok Integration</h3>
            <p className="text-sm text-gray-600">
              {isConnected 
                ? '✅ Connected and ready for auto-posting' 
                : 'Connect your TikTok account to unlock analytics and auto-posting'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <button 
                onClick={() => {
                  // TODO: Implement disconnect functionality
                  console.log('Disconnecting TikTok account...')
                }}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectTikTok}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Connect TikTok</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {!isConnected && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2">Unlock Full Analytics & Auto-Posting</h4>
              <p>
                Connect your TikTok account to access detailed performance analytics, automated posting, 
                and AI-optimized scheduling based on your audience engagement patterns.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Real-time analytics</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Automated posting</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Optimal timing AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}