export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            About MusicScanner
          </h1>
          <p className="text-lg text-gray-600">
            Advanced optical music recognition and digital playback system
          </p>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What is MusicScanner?
            </h2>
            <p className="text-gray-700 mb-4">
              MusicScanner is a comprehensive web application that combines optical music
              recognition (OMR) technology with advanced digital audio playback. Upload
              photos of sheet music and instantly convert them into playable digital
              notation that you can hear, edit, and share.
            </p>
            <p className="text-gray-700">
              Built with modern web technologies including React, TypeScript, Tone.js for
              audio synthesis, and VexFlow for musical notation rendering.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: '📷',
                  title: 'Sheet Music Scanner',
                  description: 'Upload photos of sheet music for automatic recognition'
                },
                {
                  icon: '🎼',
                  title: 'MIDI & MusicXML Import',
                  description: 'Import existing music files from other applications'
                },
                {
                  icon: '🎹',
                  title: '12+ Orchestra Instruments',
                  description: 'Choose from strings, woodwinds, brass, percussion, and more'
                },
                {
                  icon: '🎭',
                  title: '4-Part Choir Mode',
                  description: 'Experience SATB harmonies with individual voice control'
                },
                {
                  icon: '🎵',
                  title: 'Key Transposition',
                  description: 'Change keys across 12 major scales instantly'
                },
                {
                  icon: '⏱️',
                  title: 'Tempo & Metronome',
                  description: 'Adjustable tempo with visual and audio metronome'
                },
                {
                  icon: '💾',
                  title: 'MIDI Export',
                  description: 'Download your music as standard MIDI files'
                },
                {
                  icon: '⏺️',
                  title: 'Audio Recording',
                  description: 'Record playback as high-quality WAV files'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• React 19 with TypeScript</li>
                  <li>• Tone.js for audio synthesis</li>
                  <li>• VexFlow for music notation</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Vite for build tooling</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Backend</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• FastAPI (Python) server</li>
                  <li>• OpenCV for image processing</li>
                  <li>• Oemer for OMR</li>
                  <li>• Music21 for music analysis</li>
                  <li>• Supabase for authentication</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-900">
                  Frontend Application
                </span>
                <span className="text-green-600 font-semibold">✓ Running</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-900">Audio Engine</span>
                <span className="text-green-600 font-semibold">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-900">Backend API</span>
                <span className="text-green-600 font-semibold">✓ Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-gray-900">OMR Engine</span>
                <span className="text-yellow-600 font-semibold">⚡ Demo Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
