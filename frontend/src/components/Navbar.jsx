import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Sparkles } from 'lucide-react'

const Navbar = () => {

  const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AD-AI Generator
            </span>
          </div>

          {/* Spacer for center alignment */}
          <div className="flex-1" />

          {/* Auth Section */}
          {hasClerk && (
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign In
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </SignedIn>
            </div>
          )}
        </div>


      </div>
    </nav>
  )
}

export default Navbar
