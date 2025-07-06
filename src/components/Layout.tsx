import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, FileText, Shield, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  user?: any;
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Vibe Shots
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                  <button
                    onClick={onSignOut}
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      <footer className="bg-white/50 backdrop-blur-sm border-t border-purple-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1.5 rounded-lg">
                <Video className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Vibe Shots
              </span>
              <span className="text-xs text-gray-500">© 2025</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                to="/terms"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center space-x-1"
              >
                <FileText className="h-3 w-3" />
                <span>Terms</span>
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center space-x-1"
              >
                <Shield className="h-3 w-3" />
                <span>Privacy</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};