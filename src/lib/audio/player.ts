import * as Tone from 'tone'
import { AudioNote, PlaybackState } from '../../types'

export class AudioPlayer {
  private synth: Tone.PolySynth
  private transport: typeof Tone.Transport
  private currentNotes: Tone.Part[]
  private _playbackState: PlaybackState
  private listeners: ((state: PlaybackState) => void)[]

  constructor() {
    // Initialize Tone.js components
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination()

    this.transport = Tone.Transport
    this.currentNotes = []
    this.listeners = []

    // Initialize playback state
    this._playbackState = {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      tempo: 120,
      volume: 0.8,
      loop: false,
    }

    // Set initial transport settings
    this.transport.bpm.value = this._playbackState.tempo
    this.transport.loop = false

    // Update current time during playback
    this.transport.scheduleRepeat((time) => {
      if (this._playbackState.isPlaying) {
        this._playbackState.currentTime = this.transport.seconds
        this.notifyListeners()
      }
    }, 0.1)
  }

  async initialize() {
    // Start audio context on user interaction
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
  }

  loadNotes(notes: AudioNote[]) {
    // Clear existing notes
    this.clearNotes()

    if (notes.length === 0) return

    // Calculate total duration
    const maxEndTime = Math.max(...notes.map(note => note.startTime + note.duration))
    this._playbackState.duration = maxEndTime
    this._playbackState.currentTime = 0

    // Create Tone.Part for scheduling notes
    const part = new Tone.Part((time, note: AudioNote) => {
      this.synth.triggerAttackRelease(
        note.pitch,
        note.duration,
        time,
        note.velocity
      )
    }, notes.map(note => [note.startTime, note]))

    this.currentNotes.push(part)
    this.notifyListeners()
  }

  async play() {
    await this.initialize()

    if (this._playbackState.isPaused) {
      // Resume from pause
      this.transport.start()
      this._playbackState.isPlaying = true
      this._playbackState.isPaused = false
    } else {
      // Start from beginning or current position
      this.currentNotes.forEach(part => part.start(0))
      this.transport.start()
      this._playbackState.isPlaying = true
      this._playbackState.isPaused = false
    }

    // Schedule stop at the end if not looping
    if (!this._playbackState.loop && this._playbackState.duration > 0) {
      this.transport.schedule(() => {
        this.stop()
      }, this._playbackState.duration)
    }

    this.notifyListeners()
  }

  pause() {
    this.transport.pause()
    this._playbackState.isPlaying = false
    this._playbackState.isPaused = true
    this.notifyListeners()
  }

  stop() {
    this.transport.stop()
    this.transport.cancel() // Clear all scheduled events
    this.currentNotes.forEach(part => part.stop())

    this._playbackState.isPlaying = false
    this._playbackState.isPaused = false
    this._playbackState.currentTime = 0
    this.transport.seconds = 0

    this.notifyListeners()
  }

  seek(time: number) {
    const wasPlaying = this._playbackState.isPlaying

    if (wasPlaying) {
      this.stop()
    }

    this.transport.seconds = time
    this._playbackState.currentTime = time

    if (wasPlaying) {
      this.play()
    }

    this.notifyListeners()
  }

  setTempo(bpm: number) {
    this.transport.bpm.rampTo(bpm, 0.5) // Smooth tempo change over 0.5 seconds
    this._playbackState.tempo = bpm
    this.notifyListeners()
  }

  setVolume(volume: number) {
    // Convert linear volume (0-1) to decibels
    const db = volume === 0 ? -Infinity : Tone.gainToDb(volume)
    this.synth.volume.rampTo(db, 0.1)
    this._playbackState.volume = volume
    this.notifyListeners()
  }

  setLoop(loop: boolean) {
    this.transport.loop = loop
    this._playbackState.loop = loop
    this.notifyListeners()
  }

  private clearNotes() {
    this.currentNotes.forEach(part => {
      part.stop()
      part.dispose()
    })
    this.currentNotes = []
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this._playbackState }))
  }

  onStateChange(listener: (state: PlaybackState) => void) {
    this.listeners.push(listener)
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  get playbackState(): PlaybackState {
    return { ...this._playbackState }
  }

  dispose() {
    this.stop()
    this.clearNotes()
    this.synth.dispose()
    this.listeners = []
  }
}

// Global audio player instance
export const audioPlayer = new AudioPlayer()