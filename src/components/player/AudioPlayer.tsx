import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { PlaybackControls } from './PlaybackControls'
import { ProgressBar } from './ProgressBar'
import { TempoControl } from './TempoControl'
import { VolumeControl } from './VolumeControl'
import { usePlayer } from '../../hooks/usePlayer'
import { AudioNote } from '../../types'

interface AudioPlayerProps {
  notes?: AudioNote[]
  title?: string
  compact?: boolean
  className?: string
}

export function AudioPlayer({ notes, title, compact = false, className }: AudioPlayerProps) {
  const { loadNotes, hasNotes, loading, error, initialize } = usePlayer()

  useEffect(() => {
    if (notes && notes.length > 0) {
      loadNotes(notes)
    }
  }, [notes, loadNotes])

  // Initialize audio context on first interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      await initialize()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [initialize])

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <ProgressBar compact showTime={false} disabled={loading} />
        <div className="flex items-center justify-between space-x-4">
          <PlaybackControls size="sm" showLoop={false} disabled={loading} />
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <TempoControl compact disabled={loading} />
            </div>
            <div className="flex-1 min-w-0">
              <VolumeControl compact disabled={loading} />
            </div>
          </div>
        </div>
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">
          {title || 'Audio Player'}
        </CardTitle>
        <CardDescription>
          {hasNotes
            ? 'Use the controls below to play your music'
            : 'Load music notes to begin playback'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <div className="mt-2 text-sm text-muted-foreground">Loading audio...</div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <ProgressBar disabled={loading} />

        {/* Main Controls */}
        <div className="flex items-center justify-center">
          <PlaybackControls size="lg" disabled={loading} />
        </div>

        {/* Settings */}
        <div className="grid md:grid-cols-2 gap-6">
          <TempoControl disabled={loading} />
          <VolumeControl disabled={loading} />
        </div>

        {/* Status */}
        <div className="text-center">
          {!hasNotes && !loading && (
            <p className="text-sm text-muted-foreground">
              Upload sheet music to start playing
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}