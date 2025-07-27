import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Upload image to backend
export const uploadImage = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error(error.response?.data?.detail || 'Failed to upload image')
  }
}

// Get AI color recommendations
export const getColorRecommendations = async (productName, fileId) => {
  try {
    const formData = new FormData()
    formData.append('product_name', productName)
    formData.append('file_id', fileId)
    
    const response = await api.post('/recommend-colors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  } catch (error) {
    console.error('Color recommendation error:', error)
    throw new Error(error.response?.data?.detail || 'Failed to get color recommendations')
  }
}

// Generate advertisement
export const generateAd = async (adData, signal) => {
  try {
    const formData = new FormData()
    formData.append('product_name', adData.productName)
    formData.append('brand_name', adData.brandName)
    formData.append('file_id', adData.fileId)
    formData.append('use_smart_colors', adData.useSmartColors)
    
    if (!adData.useSmartColors) {
      formData.append('number_of_colors', adData.numberOfColors)
      if (adData.colors && adData.colors.length > 0) {
        formData.append('colors', adData.colors.join(','))
      }
    }
    
    const response = await api.post('/generate-ad', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: signal, // Add signal for cancellation
      timeout: 120000 // 2 minute timeout
    })
    
    return response.data
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error // Re-throw abort errors
    }
    console.error('Ad generation error:', error)
    throw new Error(error.response?.data?.detail || 'Failed to generate advertisement')
  }
}

// Download generated ad
export const downloadAd = (filename) => {
  return `${API_BASE_URL}/download/${filename}`
}

// Cleanup temporary files
export const cleanupFiles = async (fileId) => {
  try {
    const response = await api.delete(`/cleanup/${fileId}`)
    return response.data
  } catch (error) {
    console.error('Cleanup error:', error)
    // Don't throw error for cleanup failures
  }
}

// Cancel ongoing ad generation
export const cancelGeneration = async (fileId) => {
  try {
    const response = await api.post(`/cancel-generation/${fileId}`)
    return response.data
  } catch (error) {
    console.error('Cancel generation error:', error)
    // Don't throw error for cancellation failures
  }
}

export default api 