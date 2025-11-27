import { DemoPlayer } from '../components/DemoPlayer'
import { useEffect, useState } from 'react'

export function Player() {
  const [uploadedSong, setUploadedSong] = useState<any>(null)

  useEffect(() => {
    // Check if there's an uploaded song in session storage
    const storedMusic = sessionStorage.getItem('uploadedMusic')
    if (storedMusic) {
      const musicData = JSON.parse(storedMusic)
      setUploadedSong({
        uploaded: {
          title: musicData.title,
          melody: musicData.melody
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎵 Music Player
          </h1>
          <p className="text-lg text-gray-600">
            Play music with multiple instruments, import/export, and advanced controls
          </p>
        </div>

        <DemoPlayer uploadedSong={uploadedSong} />
      </div>
    </div>
  )
}
