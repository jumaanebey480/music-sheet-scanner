import React, { useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ImageUploader } from '../components/upload/ImageUploader'
import { AudioPlayer } from '../components/player/AudioPlayer'
import { Upload, Music, Play, Download, ArrowLeft } from 'lucide-react'
import { MidiParser } from '../lib/audio/midi-parser'

type ViewMode = 'overview' | 'upload' | 'player'

export function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [currentNotes, setCurrentNotes] = useState<any[]>([])
  const [currentTitle, setCurrentTitle] = useState<string>('')

  const handleUploadComplete = async (uploadId: string) => {
    // In a real app, you would fetch the processed data from the database
    // For now, let's simulate with demo data
    const demoNotes = MidiParser.createDemoNotes()
    setCurrentNotes(demoNotes)
    setCurrentTitle('Demo Song - Uploaded Music')
    setViewMode('player')
  }

  const handleBackToOverview = () => {
    setViewMode('overview')
    setCurrentNotes([])
    setCurrentTitle('')
  }

  const handleUploadClick = () => {
    setViewMode('upload')
  }

  if (viewMode === 'upload') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-2">Upload Sheet Music</h1>
            <p className="text-muted-foreground">
              Upload your sheet music to convert it to digital notation
            </p>
          </div>

          <ImageUploader onUploadComplete={handleUploadComplete} />
        </div>
      </Layout>
    )
  }

  if (viewMode === 'player') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-2">Music Player</h1>
            <p className="text-muted-foreground">
              Your sheet music has been processed and is ready to play
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AudioPlayer
                notes={currentNotes}
                title={currentTitle}
                className="w-full"
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Confidence:</span>
                    <span className="text-sm font-medium text-green-600">88%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Notes detected:</span>
                    <span className="text-sm font-medium">{currentNotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duration:</span>
                    <span className="text-sm font-medium">
                      {currentNotes.length > 0
                        ? `${Math.max(...currentNotes.map(n => n.startTime + n.duration)).toFixed(1)}s`
                        : '0s'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Download MIDI
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Download MusicXML
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Export functionality coming soon!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your sheet music uploads and access your music library
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No uploads yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Ready to play</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Saved pieces</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 MB</div>
              <p className="text-xs text-muted-foreground">of 100 MB used</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>
                  Your most recently uploaded sheet music
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No uploads yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first sheet music to get started
                  </p>
                  <Button onClick={handleUploadClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Sheet Music
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>
                  Get started with your music scanner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Upload sheet music</p>
                    <p className="text-xs text-muted-foreground">
                      Take photos or upload PDFs
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Wait for processing</p>
                    <p className="text-xs text-muted-foreground">
                      AI converts to digital notation
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Play and export</p>
                    <p className="text-xs text-muted-foreground">
                      Listen and download as MIDI
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demo Player</CardTitle>
                <CardDescription>
                  Try out the audio player with sample music
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const demoNotes = MidiParser.createDemoNotes()
                    setCurrentNotes(demoNotes)
                    setCurrentTitle('Demo Song')
                    setViewMode('player')
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Try Demo Player
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  • Use high-contrast, well-lit photos for best results
                </p>
                <p className="text-sm">
                  • Ensure the entire sheet is visible and not cropped
                </p>
                <p className="text-sm">
                  • PDF uploads typically give more accurate results
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}