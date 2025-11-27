import { useState, useCallback } from 'react'
import { useAuthContext } from '../components/auth/AuthProvider'
import { storage, db } from '../lib/supabase'
import { generateFilename, isValidMusicFile, isValidFileSize } from '../lib/utils'
import { FileUploadState } from '../types'

export function useUpload() {
  const { user } = useAuthContext()
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  })

  const resetUpload = useCallback(() => {
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    })
  }, [])

  const setFile = useCallback((file: File | null) => {
    if (!file) {
      resetUpload()
      return
    }

    // Validate file
    if (!isValidMusicFile(file)) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please upload a valid image file (JPG, PNG) or PDF'
      }))
      return
    }

    if (!isValidFileSize(file)) {
      setUploadState(prev => ({
        ...prev,
        error: 'File size must be less than 10MB'
      }))
      return
    }

    // Create preview for images
    let preview: string | null = null
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file)
    }

    setUploadState(prev => ({
      ...prev,
      file,
      preview,
      error: null,
    }))
  }, [])

  const uploadFile = useCallback(async () => {
    if (!uploadState.file || !user) {
      return null
    }

    try {
      setUploadState(prev => ({ ...prev, uploading: true, progress: 0, error: null }))

      // Generate unique filename
      const filename = generateFilename(uploadState.file.name)
      const filePath = `${user.id}/${filename}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await storage.uploadFile(
        'sheet-music-images',
        filePath,
        uploadState.file
      )

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      setUploadState(prev => ({ ...prev, progress: 50 }))

      // Get public URL
      const imageUrl = storage.getPublicUrl('sheet-music-images', filePath)

      // Create database record
      const { data: dbData, error: dbError } = await db.createUpload({
        user_id: user.id,
        filename: uploadState.file.name,
        image_url: imageUrl,
        processed_data: null,
        musicxml: null,
        midi_data: null,
        status: 'processing'
      })

      if (dbError) {
        throw new Error(dbError.message)
      }

      setUploadState(prev => ({ ...prev, progress: 100, uploading: false }))

      // Clean up preview URL
      if (uploadState.preview && uploadState.file.type.startsWith('image/')) {
        URL.revokeObjectURL(uploadState.preview)
      }

      return dbData
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
      return null
    }
  }, [uploadState.file, uploadState.preview, user])

  return {
    ...uploadState,
    setFile,
    uploadFile,
    resetUpload,
    canUpload: !!uploadState.file && !uploadState.uploading,
  }
}