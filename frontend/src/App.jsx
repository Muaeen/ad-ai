import React, { useState, useEffect, useCallback } from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import Header from './components/Header'
import ImageUpload from './components/ImageUpload'
import ProductDetails from './components/ProductDetails'
import ColorSelection from './components/ColorSelection'
import AdGeneration from './components/AdGeneration'
import ProgressBar from './components/ProgressBar'
import { Sparkles, Image, Palette, Zap } from 'lucide-react'
import { cancelGeneration } from './services/api'

const steps = [
  { id: 1, name: 'Upload', icon: Image, description: 'Upload your product image' },
  { id: 2, name: 'Details', icon: Sparkles, description: 'Enter product information' },
  { id: 3, name: 'Colors', icon: Palette, description: 'Choose your colors' },
  { id: 4, name: 'Generate', icon: Zap, description: 'Create your ad' },
]

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [abortController, setAbortController] = useState(null)
  const [formData, setFormData] = useState({
    image: null,
    fileId: null,
    productName: '',
    brandName: '',
    useSmartColors: true,
    colors: [],
    recommendedColors: [],
    numberOfColors: 3,
    generatedAd: null,
  })

  // Handle page refresh/navigation during generation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isGenerating && abortController) {
        // Cancel the API request
        abortController.abort()
        
        // Tell backend to stop processing (fire and forget)
        if (formData.fileId) {
          cancelGeneration(formData.fileId) // Don't await in beforeunload
        }
        
        // Reset to upload page
        setCurrentStep(1)
        setFormData({
          image: null,
          fileId: null,
          productName: '',
          brandName: '',
          useSmartColors: true,
          colors: [],
          recommendedColors: [],
          numberOfColors: 3,
          generatedAd: null,
        })
        
        // Optional: Show warning message
        e.preventDefault()
        e.returnValue = 'Ad generation in progress. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isGenerating, abortController])

  const buttonStyle = {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: '0.125em solid #1A1A1A',
    borderRadius: '0.9375em',
    boxSizing: 'border-box',
    color: '#3B3B3B',
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: 'Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: 'normal',
    margin: '0 0.5rem',
    minHeight: '3em',
    minWidth: '0',
    outline: 'none',
    padding: '0.75em 1.8em',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 300ms cubic-bezier(.23, 1, 0.32, 1)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    willChange: 'transform'
  }

  const updateFormData = useCallback((data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }, [])

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ImageUpload
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <ProductDetails
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <ColorSelection
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <AdGeneration
            formData={formData}
            updateFormData={updateFormData}
            onPrev={prevStep}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            abortController={abortController}
            setAbortController={setAbortController}
            onReset={() => {
              setCurrentStep(1)
              setIsGenerating(false)
              setAbortController(null)
              setFormData({
                image: null,
                fileId: null,
                productName: '',
                brandName: '',
                useSmartColors: true,
                colors: [],
                numberOfColors: 3,
                generatedAd: null,
              })
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <main>
        <div className="container">
          <SignedOut>
            <div className="text-center py-20">
              <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Welcome to AD-AI Generator</h2>
                </div>
                <p className="text-white/80 mb-8">
                  Please sign in to start creating stunning advertisements with AI-powered design
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-12">
                  <SignInButton style={buttonStyle} className="group hover:text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:shadow-none active:translate-y-0">
                    Sign In
                  </SignInButton>
                  <SignUpButton style={buttonStyle} className="group hover:text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:shadow-none active:translate-y-0">
                    Sign Up
                  </SignUpButton>
                </div>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            {/* Progress Section */}
            <ProgressBar steps={steps} currentStep={currentStep} />

            {/* Step Content */}
            <div>
              {renderStep()}
            </div>
          </SignedIn>
        </div>
      </main>
    </div>
  )
}

export default App
