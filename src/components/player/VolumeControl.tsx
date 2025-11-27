import React from 'react'
import { Volume2, VolumeX, Volume1 } from 'lucide-react'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { usePlayer } from '../../hooks/usePlayer'

interface VolumeControlProps {
  disabled?: boolean
  compact?: boolean
}

export function VolumeControl({ disabled = false, compact = false }: VolumeControlProps) {
  const { volume, setVolume } = usePlayer()
  const [previousVolume, setPreviousVolume] = React.useState(0.8)

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0]
    if (newVolume > 0) {
      setPreviousVolume(newVolume)
    }
    setVolume(newVolume)
  }

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume)
      setVolume(0)
    } else {
      setVolume(previousVolume)
    }
  }

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX
    if (volume < 0.5) return Volume1
    return Volume2
  }

  const VolumeIcon = getVolumeIcon()

  if (compact) {
    return (
      <div className="flex items-center space-x-2 min-w-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleMute}
          disabled={disabled}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <VolumeIcon className="h-3 w-3" />
        </Button>
        <div className="flex-1 min-w-0">
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.05}
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {Math.round(volume * 100)}%
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            disabled={disabled}
            className="h-6 w-6 p-0"
          >
            <VolumeIcon className="h-4 w-4" />
          </Button>
          <label className="text-sm font-medium">Volume</label>
        </div>
        <span className="text-sm font-mono text-muted-foreground">
          {Math.round(volume * 100)}%
        </span>
      </div>

      <Slider
        value={[volume]}
        onValueChange={handleVolumeChange}
        min={0}
        max={1}
        step={0.05}
        disabled={disabled}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <div className="flex space-x-4">
          <button
            onClick={() => setVolume(0.25)}
            disabled={disabled}
            className={`
              hover:text-foreground transition-colors cursor-pointer
              ${Math.abs(volume - 0.25) < 0.05 ? 'text-foreground font-medium' : ''}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          >
            25%
          </button>
          <button
            onClick={() => setVolume(0.5)}
            disabled={disabled}
            className={`
              hover:text-foreground transition-colors cursor-pointer
              ${Math.abs(volume - 0.5) < 0.05 ? 'text-foreground font-medium' : ''}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          >
            50%
          </button>
          <button
            onClick={() => setVolume(0.8)}
            disabled={disabled}
            className={`
              hover:text-foreground transition-colors cursor-pointer
              ${Math.abs(volume - 0.8) < 0.05 ? 'text-foreground font-medium' : ''}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
          >
            80%
          </button>
        </div>
        <span>100%</span>
      </div>
    </div>
  )
}