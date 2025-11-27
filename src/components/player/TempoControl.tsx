import React from 'react'
import { Zap } from 'lucide-react'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { usePlayer } from '../../hooks/usePlayer'

interface TempoControlProps {
  disabled?: boolean
  compact?: boolean
}

export function TempoControl({ disabled = false, compact = false }: TempoControlProps) {
  const { tempo, setTempo } = usePlayer()

  const handleTempoChange = (values: number[]) => {
    setTempo(values[0])
  }

  const resetTempo = () => {
    setTempo(120)
  }

  const presets = [
    { label: 'Slow', bpm: 80 },
    { label: 'Normal', bpm: 120 },
    { label: 'Fast', bpm: 160 },
  ]

  if (compact) {
    return (
      <div className="flex items-center space-x-2 min-w-0">
        <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Slider
            value={[tempo]}
            onValueChange={handleTempoChange}
            min={40}
            max={240}
            step={5}
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {tempo}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Tempo</label>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-muted-foreground">
            {tempo} BPM
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetTempo}
            disabled={disabled || tempo === 120}
            className="h-6 px-2"
          >
            Reset
          </Button>
        </div>
      </div>

      <Slider
        value={[tempo]}
        onValueChange={handleTempoChange}
        min={40}
        max={240}
        step={5}
        disabled={disabled}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>40</span>
        <div className="flex space-x-4">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setTempo(preset.bpm)}
              disabled={disabled}
              className={`
                hover:text-foreground transition-colors
                ${tempo === preset.bpm ? 'text-foreground font-medium' : ''}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <span>240</span>
      </div>
    </div>
  )
}