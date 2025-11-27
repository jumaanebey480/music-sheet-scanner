import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './components/auth/AuthProvider'
import { MusicScanner } from './components/MusicScanner'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🎼</span>
              <span className="text-xl font-bold text-gray-900">MusicScanner</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Digital Music Processing & Playback</span>
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign Up
              </Link>
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<div className="p-8 text-center"><h1>404 - Page not found</h1></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
