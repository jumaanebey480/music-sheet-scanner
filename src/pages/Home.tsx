import React from 'react'
import { Link } from 'react-router-dom'
import { Upload, Play, Music2, Camera } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Layout } from '../components/layout/Layout'
import { useAuthContext } from '../components/auth/AuthProvider'

export function Home() {
  const { isAuthenticated } = useAuthContext()

  const features = [
    {
      icon: Camera,
      title: 'Scan Sheet Music',
      description: 'Upload photos or PDFs of sheet music for automatic recognition'
    },
    {
      icon: Music2,
      title: 'View Notation',
      description: 'See your music displayed as interactive digital notation'
    },
    {
      icon: Play,
      title: 'Play & Control',
      description: 'Listen to your music with tempo, volume, and multi-staff controls'
    },
    {
      icon: Upload,
      title: 'Export & Share',
      description: 'Export as MIDI or MusicXML files for use in other applications'
    }
  ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Turn Sheet Music Into
            <span className="text-primary"> Digital Audio</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload photos of sheet music and instantly convert them to playable digital notation
            with advanced optical music recognition technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/upload">Upload Sheet Music</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Upload</h3>
              <p className="text-muted-foreground">
                Take a photo or upload a PDF of your sheet music
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Process</h3>
              <p className="text-muted-foreground">
                Our AI analyzes and converts your music to digital notation
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Play & Export</h3>
              <p className="text-muted-foreground">
                Listen, edit, and export your music in various formats
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="text-center bg-muted rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of musicians using MusicScanner to digitize their sheet music.
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}