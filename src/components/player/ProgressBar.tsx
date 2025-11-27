import React from 'react'
import { Slider } from '../ui/slider'
import { usePlayer } from '../../hooks/usePlayer'
import { formatDuration } from '../../lib/utils'

interface ProgressBarProps {
  disabled?: boolean
  showTime?: boolean
  compact?: boolean
}

export function ProgressBar({ disabled = false, showTime = true, compact = false }: ProgressBarProps) {
  const { currentTime, duration, seek, hasNotes } = usePlayer()

  const handleSeek = (values: number[]) => {
    if (hasNotes && duration > 0) {
      seek(values[0])
    }
  }

  const progress = duration > 0 ? currentTime / duration : 0

  if (compact) {
    return (
      <div className="flex items-center space-x-2 min-w-0">
        <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {formatDuration(currentTime)}
        </div>
        <div className="flex-1 min-w-0">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            min={0}
            max={duration || 100}
            step={0.1}
            disabled={disabled || !hasNotes}
            className="w-full"
          />
        </div>
        <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {formatDuration(duration)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {showTime && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-muted-foreground">
            {formatDuration(currentTime)}
          </span>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              {hasNotes ? `${Math.round(progress * 100)}% complete` : 'No music loaded'}
            </span>
          </div>
          <span className="font-mono text-muted-foreground">
            {formatDuration(duration)}
          </span>
        </div>
      )}

      <Slider
        value={[currentTime]}
        onValueChange={handleSeek}
        min={0}
        max={duration || 100}
        step={0.1}
        disabled={disabled || !hasNotes}
        className="w-full"
      />

      {!hasNotes && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Upload and process sheet music to see playback progress
          </p>
        </div>
      )}
    </div>
  )
}