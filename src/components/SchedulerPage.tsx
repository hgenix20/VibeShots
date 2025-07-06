import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Play, Send, Filter, Search, Grid, List } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { apiService } from '../services/api'

interface SchedulerPageProps {
  onPreviewMedia: (media: any) => void
}

export const SchedulerPage: React.FC<SchedulerPageProps> = ({ onPreviewMedia }) => {
  const [readyMedia, setReadyMedia] = useState<any[]>([])
  const [scheduledMedia, setScheduledMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'scheduled'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      // TODO: Implement API calls to fetch ready and scheduled media
      // Mock data for now
      const mockReadyMedia = [
        {
          id: '1',
          type: 'video',
          status: 'ready',
          duration: 58,
          file_size: 4500000,
          format: 'mp4',
          created_at: new Date().toISOString(),
          idea: { text: 'Top 5 productivity tips for remote workers' },
          script: {
            hook: 'Stop wasting time with these productivity hacks!',
            content: 'Here are 5 game-changing productivity tips...',
            call_to_action: 'Follow for more productivity tips!'
          }
        },
        {
          id: '2',
          type: 'video',
          status: 'ready',
          duration: 45,
          file_size: 3800000,
          format: 'mp4',
          created_at: new Date().toISOString(),
          idea: { text: 'Quick morning routine for busy parents' },
          script: {
            hook: 'Busy parents, this 5-minute routine will save your mornings!',
            content: 'Transform your chaotic mornings with this simple routine...',
            call_to_action: 'Save this for tomorrow morning!'
          }
        }
      ]

      const mockScheduledMedia = [
        {
          id: '3',
          type: 'video',
          status: 'scheduled',
          scheduled_time: addDays(new Date(), 1).toISOString(),
          duration: 52,
          idea: { text: 'Best budget meal prep ideas' }
        }
      ]

      setReadyMedia(mockReadyMedia)
      setScheduledMedia(mockScheduledMedia)
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = [...readyMedia, ...scheduledMedia].filter(media => {
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'ready' && media.status === 'ready') ||
      (filterStatus === 'scheduled' && media.status === 'scheduled')
    
    const matchesSearch = !searchTerm || 
      media.idea?.text.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleScheduleMedia = (mediaId: string, scheduledTime: string) => {
    if (scheduledTime) {
      // TODO: Implement scheduling API call
      console.log('Scheduling media:', mediaId, 'for:', scheduledTime)
      fetchMedia() // Refresh data
    }
  }

  const handlePostNow = (mediaId: string) => {
    // TODO: Implement immediate posting API call
    console.log('Posting media now:', mediaId)
    fetchMedia() // Refresh data
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Content Scheduler</h2>
            <p className="text-gray-600 mt-1">Manage and schedule your ready content for publishing</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Content</option>
            <option value="ready">Ready to Post</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready to Post</p>
              <p className="text-2xl font-bold text-green-600">{readyMedia.length}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{scheduledMedia.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Post</p>
              <p className="text-sm font-bold text-purple-600">
                {scheduledMedia.length > 0 
                  ? format(new Date(scheduledMedia[0].scheduled_time), 'MMM d, HH:mm')
                  : 'None scheduled'
                }
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Content Library ({filteredMedia.length})
          </h3>
        </div>

        <div className="p-6">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No content found</p>
              <p className="text-sm">
                {filterStatus === 'ready' 
                  ? 'No content is ready for scheduling'
                  : filterStatus === 'scheduled'
                  ? 'No content is currently scheduled'
                  : 'Create some content to get started!'
                }
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredMedia.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  viewMode={viewMode}
                  onPreview={() => onPreviewMedia(media)}
                  onSchedule={handleScheduleMedia}
                  onPostNow={handlePostNow}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface MediaCardProps {
  media: any
  viewMode: 'grid' | 'list'
  onPreview: () => void
  onSchedule: (mediaId: string, scheduledTime: string) => void
  onPostNow: (mediaId: string) => void
}

const MediaCard: React.FC<MediaCardProps> = ({ 
  media, 
  viewMode, 
  onPreview, 
  onSchedule, 
  onPostNow 
}) => {
  const [scheduledTime, setScheduledTime] = useState('')

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
        {/* Thumbnail */}
        <div className="w-16 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Play className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{media.idea?.text}</h4>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
            <span>{formatDuration(media.duration)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(media.status)}`}>
              {media.status === 'ready' ? 'Ready' : 'Scheduled'}
            </span>
            {media.scheduled_time && (
              <span>{format(new Date(media.scheduled_time), 'MMM d, HH:mm')}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreview}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            Preview
          </button>
          {media.status === 'ready' && (
            <button
              onClick={() => onPostNow(media.id)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Post Now
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-8 w-8 text-white" />
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(media.status)}`}>
            {media.status === 'ready' ? 'Ready' : 'Scheduled'}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-white text-xs">{formatDuration(media.duration)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{media.idea?.text}</h4>
        
        {media.scheduled_time && (
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(media.scheduled_time), 'MMM d, HH:mm')}</span>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={onPreview}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-purple-700 flex items-center justify-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Preview</span>
          </button>

          {media.status === 'ready' && (
            <div className="flex space-x-2">
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={() => scheduledTime && onSchedule(media.id, scheduledTime)}
                disabled={!scheduledTime}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          )}

          {media.status === 'ready' && (
            <button
              onClick={() => onPostNow(media.id)}
              className="w-full bg-green-600 text-white py-1 px-4 rounded text-sm font-medium transition-all duration-200 hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Send className="h-3 w-3" />
              <span>Post Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}