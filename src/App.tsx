import { MusicScanner } from './components/MusicScanner'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎼</span>
              <span className="text-xl font-bold text-gray-900">MusicScanner</span>
            </div>
            <div className="text-sm text-gray-600">
              Digital Music Processing & Playback
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <MusicScanner />
      </main>

      {/* Footer */}
      <footer className="mt-8 pb-8 text-center text-sm text-gray-600">
        <p>🎵 Full-featured music import, export, and playback system</p>
      </footer>
    </div>
  )
}

export default App
