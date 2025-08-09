import React, { useState, useEffect, useCallback } from 'react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Layout from './components/Layout'
import HomePage from './components/HomePage'
import ImageUpload from './components/ImageUpload'
import ProductDetails from './components/ProductDetails'
import ColorSelection from './components/ColorSelection'
import AdGeneration from './components/AdGeneration'
import ProgressBar from './components/ProgressBar'
import { Image, Palette, Sparkles, Zap } from 'lucide-react'
import { cancelGeneration } from './services/api'

const steps = [
  { id: 1, name: 'Upload', icon: Image, description: 'Upload your product image' },
  { id: 2, name: 'Details', icon: Sparkles, description: 'Enter product information' },
  { id: 3, name: 'Colors', icon: Palette, description: 'Choose your colors' },
  { id: 4, name: 'Generate', icon: Zap, description: 'Create your ad' },
]

function App() {
  const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
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
    <Layout>
      {/* If Clerk not configured, treat as signed out to render public home */}
      {!hasClerk ? (
        <HomePage />
      ) : (
        <>
          <SignedOut>
            <HomePage />
          </SignedOut>

          <SignedIn>
            <div className="container mx-auto px-4 py-8">

              {/* App Header for Signed In Users */}
              <div className="text-center mb-8 pt-8">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Your Advertisement
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Follow the steps below to transform your product image into a professional advertisement
                </p>
              </div>

              {/* Progress Section */}
              <ProgressBar steps={steps} currentStep={currentStep} />

              {/* Step Content */}
              <div className="mt-8">
                {renderStep()}
              </div>
            </div>
          </SignedIn>
        </>
      )}
    </Layout>
  )
}

export default App
