import React from 'react'
import { Clock, Cog, FileText, Video, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Idea } from '../services/api'

interface PipelineStatusProps {
  ideas: Idea[]
}

export const PipelineStatus: React.FC<PipelineStatusProps> = ({ ideas }) => {
  const getStatusIcon = (status: Idea['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'processing':
        return <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
      case 'script_generated':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'media_ready':
        return <Video className="h-4 w-4 text-green-500" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-indigo-500" />
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Idea['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'queued':
        return `${baseClasses} bg-orange-100 text-orange-800`
      case 'processing':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'script_generated':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'media_ready':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'scheduled':
        return `${baseClasses} bg-indigo-100 text-indigo-800`
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getStatusLabel = (status: Idea['status']) => {
    switch (status) {
      case 'script_generated':
        return 'Script Ready'
      case 'media_ready':
        return 'Media Ready'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getPipelineStage = (idea: Idea) => {
    const stages = [
      { key: 'queued', label: 'Queued', icon: Clock },
      { key: 'processing', label: 'Generating Script', icon: Cog },
      { key: 'script_generated', label: 'Creating Media', icon: FileText },
      { key: 'media_ready', label: 'Ready to Schedule', icon: Video },
      { key: 'scheduled', label: 'Scheduled', icon: Calendar },
      { key: 'published', label: 'Published', icon: CheckCircle }
    ]

    const currentStageIndex = stages.findIndex(stage => stage.key === idea.status)
    
    return stages.map((stage, index) => ({
      ...stage,
      completed: index < currentStageIndex || idea.status === 'published',
      current: stage.key === idea.status,
      failed: idea.status === 'failed' && index <= currentStageIndex
    }))
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { status: 'queued', label: 'Queued', color: 'orange' },
            { status: 'processing', label: 'Processing', color: 'purple' },
            { status: 'script_generated', label: 'Script Ready', color: 'blue' },
            { status: 'media_ready', label: 'Media Ready', color: 'green' },
            { status: 'scheduled', label: 'Scheduled', color: 'indigo' },
            { status: 'published', label: 'Published', color: 'emerald' },
            { status: 'failed', label: 'Failed', color: 'red' }
          ].map(({ status, label, color }) => {
            const count = ideas.filter(idea => idea.status === status).length
            return (
              <div key={status} className="text-center">
                <div className={`text-2xl font-bold text-${color}-600`}>{count}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Ideas */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-100">
          <h3 className="text-lg font-semibold text-gray-800">Active Ideas</h3>
          <p className="text-sm text-gray-600 mt-1">Track your ideas through the content pipeline</p>
        </div>
        
        <div className="divide-y divide-gray-200/50">
          {ideas.filter(idea => idea.status !== 'published').map((idea) => (
            <div key={idea.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{idea.text}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Created {format(new Date(idea.created_at), 'MMM d, HH:mm')}</span>
                    {idea.priority > 1 && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        {idea.priority === 3 ? 'Urgent' : 'High Priority'}
                      </span>
                    )}
                    {idea.retry_count > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Retry #{idea.retry_count}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(idea.status)}
                  <span className={getStatusBadge(idea.status)}>
                    {getStatusLabel(idea.status)}
                  </span>
                </div>
              </div>

              {/* Pipeline Progress */}
              <div className="flex items-center space-x-2">
                {getPipelineStage(idea).map((stage, index) => (
                  <React.Fragment key={stage.key}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      stage.failed 
                        ? 'border-red-500 bg-red-100 text-red-600'
                        : stage.completed 
                          ? 'border-green-500 bg-green-100 text-green-600'
                          : stage.current
                            ? 'border-purple-500 bg-purple-100 text-purple-600'
                            : 'border-gray-300 bg-gray-100 text-gray-400'
                    }`}>
                      <stage.icon className="h-4 w-4" />
                    </div>
                    {index < getPipelineStage(idea).length - 1 && (
                      <div className={`flex-1 h-0.5 ${
                        stage.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {idea.error_message && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{idea.error_message}</p>
                </div>
              )}
            </div>
          ))}
          
          {ideas.filter(idea => idea.status !== 'published').length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Cog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No active ideas</p>
              <p className="text-sm">Submit an idea to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}