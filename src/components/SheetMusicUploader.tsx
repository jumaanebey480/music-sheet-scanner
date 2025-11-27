import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ProcessingStatus {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  progress: number
  message: string
  result?: {
    title: string
    composer?: string
    key_signature: string
    time_signature: string
    tempo: number
    melody: Array<{
      note: string
      time: number
      duration: string
    }>
    confidence: number
  }
}

interface SheetMusicUploaderProps {
  onMusicProcessed: (musicData: ProcessingStatus['result']) => void
}

export function SheetMusicUploader({ onMusicProcessed }: SheetMusicUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = 'http://localhost:8000'

  const pollProcessingStatus = async (jobId: string) => {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/processing-status/${jobId}`)
        if (!response.ok) {
          throw new Error('Failed to get processing status')
        }

        const status: ProcessingStatus = await response.json()
        setProcessingStatus(status)

        if (status.status === 'completed' && status.result) {
          onMusicProcessed(status.result)
          return
        } else if (status.status === 'error') {
          setError(status.message)
          return
        } else if (status.status === 'processing' || status.status === 'queued') {
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000) // Poll every 2 seconds
          } else {
            setError('Processing timeout - please try again')
          }
        }
      } catch (err) {
        setError(`Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    poll()
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setProcessingStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/upload-sheet-music/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const { job_id } = await response.json()

      // Start polling for processing status
      await pollProcessingStatus(job_id)
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, etc.)')
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      await uploadFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    multiple: false,
    disabled: isUploading || (processingStatus?.status === 'processing')
  })

  const getProgressColor = (progress: number) => {
    if (progress < 0.3) return 'bg-blue-500'
    if (progress < 0.7) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">🎼 Upload Sheet Music</h3>
        <p className="text-gray-600 text-sm">
          Upload an image of sheet music to convert it to playable digital notation
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${(isUploading || processingStatus?.status === 'processing')
            ? 'opacity-50 cursor-not-allowed'
            : ''
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="text-4xl">
            {isUploading || processingStatus?.status === 'processing' ? '⏳' : '📸'}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? 'Drop your sheet music image here'
                : isUploading
                ? 'Uploading...'
                : processingStatus?.status === 'processing'
                ? 'Processing your sheet music...'
                : 'Drop sheet music here or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports JPG, PNG, GIF, BMP • Max 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {processingStatus && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Processing Status
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(processingStatus.progress * 100)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(processingStatus.progress)}`}
              style={{ width: `${processingStatus.progress * 100}%` }}
            />
          </div>

          <p className="text-sm text-gray-600">{processingStatus.message}</p>

          {processingStatus.status === 'completed' && processingStatus.result && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✅ Processing completed successfully!
              </p>
              <div className="text-xs text-green-600 mt-1 space-y-1">
                <p><strong>Title:</strong> {processingStatus.result.title}</p>
                <p><strong>Tempo:</strong> {processingStatus.result.tempo} BPM</p>
                <p><strong>Key:</strong> {processingStatus.result.key_signature}</p>
                <p><strong>Notes:</strong> {processingStatus.result.melody.length} notes detected</p>
                <p><strong>Confidence:</strong> {Math.round(processingStatus.result.confidence * 100)}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">❌ Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setProcessingStatus(null)
            }}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Demo Button */}
      <div className="mt-6 text-center">
        <button
          onClick={async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/demo-data/`)
              if (response.ok) {
                const demoData = await response.json()
                onMusicProcessed(demoData)
              }
            } catch (err) {
              setError('Failed to load demo data')
            }
          }}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          🎵 Try Demo Data
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📖 Tips for Best Results</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Use high-resolution, well-lit images</li>
          <li>• Ensure the sheet music is flat and fully visible</li>
          <li>• Avoid shadows, glare, or wrinkles</li>
          <li>• Simple monophonic melodies work best</li>
          <li>• Currently supports standard notation on treble clef</li>
        </ul>
      </div>
    </div>
  )
}