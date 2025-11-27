import React from 'react'
import { Play, Pause, Square, RotateCcw, Repeat } from 'lucide-react'
import { Button } from '../ui/button'
import { usePlayer } from '../../hooks/usePlayer'

interface PlaybackControlsProps {
  size?: 'sm' | 'md' | 'lg'
  showLoop?: boolean
  disabled?: boolean
}

export function PlaybackControls({ size = 'md', showLoop = true, disabled = false }: PlaybackControlsProps) {
  const { isPlaying, isPaused, loop, hasNotes, play, pause, stop, setLoop } = usePlayer()

  const buttonSize = {
    sm: 'icon',
    md: 'default',
    lg: 'lg',
  }[size] as 'icon' | 'default' | 'lg'

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size]

  return (
    <div className="flex items-center space-x-2">
      {/* Main play/pause button */}
      <Button
        size={buttonSize}
        onClick={isPlaying ? pause : play}
        disabled={disabled || !hasNotes}
        className="flex items-center"
      >
        {isPlaying ? (
          <Pause className={iconSize} />
        ) : (
          <Play className={iconSize} />
        )}
        {size !== 'sm' && (
          <span className="ml-1">
            {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
          </span>
        )}
      </Button>

      {/* Stop button */}
      <Button
        size={buttonSize}
        variant="outline"
        onClick={stop}
        disabled={disabled || (!isPlaying && !isPaused)}
      >
        <Square className={iconSize} />
        {size === 'lg' && <span className="ml-1">Stop</span>}
      </Button>

      {/* Reset button */}
      <Button
        size={buttonSize}
        variant="outline"
        onClick={stop}
        disabled={disabled || !hasNotes}
      >
        <RotateCcw className={iconSize} />
        {size === 'lg' && <span className="ml-1">Reset</span>}
      </Button>

      {/* Loop toggle */}
      {showLoop && (
        <Button
          size={buttonSize}
          variant={loop ? 'default' : 'outline'}
          onClick={() => setLoop(!loop)}
          disabled={disabled}
        >
          <Repeat className={iconSize} />
          {size === 'lg' && <span className="ml-1">Loop</span>}
        </Button>
      )}
    </div>
  )
}