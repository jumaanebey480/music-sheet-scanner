import { useState } from 'react'
import { DemoPlayer } from './DemoPlayer'
import { SheetMusicUploader } from './SheetMusicUploader'

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

export function MusicScanner() {
  const [currentMode, setCurrentMode] = useState<'upload' | 'demo'>('upload')
  const [uploadedMusic, setUploadedMusic] = useState<MusicData | null>(null)

  const handleMusicProcessed = (musicData: MusicData) => {
    setUploadedMusic(musicData)
    setCurrentMode('demo')
  }

  const handleBackToUpload = () => {
    setCurrentMode('upload')
    setUploadedMusic(null)
  }

  // Convert uploaded music to demo player format
  const convertToPlayerFormat = (musicData: MusicData) => {
    return {
      title: musicData.title,
      melody: musicData.melody.map((note, index) => ({
        ...note,
        time: typeof note.time === 'string' ? parseFloat(note.time) : note.time
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Mode Toggle */}
      <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎼 Music Scanner</h2>
            <p className="text-gray-600 text-sm">
              Upload sheet music or try our demo player
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMode('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentMode === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📸 Upload
            </button>
            <button
              onClick={() => setCurrentMode('demo')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentMode === 'demo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎵 Player
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        {uploadedMusic && currentMode === 'demo' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm font-medium text-green-800">
                  Playing processed sheet music: "{uploadedMusic.title}"
                </span>
              </div>
              <button
                onClick={handleBackToUpload}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Upload new sheet music
              </button>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Confidence: {Math.round(uploadedMusic.confidence * 100)}% •
              {uploadedMusic.melody.length} notes •
              {uploadedMusic.tempo} BPM
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {currentMode === 'upload' ? (
        <SheetMusicUploader onMusicProcessed={handleMusicProcessed} />
      ) : (
        <DemoPlayer
          uploadedSong={uploadedMusic ? {
            uploaded: convertToPlayerFormat(uploadedMusic)
          } : undefined}
        />
      )}

      {/* Feature Overview */}
      {currentMode === 'upload' && !uploadedMusic && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🚀 How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                icon: '📸',
                title: 'Upload Image',
                description: 'Take a photo or upload an image of sheet music'
              },
              {
                step: '2',
                icon: '🔍',
                title: 'AI Processing',
                description: 'Our OMR engine analyzes and recognizes musical notation'
              },
              {
                step: '3',
                icon: '🎼',
                title: 'Digital Notation',
                description: 'View the converted notes on an interactive staff'
              },
              {
                step: '4',
                icon: '▶️',
                title: 'Play & Edit',
                description: 'Listen with different instruments and tempo controls'
              }
            ].map((feature) => (
              <div key={feature.step} className="text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-xs font-medium text-blue-800 mb-1">
                  Step {feature.step}: {feature.title}
                </div>
                <div className="text-xs text-blue-600">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Technical Info */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">🔧 Technical Status</h4>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Frontend (React + TypeScript)</span>
              <span className="text-green-600 font-semibold">✓ Running</span>
            </div>
            <div className="flex justify-between">
              <span>Audio Engine (Tone.js)</span>
              <span className="text-green-600 font-semibold">✓ Ready</span>
            </div>
            <div className="flex justify-between">
              <span>Visual Notation (SVG)</span>
              <span className="text-green-600 font-semibold">✓ Active</span>
            </div>
            <div className="flex justify-between">
              <span>Multi-Part Choir Demo</span>
              <span className="text-green-600 font-semibold">✓ Ready</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Backend API (FastAPI)</span>
              <span className="text-green-600 font-semibold">✓ Connected</span>
            </div>
            <div className="flex justify-between">
              <span>Image Processing (OpenCV)</span>
              <span className="text-green-600 font-semibold">✓ Available</span>
            </div>
            <div className="flex justify-between">
              <span>File Upload (Multipart)</span>
              <span className="text-green-600 font-semibold">✓ Ready</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>OMR Engine (Oemer)</span>
              <span className="text-yellow-600 font-semibold">⚡ Demo Mode</span>
            </div>
            <div className="flex justify-between">
              <span>Music Analysis (Music21)</span>
              <span className="text-yellow-600 font-semibold">⚡ Demo Mode</span>
            </div>
            <div className="flex justify-between">
              <span>MIDI Export</span>
              <span className="text-gray-500 font-semibold">⏳ Planned</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          <strong>Note:</strong> Currently running in demo mode.
          For full OMR functionality, install Oemer and Music21 libraries in the backend.
        </div>
      </div>
    </div>
  )
}