import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Download, RefreshCw, Zap, CheckCircle, Loader, RotateCcw } from 'lucide-react'
import { generateAd, downloadAd, cleanupFiles, cancelGeneration } from '../services/api'
import { motion } from 'framer-motion'

const AdGeneration = ({ formData, updateFormData, onPrev, onReset, isGenerating, setIsGenerating, abortController, setAbortController }) => {
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const hasGeneratedRef = useRef(false)
  const requestInProgressRef = useRef(false)
  
  // Cleanup on component unmount during generation
  useEffect(() => {
    return () => {
      if (isGenerating && formData.fileId) {
        cancelGeneration(formData.fileId)
      }
    }
  }, [isGenerating, formData.fileId])

  // Convert color names to hex codes
  const colorNameToHex = (colorName) => {
    const colorMap = {
      'crimson red': '#DC143C',
      'aqua teal': '#20B2AA',
      'lemon yellow': '#FFFF99',
      'coral pink': '#F88379',
      'turquoise': '#40E0D0',
      'lime green': '#32CD32',
      'royal blue': '#4169E1',
      'orange': '#FFA500',
      'purple': '#800080',
      'magenta': '#FF00FF',
      'cyan': '#00FFFF',
      'gold': '#FFD700',
      'silver': '#C0C0C0',
      'navy': '#000080',
      'maroon': '#800000',
      'olive': '#808000',
      'red': '#FF0000',
      'green': '#008000',
      'blue': '#0000FF',
      'yellow': '#FFFF00',
      'black': '#000000',
      'white': '#FFFFFF',
      'gray': '#808080',
      'grey': '#808080',
      'coral': '#FF7F50'
    }
    
    const normalizedName = colorName.toLowerCase().trim()
    return colorMap[normalizedName] || colorName
  }

  // Parse colors to handle concatenated strings
  const parseColors = (colors) => {
    if (!colors || colors.length === 0) return []
    
    // If it's a single string that looks concatenated, try to split it
    if (colors.length === 1 && typeof colors[0] === 'string') {
      const colorString = colors[0].toLowerCase()
      
      // Define common color patterns to split on
      const colorPatterns = [
        'turquoise', 'lemon yellow', 'coral', 'crimson red', 'aqua teal',
        'lime green', 'royal blue', 'orange', 'purple', 'magenta',
        'cyan', 'gold', 'silver', 'navy', 'maroon', 'olive',
        'red', 'green', 'blue', 'yellow', 'black', 'white', 'gray', 'grey'
      ]
      
      let parsedColors = []
      let remainingString = colorString
      
      for (const pattern of colorPatterns) {
        if (remainingString.includes(pattern)) {
          const index = remainingString.indexOf(pattern)
          if (index !== -1) {
            parsedColors.push(pattern)
            remainingString = remainingString.replace(pattern, '').trim()
          }
        }
      }
      
      return parsedColors.length > 0 ? parsedColors : colors
    }
    
    return colors
  }
  
  // Remove the automatic generation useEffect - only generate when user explicitly requests it
  // useEffect(() => {
  //   if (!formData.generatedAd && !hasGeneratedRef.current && !isGenerating) {
  //     hasGeneratedRef.current = true
  //     handleGenerate()
  //   }
  // }, [])

  const handleGenerate = useCallback(async () => {
    // Prevent multiple simultaneous generations
    if (isGenerating || requestInProgressRef.current) {
      console.log('Generation already in progress, skipping...')
      return
    }
    
    // Set request in progress flag
    requestInProgressRef.current = true
    
    // Create new AbortController for this request
    const controller = new AbortController()
    setAbortController(controller)
    
    setIsGenerating(true)
    setError('')
    setProgress(0)
    hasGeneratedRef.current = true

    // Simulate progress
    const progressSteps = [
      { progress: 15, delay: 500, message: "Initializing AI..." },
      { progress: 25, delay: 800, message: "Analyzing product..." },
      { progress: 45, delay: 1200, message: "Selecting colors..." },
      { progress: 65, delay: 2000, message: "Generating ad..." },
      { progress: 85, delay: 1500, message: "Enhancing quality..." },
      { progress: 95, delay: 1000, message: "Final processing..." }
    ]
    
    let stepIndex = 0
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        const currentStep = progressSteps[stepIndex]
        setProgress(currentStep.progress)
        stepIndex++
        
        // Clear interval if this was the last step
        if (stepIndex >= progressSteps.length) {
          clearInterval(progressInterval)
        }
      }
    }, 800) // Update every 800ms

    try {
      const adData = {
        productName: formData.productName,
        brandName: formData.brandName,
        fileId: formData.fileId,
        useSmartColors: formData.useSmartColors,
        numberOfColors: formData.colors.length || 3,
        colors: formData.colors,
      }

      const response = await generateAd(adData, controller.signal)
      
      // Extract colors from the response if they were generated by AI
      const generatedColors = response.colors_used || []
      
      updateFormData({
        generatedAd: response,
        // Store the generated colors so they can be displayed
        recommendedColors: formData.useSmartColors ? generatedColors : formData.recommendedColors
      })
      
      setProgress(100)
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Ad generation was cancelled')
        return
      }
      setError(err.message)
      hasGeneratedRef.current = false // Reset on error to allow retry
      clearInterval(progressInterval)
    } finally {
      setIsGenerating(false)
      setAbortController(null)
      requestInProgressRef.current = false // Reset request flag
      clearInterval(progressInterval)
    }
  }, [isGenerating, formData, setIsGenerating, setAbortController, updateFormData])

  const handleManualGenerate = useCallback(() => {
    // Reset the ref to allow manual regeneration
    hasGeneratedRef.current = false
    requestInProgressRef.current = false
    handleGenerate()
  }, [handleGenerate])

  const handleDownload = () => {
    if (formData.generatedAd?.output_file) {
      const filename = formData.generatedAd.output_file.split('/').pop()
      const downloadUrl = downloadAd(filename)
      
      // Create download link
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleReset = async () => {
    // Cleanup files if possible
    if (formData.fileId) {
      try {
        await cleanupFiles(formData.fileId)
      } catch (err) {
        console.error('Cleanup failed:', err)
      }
    }
    onReset()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate Your Advertisement</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch as our AI creates a stunning advertisement for your product using the selected colors and information.
        </p>
      </div>

      {/* Product Information Section */}
      <div className="flex gap-6 items-start mb-8">
        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
          style={{ width: '350px', padding: '1.5rem' }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Preview</h3>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Product"
              style={{ 
                width: '100%',
                maxWidth: '300px',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '12px',
                backgroundColor: '#f9fafb',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="card flex-1"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Product Information</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Product Name</label>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formData.productName}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Brand Name</label>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formData.brandName}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Color Mode</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formData.useSmartColors ? '🤖 AI Recommendations' : '🎨 Manual Selection'}
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Selected Colors</label>
              <div className="mt-3">
                {formData.useSmartColors ? (
                  formData.recommendedColors && formData.recommendedColors.length > 0 ? (
                    (() => {
                      const parsedColors = parseColors(formData.recommendedColors)
                      return (
                        <div className="space-y-4">
                          {/* Numbered List Format */}
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <ol className="space-y-2">
                              {parsedColors.map((colorName, index) => (
                                <li key={index} className="flex items-center text-gray-800">
                                  <span className="font-bold text-green-600 mr-3 min-w-[20px]">
                                    {index + 1}.
                                  </span>
                                  <div className="flex items-center">
                                    <div
                                      className="w-6 h-6 rounded-full shadow-md border-2 border-gray-200 mr-3"
                                      style={{ backgroundColor: colorNameToHex(colorName) }}
                                      title={colorNameToHex(colorName)}
                                    />
                                    <span className="capitalize font-medium">{colorName}</span>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                        <span className="text-gray-600">AI is analyzing your product image to select optimal colors...</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Colors will be automatically selected when your ad is generated</p>
                    </div>
                  )
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {formData.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-lg shadow-md border-2 border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {formData.colors.length === 0 && (
                      <p className="text-gray-500">No colors selected</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
        {/* Generated Ad Display */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Generated Advertisement</h3>

          {isGenerating ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
              <div className="text-center">
                {/* Progress Circle */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={error ? "#ef4444" : "url(#progressGradient)"}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (error ? 100 : progress) / 100)}`}
                      className="transition-all duration-300 ease-out"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${error ? 'text-red-600' : 'text-gray-700'}`}>
                      {error ? '✗' : `${Math.round(progress)}%`}
                    </span>
                  </div>
                </div>

                {/* Progress Status */}
                <div className="mb-6">
                  <h4 className={`text-xl font-semibold mb-2 ${error ? 'text-red-600' : 'text-gray-800'}`}>
                    {error ? '❌ Generation Failed' :
                     progress < 20 ? '🚀 Initializing AI...' :
                     progress < 40 ? '🎨 Analyzing your product...' :
                     progress < 60 ? '🌈 Selecting optimal colors...' :
                     progress < 80 ? '✨ Generating advertisement...' :
                     progress < 95 ? '🎯 Finalizing details...' :
                     '✅ Almost ready!'}
                  </h4>
                  <p className={error ? 'text-red-500' : 'text-gray-600'}>
                    {error ? error : 'This may take a few moments...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ease-out rounded-full ${
                      error ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}
                    style={{ width: `${error ? 100 : progress}%` }}
                  />
                </div>

                {/* Loading Animation or Error Actions */}
                {error ? (
                  <div className="flex gap-4 justify-center mb-4">
                    <button
                      onClick={handleManualGenerate}
                      className="btn-secondary"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center space-x-2 mb-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: '1s'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Progress Steps */}
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center justify-center ${
                    error ? 'text-red-500' : progress >= 20 ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {error ? '✗' : progress >= 20 ? '✓' : '○'} Image analysis
                  </div>
                  <div className={`flex items-center justify-center ${
                    error ? 'text-red-500' : progress >= 40 ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {error ? '✗' : progress >= 40 ? '✓' : '○'} Color optimization
                  </div>
                  <div className={`flex items-center justify-center ${
                    error ? 'text-red-500' : progress >= 60 ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {error ? '✗' : progress >= 60 ? '✓' : '○'} AI generation
                  </div>
                  <div className={`flex items-center justify-center ${
                    error ? 'text-red-500' : progress >= 80 ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {error ? '✗' : progress >= 80 ? '✓' : '○'} Quality enhancement
                  </div>
                  <div className={`flex items-center justify-center ${
                    error ? 'text-red-500' : progress >= 95 ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {error ? '✗' : progress >= 95 ? '✓' : '○'} Final processing
                  </div>
                </div>
              </div>
            </div>
          ) : formData.generatedAd ? (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-green-800">Advertisement Generated!</h4>
                  <p className="text-green-700 text-sm">Your ad is ready for download.</p>
                </div>
              </div>

              {/* Ad Preview */}
              <div style={{ position: 'relative' }}>
                <img
                  src={downloadAd(formData.generatedAd.output_file.split('/').pop())}
                  alt="Generated Advertisement"
                  style={{ 
                    width: '100%',
                    maxWidth: '400px',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    margin: '0 auto',
                    display: 'block'
                  }}
                  onLoad={() => console.log('Image loaded successfully')}
                  onError={(e) => {
                    console.error('Image failed to load:', e)
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <div style={{ 
                  display: 'none',
                  background: '#f3f4f6', 
                  aspectRatio: '1', 
                  borderRadius: '12px', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#6b7280' }}>Preview loading...</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4" style={{ marginTop: '2rem', gap: '1.5rem' }}>
                <button
                  onClick={handleDownload}
                  className="btn-primary flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Advertisement
                </button>
                <button
                  onClick={handleManualGenerate}
                  className="btn-secondary"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Ready to generate your advertisement</p>
                <button
                  onClick={handleGenerate}
                  className="btn-primary flex items-center"
                  disabled={isGenerating}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Advertisement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <div></div> {/* Empty div to maintain spacing */}

        {formData.generatedAd && (
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </button>
        )}
      </div>
    </div>
  )
}

export default AdGeneration 