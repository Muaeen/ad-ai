import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Palette, Plus, X } from 'lucide-react'

const ColorSelection = ({ formData, updateFormData, onNext, onPrev }) => {
  const [customColor, setCustomColor] = useState('#000000')

  const toggleColorMode = (useSmartColors) => {
    updateFormData({ 
      useSmartColors,
      colors: useSmartColors ? [] : formData.colors 
    })
  }

  const addCustomColor = () => {
    if (formData.colors.length < 3 && !formData.colors.includes(customColor)) {
      updateFormData({
        colors: [...formData.colors, customColor]
      })
    }
  }

  const removeColor = (colorToRemove) => {
    updateFormData({
      colors: formData.colors.filter(color => color !== colorToRemove)
    })
  }

  const handleNext = () => {
    if (formData.useSmartColors || formData.colors.length > 0) {
      onNext()
    }
  }

  const isNextDisabled = !formData.useSmartColors && formData.colors.length === 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Colors</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select colors for your advertisement. Use AI recommendations or choose your own palette.
        </p>
      </div>

      {/* Product Info Section */}
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
          </div>
        </motion.div>
      </div>

      {/* Color Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
          {/* Mode Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
            borderRadius: '16px', 
            padding: '6px',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => toggleColorMode(true)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 24px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                background: formData.useSmartColors 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
                  : 'transparent',
                color: formData.useSmartColors ? 'white' : '#6b7280',
                boxShadow: formData.useSmartColors 
                  ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 3px 10px rgba(0, 0, 0, 0.2)' 
                  : 'none',
                transform: formData.useSmartColors ? 'translateY(-1px)' : 'none'
              }}
            >
              AI Recommendations
            </button>
            <button
              onClick={() => toggleColorMode(false)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 24px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                background: !formData.useSmartColors 
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' 
                  : 'transparent',
                color: !formData.useSmartColors ? 'white' : '#6b7280',
                boxShadow: !formData.useSmartColors 
                  ? '0 8px 25px rgba(139, 92, 246, 0.3), 0 3px 10px rgba(0, 0, 0, 0.2)' 
                  : 'none',
                transform: !formData.useSmartColors ? 'translateY(-1px)' : 'none'
              }}
            >
              <Palette style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Manual Selection
            </button>
          </div>

          {/* AI Recommendations */}
          {formData.useSmartColors && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">AI Color Analysis</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Smart Color Selection Enabled</h4>
                  <p className="text-blue-700 mb-4">
                    Our AI will analyze your product image during ad generation to select the most effective colors for your advertisement.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-blue-600">
                      ✨ <strong>Benefits:</strong> Optimal color harmony, enhanced visual appeal, and improved brand impact
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manual Color Selection */}
          {!formData.useSmartColors && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card"
            >
              <div className="flex items-center mb-4">
                <Palette className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">Custom Color Palette</h3>
              </div>

              {/* Color Picker */}
              <div className="flex items-center gap-0 mb-6">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-16 rounded-xl border-2 border-gray-200 cursor-pointer"
                  style={{ margin: '0 1rem 0 0' }}
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ margin: '0 1rem 0 0' }}
                  />
                </div>
                <motion.button
                  onClick={addCustomColor}
                  disabled={formData.colors.length >= 3 || formData.colors.includes(customColor)}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Color
                </motion.button>
              </div>

              {/* Selected Colors */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">
                  Selected Colors ({formData.colors.length}/3)
                </h4>
                {formData.colors.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {formData.colors.map((color, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative text-center group"
                      >
                        <div
                          className="w-16 h-16 rounded-xl shadow-lg border-2 border-gray-200 mx-auto mb-2 relative"
                          style={{ backgroundColor: color }}
                        >
                          <motion.button
                            onClick={() => removeColor(color)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-3 h-3" />
                          </motion.button>
                        </div>
                        <span className="text-sm font-mono text-gray-600">{color}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <Palette className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No colors selected yet</p>
                  </div>
                )}
              </div>

              {/* Color Limit Info */}
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h4 className="font-semibold text-purple-800 mb-2">🎨 Color Guidelines</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Choose 1-3 colors for best results</li>
                  <li>• Consider contrast for text readability</li>
                  <li>• Colors should complement your product</li>
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <motion.button
          onClick={onPrev}
          className="btn-secondary flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Details
        </motion.button>

        {!isNextDisabled && (
          <motion.button
            onClick={handleNext}
            className="btn-primary flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Generate Advertisement
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default ColorSelection 