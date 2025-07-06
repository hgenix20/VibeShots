import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Video, Lightbulb, BarChart3, Cog, LogOut, Calendar } from 'lucide-react'
import { AuthForm } from './components/AuthForm'
import { IdeaSubmissionForm } from './components/IdeaSubmissionForm'
import { PipelineStatus } from './components/PipelineStatus'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { SchedulerPage } from './components/SchedulerPage'
import { MediaPreview } from './components/MediaPreview'
import { Layout } from './components/Layout'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { apiService, Idea } from './services/api'

type Tab = 'submit' | 'pipeline' | 'scheduler' | 'analytics'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('submit')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await apiService.getUser()
      setUser(user)
      if (user) {
        fetchIdeas()
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchIdeas = async () => {
    try {
      const response = await apiService.getIdeas()
      if (response.success && response.data) {
        setIdeas(response.data)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    }
  }

  const handleSubmitIdea = async (
    text: string, 
    options?: { priority?: number; targetAudience?: string; keywords?: string[] }
  ) => {
    setSubmitting(true)
    try {
      const response = await apiService.addIdea(text, options)
      if (response.success) {
        await fetchIdeas()
        setActiveTab('pipeline')
      }
    } catch (error) {
      console.error('Error submitting idea:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await apiService.signOut()
    setUser(null)
    setIdeas([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <AuthForm onSuccess={checkUser} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/" element={
          <Layout user={user} onSignOut={handleSignOut}>
            <MainApp 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              submitting={submitting}
              handleSubmitIdea={handleSubmitIdea}
              ideas={ideas}
            />
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

interface MainAppProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  submitting: boolean
  handleSubmitIdea: (text: string, options?: { priority?: number; targetAudience?: string; keywords?: string[] }) => Promise<void>
  ideas: Idea[]
}

const MainApp: React.FC<MainAppProps> = ({ 
  activeTab, 
  setActiveTab, 
  submitting, 
  handleSubmitIdea, 
  ideas 
}) => {
  const tabs = [
    { id: 'submit' as Tab, label: 'Submit Idea', icon: Lightbulb },
    { id: 'pipeline' as Tab, label: 'Pipeline', icon: Cog },
    { id: 'scheduler' as Tab, label: 'Scheduler', icon: Calendar },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 }
  ]

  return (
    <>
      {/* Tab Navigation */}
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100 rounded-xl p-2 shadow-lg mb-6">
        <div className="flex space-x-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'submit' && (
          <IdeaSubmissionForm onSubmit={handleSubmitIdea} isLoading={submitting} />
        )}
        
        {activeTab === 'pipeline' && (
          <PipelineStatus ideas={ideas} onPreviewMedia={setSelectedMedia} />
        )}
        
        {activeTab === 'scheduler' && (
          <SchedulerPage onPreviewMedia={setSelectedMedia} />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsDashboard user={user} />
        )}
        
        {selectedMedia && (
          <MediaPreview 
            media={selectedMedia} 
            onClose={() => setSelectedMedia(null)}
            onSchedule={() => {
              setSelectedMedia(null)
              setActiveTab('scheduler')
            }}
          />
        )}
      </div>
    </>
  )
}

export default App