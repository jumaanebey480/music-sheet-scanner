import { useState, useEffect } from 'react'

interface SavedSong {
  id: string
  title: string
  date: string
  source: 'uploaded' | 'imported'
}

export function Library() {
  const [savedSongs] = useState<SavedSong[]>([
    {
      id: '1',
      title: 'Twinkle Twinkle Little Star',
      date: '2024-01-15',
      source: 'uploaded'
    },
    {
      id: '2',
      title: 'Turkish March',
      date: '2024-01-14',
      source: 'imported'
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 My Music Library
          </h1>
          <p className="text-lg text-gray-600">
            View and manage your uploaded and imported music files
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Songs</h2>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                📤 Upload New
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                📂 Import MIDI/XML
              </button>
            </div>
          </div>

          {savedSongs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎼</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No songs yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload sheet music or import MIDI/MusicXML files to get started
              </p>
              <div className="flex items-center justify-center space-x-4">
                <a
                  href="/scanner"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upload Sheet Music
                </a>
                <a
                  href="/player"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Go to Player
                </a>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSongs.map((song) => (
                <div
                  key={song.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">
                      {song.source === 'uploaded' ? '📤' : '📂'}
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {song.source}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {song.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{song.date}</p>
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors">
                      ▶️ Play
                    </button>
                    <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded text-sm hover:bg-gray-100 transition-colors">
                      📥
                    </button>
                    <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded text-sm hover:bg-gray-100 transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📤</div>
            <div className="text-2xl font-bold text-gray-900">
              {savedSongs.filter((s) => s.source === 'uploaded').length}
            </div>
            <div className="text-sm text-gray-600">Uploaded Songs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📂</div>
            <div className="text-2xl font-bold text-gray-900">
              {savedSongs.filter((s) => s.source === 'imported').length}
            </div>
            <div className="text-sm text-gray-600">Imported Files</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">🎵</div>
            <div className="text-2xl font-bold text-gray-900">
              {savedSongs.length}
            </div>
            <div className="text-sm text-gray-600">Total Songs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
