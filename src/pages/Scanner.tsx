import { SheetMusicUploader } from '../components/SheetMusicUploader'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface MusicData {
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

export function Scanner() {
  const navigate = useNavigate()
  const [uploadedMusic, setUploadedMusic] = useState<MusicData | null>(null)

  const handleMusicProcessed = (musicData: MusicData) => {
    setUploadedMusic(musicData)
    // Store in session storage to access from player
    sessionStorage.setItem('uploadedMusic', JSON.stringify(musicData))
    // Navigate to player with the processed music
    setTimeout(() => {
      navigate('/player')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎼 Sheet Music Scanner
          </h1>
          <p className="text-lg text-gray-600">
            Upload photos of sheet music and convert them to playable digital notation
          </p>
        </div>

        <SheetMusicUploader onMusicProcessed={handleMusicProcessed} />

        {uploadedMusic && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">
                  ✅ Processing Complete!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  "{uploadedMusic.title}" - Redirecting to player...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
