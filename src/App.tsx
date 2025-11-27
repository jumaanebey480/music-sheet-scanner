import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './components/auth/AuthProvider'
import { MusicScanner } from './components/MusicScanner'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Scanner } from './pages/Scanner'
import { Player } from './pages/Player'
import { Library } from './pages/Library'
import { About } from './pages/About'

function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/scanner', label: 'Scanner', icon: '📷' },
    { path: '/player', label: 'Player', icon: '🎵' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/about', label: 'About', icon: 'ℹ️' }
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🎼</span>
            <span className="text-xl font-bold text-gray-900">MusicScanner</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
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

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center space-x-1 mt-4 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive(link.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Turn Sheet Music Into
            <span className="text-blue-600"> Digital Audio</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload photos of sheet music and instantly convert them to playable digital
            notation with advanced optical music recognition technology.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/scanner"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              🎼 Start Scanning
            </Link>
            <Link
              to="/player"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
            >
              🎵 Try Player
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            {
              icon: '📷',
              title: 'Scan Music',
              description: 'Upload photos or PDFs',
              link: '/scanner'
            },
            {
              icon: '🎵',
              title: 'Play Audio',
              description: 'Listen with controls',
              link: '/player'
            },
            {
              icon: '📚',
              title: 'Manage Library',
              description: 'Organize your music',
              link: '/library'
            },
            {
              icon: '💾',
              title: 'Import/Export',
              description: 'MIDI & MusicXML',
              link: '/player'
            }
          ].map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Try It Now
          </h2>
          <MusicScanner />
        </div>
      </main>

      <footer className="mt-12 pb-8 text-center text-sm text-gray-600">
        <p>🎵 Full-featured music import, export, and playback system</p>
      </footer>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with navigation */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/scanner" element={<Layout><Scanner /></Layout>} />
          <Route path="/player" element={<Layout><Player /></Layout>} />
          <Route path="/library" element={<Layout><Library /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />

          {/* Auth routes without main navigation */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Go Home
                  </Link>
                </div>
              </div>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
