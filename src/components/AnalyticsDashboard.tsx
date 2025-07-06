import React, { useState, useEffect } from 'react'
import { TrendingUp, Eye, Heart, Share, DollarSign, Clock, RotateCcw, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { DashboardData, apiService } from '../services/api'
import { TikTokConnector } from './TikTokConnector'

interface AnalyticsDashboardProps {
  user: any
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user }) => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await apiService.getDashboardAnalytics(timeRange)
      if (response.success && response.data) {
        setData(response.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No analytics data available</p>
        <p className="text-sm">Publish some videos to see your performance!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* TikTok Connection Status */}
      <TikTokConnector user={user} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Analytics Dashboard</h3>
          <p className="text-sm text-gray-600 mt-1">Track your content performance and engagement</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={fetchAnalytics}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalVideos}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-red-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalLikes.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-green-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shares</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalShares.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <Share className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-yellow-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${data.overview.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.avgEngagement}%</p>
            </div>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Videos */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-purple-100">
          <h4 className="text-lg font-semibold text-gray-800">Top Performing Videos</h4>
        </div>
        
        <div className="p-6">
          {data.topVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No performance data yet</p>
              <p className="text-sm">Publish some videos to see analytics!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.topVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-purple-200 text-purple-700'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {video.ideaText}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{video.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="font-medium">{video.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{video.shares}</span>
                    </div>
                    <div className="text-purple-600 font-medium">
                      {video.engagementRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Optimal Posting Times */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-purple-100">
          <h4 className="text-lg font-semibold text-gray-800">Optimal Posting Times</h4>
          <p className="text-sm text-gray-600 mt-1">AI-recommended times based on your audience engagement</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.optimalTimes.map((time, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-semibold text-gray-900">{time}</div>
                <div className="text-sm text-gray-600">{data.timezone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}