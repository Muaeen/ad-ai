import React, { useState, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Package, Building2 } from 'lucide-react'

const ProductDetails = ({ formData, updateFormData, onNext, onPrev }) => {
  const [errors, setErrors] = useState({})

  const handleInputChange = useCallback((field, value) => {
    updateFormData({ [field]: value })
    
    // Clear error when user starts typing  
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: '' }
      }
      return prev
    })
  }, [updateFormData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required'
    } else if (formData.productName.trim().length < 2) {
      newErrors.productName = 'Product name must be at least 2 characters'
    }

    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required'
    } else if (formData.brandName.trim().length < 2) {
      newErrors.brandName = 'Brand name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="text-center mb-8">
        <h2>Product Information</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          Tell us about your product so we can create the perfect advertisement copy.
        </p>
      </div>

      <div className="grid grid-cols-2">
        {/* Product Image Preview */}
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Product preview"
              style={{ 
                width: '100%',
                maxWidth: '500px',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '12px',
                backgroundColor: '#f9fafb',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Product Name */}
            <div>
              <label className="flex items-center" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                <Package style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="e.g., iPhone 15 Pro, Nike Air Max, Tesla Model S"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.productName ? '2px solid #fca5a5' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: errors.productName ? '#fef2f2' : 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.productName ? '#fca5a5' : '#e5e7eb'}
              />
              {errors.productName && (
                <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
                  {errors.productName}
                </p>
              )}
            </div>

            {/* Brand Name */}
            <div>
              <label className="flex items-center" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                <Building2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                placeholder="e.g., Apple, Nike, Tesla, Your Company"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.brandName ? '2px solid #fca5a5' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: errors.brandName ? '#fef2f2' : 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.brandName ? '#fca5a5' : '#e5e7eb'}
              />
              {errors.brandName && (
                <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
                  {errors.brandName}
                </p>
              )}
            </div>

            {/* Tips */}
            <div style={{ 
              background: '#dbeafe', 
              border: '1px solid #93c5fd', 
              borderRadius: '12px', 
              padding: '16px' 
            }}>
              <h4 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>💡 Pro Tips</h4>
              <ul style={{ fontSize: '14px', color: '#1e40af', listStyle: 'none', padding: '0' }}>
                <li style={{ marginBottom: '4px' }}>• Use specific product names for better results</li>
                <li style={{ marginBottom: '4px' }}>• Include model numbers or versions if applicable</li>
                <li>• Brand name will appear prominently in your ad</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onPrev}
          className="btn-secondary flex items-center"
        >
          <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Back to Upload
        </button>

        <button
          onClick={handleNext}
          className="btn-primary flex items-center"
        >
          Continue to Colors
          <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
        </button>
      </div>
    </div>
  )
}

export default ProductDetails 