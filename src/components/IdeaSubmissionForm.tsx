import React, { useState } from 'react'
import { Plus, Sparkles, Loader2, Target, Hash } from 'lucide-react'

interface IdeaSubmissionFormProps {
  onSubmit: (idea: string, options?: { priority?: number; targetAudience?: string; keywords?: string[] }) => Promise<void>
  isLoading?: boolean
}

export const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ onSubmit, isLoading }) => {
  const [idea, setIdea] = useState('')
  const [priority, setPriority] = useState(1)
  const [targetAudience, setTargetAudience] = useState('')
  const [keywords, setKeywords] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return
    
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    
    await onSubmit(idea.trim(), {
      priority,
      targetAudience: targetAudience.trim() || undefined,
      keywords: keywordArray.length > 0 ? keywordArray : undefined
    })
    
    setIdea('')
    setTargetAudience('')
    setKeywords('')
    setPriority(1)
    setShowAdvanced(false)
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800">Submit New Idea</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
            What's your video idea? *
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., 'Top 5 productivity tips for remote workers' or 'Quick morning routine for busy parents'"
            rows={3}
            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="border border-purple-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value={1}>Normal</option>
              <option value={2}>High</option>
              <option value={3}>Urgent</option>
            </select>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline h-4 w-4 mr-1" />
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., 'college students', 'working parents', 'fitness enthusiasts'"
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="inline h-4 w-4 mr-1" />
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., productivity, tips, lifestyle, motivation"
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!idea.trim() || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Submit Idea</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}