import { ref } from 'vue'
import { supabase, getImageUrl, uploadImage } from '@/library/supabase.js'

/**
 * Composable for handling Supabase image storage
 * Provides functions to upload, retrieve, and manage images from Supabase storage
 */
export function useSupabaseImages() {
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Get image URL from storage
   * @param {string} filePath - The file path in Supabase storage
   * @param {string} bucket - The storage bucket name (default: 'game-images')
   * @returns {string} Public URL of the image
   */
  const getImagePublicUrl = (filePath, bucket = 'game-images') => {
    if (!filePath) return null
    return getImageUrl(filePath, bucket)
  }

  /**
   * Get country image URL
   * @param {string} imagePath - The image path from country object
   * @returns {string} Public URL or fallback local path
   */
  const getCountryImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.png'
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // If it's a Supabase path, get the public URL
    if (imagePath.includes('/')) {
      return getImageUrl(imagePath, 'game-images') || `/images/${imagePath}`
    }
    
    // Otherwise assume it's a local path
    return `/images/${imagePath}`
  }

  /**
   * Upload an image file
   * @param {File} file - The image file to upload
   * @param {string} path - The path in the bucket (e.g., 'country-images', 'user-avatars')
   * @param {string} bucket - The storage bucket name
   * @returns {Promise<string|null>} The file path or null on error
   */
  const uploadGameImage = async (file, path = 'general', bucket = 'game-images') => {
    isLoading.value = true
    error.value = null
    
    try {
      const filePath = await uploadImage(file, bucket, path)
      if (filePath) {
        isLoading.value = false
        return filePath
      } else {
        error.value = 'Failed to upload image'
        isLoading.value = false
        return null
      }
    } catch (err) {
      error.value = err.message
      isLoading.value = false
      return null
    }
  }

  /**
   * Get a country's image from the countries table
   * @param {string|number} countryId - The country ID
   * @returns {Promise<string|null>} The image URL or null
   */
  const getCountryImage = async (countryId) => {
    try {
      const { data, error: err } = await supabase
        .from('countries')
        .select('image_path')
        .eq('id', countryId)
        .single()
      
      if (err) {
        console.error('Error fetching country image:', err)
        return null
      }
      
      return data?.image_path ? getCountryImageUrl(data.image_path) : null
    } catch (err) {
      console.error('Error in getCountryImage:', err)
      return null
    }
  }

  return {
    isLoading,
    error,
    getImagePublicUrl,
    getCountryImageUrl,
    uploadGameImage,
    getCountryImage
  }
}
