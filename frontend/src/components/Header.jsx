import React from 'react'
import { Sparkles } from 'lucide-react'
import { SignedIn, UserButton } from '@clerk/clerk-react'

const Header = () => {
  return (
    <header>
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <h1>AD-AI Generator</h1>
          </div>
          
          <div className="flex-1 flex justify-end">
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Transform your product images into stunning advertisements with AI-powered design and smart color recommendations
        </p>
      </div>
    </header>
  )
}

export default Header 