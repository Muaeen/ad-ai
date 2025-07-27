import React, { useState, useCallback } from 'react'
import { Upload, Image, X, CheckCircle } from 'lucide-react'
import { uploadImage } from '../services/api'

const ImageUpload = ({ formData, updateFormData, onNext }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const response = await uploadImage(file)
      
      updateFormData({
        image: file,
        fileId: response.file_id,
      })
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    updateFormData({
      image: null,
      fileId: null,
    })
    setError('')
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="text-center mb-8">
        <h2>Upload Your Product Image</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          Start by uploading a high-quality image of your product. Our AI will analyze it to create the perfect advertisement.
        </p>
      </div>

      {!formData.image ? (
        <div
          className={`upload-zone ${isDragOver ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '0', cursor: 'pointer' }}
            disabled={isUploading}
          />
          
          <div style={{ pointerEvents: 'none' }}>
            {isUploading ? (
              <Upload style={{ width: '64px', height: '64px', color: '#3b82f6', margin: '0 auto 16px', display: 'block' }} />
            ) : (
              <Image style={{ width: '64px', height: '64px', color: '#9ca3af', margin: '0 auto 16px', display: 'block' }} />
            )}
            
            <h3>
              {isUploading ? 'Uploading...' : 'Drop your image here'}
            </h3>
            <p style={{ marginBottom: '16px' }}>
              or click to browse your files
            </p>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              Supports: PNG, JPG, JPEG, WEBP • Max size: 10MB
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center">
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Uploaded product"
              style={{ maxWidth: '400px', maxHeight: '256px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <button
              onClick={removeImage}
              style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px', 
                background: '#ef4444', 
                color: 'white', 
                borderRadius: '50%', 
                padding: '8px', 
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981', marginRight: '8px' }} />
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>
              Image uploaded successfully!
            </span>
          </div>
          
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            File: {formData.image.name} ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
          </p>
          
          <button
            onClick={onNext}
            className="btn-primary"
          >
            Continue to Product Details
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: '16px', 
          padding: '16px', 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '12px', 
          color: '#dc2626', 
          textAlign: 'center' 
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default ImageUpload 