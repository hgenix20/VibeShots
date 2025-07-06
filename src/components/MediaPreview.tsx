import React, { useState } from 'react'
import { X, Play, Pause, Calendar, Send, Download, Eye, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface MediaPreviewProps {
  media: any
  onClose: () => void
  onSchedule: () => void
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ media, onClose, onSchedule }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')

  const handleSchedule = () => {
    // TODO: Implement scheduling logic
    console.log('Scheduling media:', media.id, 'for:', scheduledTime)
    onSchedule()
  }

  const handlePostNow = () => {
    // TODO: Implement immediate posting logic
    console.log('Posting media now:', media.id)
    onSchedule()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Media Preview</h2>
            <p className="text-sm text-gray-600 mt-1">Review your content before publishing</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Video Preview */}
          <div className="lg:w-1/2 p-6 bg-gray-50">
            <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative max-w-sm mx-auto">
              {/* Mock video player */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg font-medium">Generated Video</p>
                  <p className="text-sm opacity-80">{formatDuration(media.duration || 60)}</p>
                </div>
              </div>
              
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <Play className="h-8 w-8 text-white ml-1" />
                  )}
                </div>
              </button>

              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center space-x-2 text-white text-xs">
                    <Clock className="h-3 w-3" />
                    <span>0:00 / {formatDuration(media.duration || 60)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                    <div className="bg-white rounded-full h-1 w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{media.format || 'MP4'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{formatDuration(media.duration || 60)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{((media.file_size || 5000000) / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>
          </div>

          {/* Content Details & Actions */}
          <div className="lg:w-1/2 p-6">
            <div className="space-y-6">
              {/* Script Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Script Content</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Hook</label>
                      <p className="text-sm text-gray-800 mt-1">
                        {media.script?.hook || "Wait, this will change everything you know about..."}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Main Content</label>
                      <p className="text-sm text-gray-800 mt-1 line-clamp-4">
                        {media.script?.content || media.idea?.text || "Your engaging video content will appear here..."}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Call to Action</label>
                      <p className="text-sm text-gray-800 mt-1">
                        {media.script?.call_to_action || "Follow for more tips like this!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduling Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Publishing Options</h3>
                <div className="space-y-4">
                  {/* Schedule for Later */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-gray-800">Schedule for Later</span>
                    </div>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSchedule}
                      disabled={!scheduledTime}
                      className="w-full mt-3 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Schedule Post</span>
                    </button>
                  </div>

                  {/* Post Now */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Send className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-800">Post Immediately</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Publish this video to TikTok right now
                    </p>
                    <button
                      onClick={handlePostNow}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-green-700 flex items-center justify-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Post Now</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200 flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200 flex items-center justify-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Full Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}