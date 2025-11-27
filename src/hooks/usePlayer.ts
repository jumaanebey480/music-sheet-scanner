import { useState, useEffect, useCallback } from 'react'
import { audioPlayer } from '../lib/audio/player'
import { AudioNote, PlaybackState } from '../types'

export function usePlayer() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioPlayer.playbackState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to playback state changes
    const unsubscribe = audioPlayer.onStateChange((state) => {
      setPlaybackState(state)
    })

    return unsubscribe
  }, [])

  const loadNotes = useCallback(async (notes: AudioNote[]) => {
    try {
      setLoading(true)
      setError(null)
      audioPlayer.loadNotes(notes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [])

  const play = useCallback(async () => {
    try {
      setError(null)
      await audioPlayer.play()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start playback')
    }
  }, [])

  const pause = useCallback(() => {
    try {
      setError(null)
      audioPlayer.pause()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause playback')
    }
  }, [])

  const stop = useCallback(() => {
    try {
      setError(null)
      audioPlayer.stop()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop playback')
    }
  }, [])

  const seek = useCallback((time: number) => {
    try {
      setError(null)
      audioPlayer.seek(time)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seek')
    }
  }, [])

  const setTempo = useCallback((bpm: number) => {
    try {
      setError(null)
      audioPlayer.setTempo(bpm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change tempo')
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    try {
      setError(null)
      audioPlayer.setVolume(volume)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change volume')
    }
  }, [])

  const setLoop = useCallback((loop: boolean) => {
    try {
      setError(null)
      audioPlayer.setLoop(loop)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle loop')
    }
  }, [])

  const initialize = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await audioPlayer.initialize()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize audio')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    playbackState,
    loading,
    error,
    loadNotes,
    play,
    pause,
    stop,
    seek,
    setTempo,
    setVolume,
    setLoop,
    initialize,
    // Computed values
    isPlaying: playbackState.isPlaying,
    isPaused: playbackState.isPaused,
    currentTime: playbackState.currentTime,
    duration: playbackState.duration,
    tempo: playbackState.tempo,
    volume: playbackState.volume,
    loop: playbackState.loop,
    // Convenience methods
    togglePlayPause: playbackState.isPlaying ? pause : play,
    hasNotes: playbackState.duration > 0,
    progress: playbackState.duration > 0 ? playbackState.currentTime / playbackState.duration : 0,
  }
}