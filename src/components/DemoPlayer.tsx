import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { saveAs } from 'file-saver'
import MidiWriter from 'midi-writer-js'
import { SimpleNotation } from './SimpleNotation'
import MidiParser from '../lib/audio/midi-parser'

interface DemoPlayerProps {
  uploadedSong?: {
    uploaded: {
      title: string
      melody: Array<{ note: string; time: number; duration: string }>
    }
  }
}

export function DemoPlayer({ uploadedSong }: DemoPlayerProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [volume, setVolume] = useState(0.7)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(8) // 8 second demo
  const [synth, setSynth] = useState<any>(null)
  const [part, setPart] = useState<Tone.Part | null>(null)
  const [selectedSong, setSelectedSong] = useState(uploadedSong ? 'uploaded' : 'twinkle')
  const [isLooping, setIsLooping] = useState(false)
  const [showMetronome, setShowMetronome] = useState(false)
  const [metronomeActive, setMetronomeActive] = useState(false)
  const [selectedInstrument, setSelectedInstrument] = useState('piano')
  const [voiceParts, setVoiceParts] = useState({
    soprano: { enabled: true, volume: 0.8, muted: false, solo: false },
    alto: { enabled: true, volume: 0.8, muted: false, solo: false },
    tenor: { enabled: true, volume: 0.8, muted: false, solo: false },
    bass: { enabled: true, volume: 0.8, muted: false, solo: false }
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<Tone.Recorder | null>(null)
  const [keyTransposition, setKeyTransposition] = useState(0)
  const [metronomeVolume, setMetronomeVolume] = useState(0.3)
  const [metronomeClick, setMetronomeClick] = useState<Tone.Synth | null>(null)
  const [importedSongs, setImportedSongs] = useState<{ [key: string]: { title: string; melody: any[] } }>({})
  const [isImporting, setIsImporting] = useState(false)

  // Helper to check if choir mode is active
  const isChoirMode = selectedInstrument === 'choir' && selectedSong === 'saints'

  // Key transposition utility
  const transposeNote = (note: string, semitones: number) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const noteRegex = /([A-G]#?)([0-9])/
    const match = note.match(noteRegex)

    if (!match) return note

    const [, noteName, octave] = match
    const noteIndex = notes.indexOf(noteName)
    const octaveNum = parseInt(octave)

    let newNoteIndex = (noteIndex + semitones) % 12
    if (newNoteIndex < 0) newNoteIndex += 12

    let newOctave = octaveNum + Math.floor((noteIndex + semitones) / 12)
    if (noteIndex + semitones < 0 && (noteIndex + semitones) % 12 !== 0) {
      newOctave--
    }

    return notes[newNoteIndex] + newOctave
  }

  // Export to MIDI
  const exportToMIDI = () => {
    const track = new MidiWriter.Track()
    const currentSong = selectedSong === 'uploaded' && uploadedSong ? uploadedSong.uploaded : builtInSongs[selectedSong as keyof typeof builtInSongs]

    if (!currentSong) return

    if (isChoirMode) {
      // Export choir arrangement
      Object.entries(choirArrangements.saints).forEach(([, voiceNotes]) => {
        voiceNotes.forEach(note => {
          const transposedNote = transposeNote(note.note, keyTransposition)
          const wait = new MidiWriter.NoteEvent({
            pitch: transposedNote,
            duration: note.duration,
            wait: Math.round(note.time * Tone.Transport.bpm.value / 30) // Convert to ticks
          })
          track.addEvent(wait)
        })
      })
    } else {
      // Export single melody
      currentSong.melody.forEach(note => {
        const transposedNote = transposeNote(note.note, keyTransposition)
        const wait = new MidiWriter.NoteEvent({
          pitch: transposedNote,
          duration: note.duration,
          wait: Math.round(note.time * Tone.Transport.bpm.value / 30)
        })
        track.addEvent(wait)
      })
    }

    const write = new MidiWriter.Writer(track)
    const blob = new Blob([new Uint8Array(write.buildFile())], { type: 'audio/midi' })
    saveAs(blob, `${currentSong.title.replace(/\s+/g, '_')}.mid`)
  }

  // Start/Stop audio recording
  const toggleRecording = async () => {
    if (!isRecording) {
      const newRecorder = new Tone.Recorder()
      Tone.Destination.connect(newRecorder)
      await newRecorder.start()
      setRecorder(newRecorder)
      setIsRecording(true)
    } else if (recorder) {
      const recording = await recorder.stop()
      const blob = new Blob([recording], { type: 'audio/wav' })
      const currentSong = selectedSong === 'uploaded' && uploadedSong ? uploadedSong.uploaded : builtInSongs[selectedSong as keyof typeof builtInSongs]
      if (!currentSong) return
      saveAs(blob, `${currentSong.title.replace(/\s+/g, '_')}_recording.wav`)
      setRecorder(null)
      setIsRecording(false)
    }
  }

  // Import MIDI file
  const handleMidiImport = async (file: File) => {
    setIsImporting(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      const midiData = MidiParser.parseMidiData(base64)
      const audioNotes = MidiParser.parseToAudioNotes(midiData)

      // Convert to our format
      const melody = audioNotes.map(note => ({
        note: note.pitch,
        time: note.startTime,
        duration: note.duration > 1 ? '2n' : note.duration > 0.5 ? '4n' : '8n'
      }))

      const songKey = `imported_${Date.now()}`
      const newSong = {
        title: file.name.replace(/\.[^/.]+$/, '') || 'Imported MIDI',
        melody
      }

      setImportedSongs(prev => ({ ...prev, [songKey]: newSong }))
      setSelectedSong(songKey)

      // Reinitialize audio with new song
      if (synth) {
        synth.dispose()
      }
      if (part) {
        part.dispose()
      }

    } catch (error) {
      console.error('MIDI import failed:', error)
      alert('Failed to import MIDI file. Please check the file format.')
    } finally {
      setIsImporting(false)
    }
  }

  // Import MusicXML file
  const handleMusicXMLImport = async (file: File) => {
    setIsImporting(true)
    try {
      const text = await file.text()
      const audioNotes = MidiParser.parseMusicXMLToNotes(text)

      // Convert to our format
      const melody = audioNotes.map(note => ({
        note: note.pitch,
        time: note.startTime,
        duration: note.duration > 1 ? '2n' : note.duration > 0.5 ? '4n' : '8n'
      }))

      const songKey = `imported_${Date.now()}`
      const newSong = {
        title: file.name.replace(/\.[^/.]+$/, '') || 'Imported MusicXML',
        melody
      }

      setImportedSongs(prev => ({ ...prev, [songKey]: newSong }))
      setSelectedSong(songKey)

      // Reinitialize audio with new song
      if (synth) {
        synth.dispose()
      }
      if (part) {
        part.dispose()
      }

    } catch (error) {
      console.error('MusicXML import failed:', error)
      alert('Failed to import MusicXML file. Please check the file format.')
    } finally {
      setIsImporting(false)
    }
  }

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (fileExtension === 'mid' || fileExtension === 'midi') {
      await handleMidiImport(file)
    } else if (fileExtension === 'xml' || fileExtension === 'musicxml') {
      await handleMusicXMLImport(file)
    } else {
      alert('Please select a MIDI (.mid/.midi) or MusicXML (.xml/.musicxml) file')
    }

    // Reset file input
    event.target.value = ''
  }

  // Initialize metronome
  useEffect(() => {
    const click = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.0, release: 0.1 }
    }).toDestination()
    click.volume.value = Tone.gainToDb(metronomeVolume)
    setMetronomeClick(click)

    return () => {
      click.dispose()
    }
  }, [metronomeVolume])

  // Symphony Orchestra Instrument configurations
  const instruments = {
    // STRINGS SECTION
    violin: {
      name: '🎻 Violin',
      section: 'Strings',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sawtooth', partialCount: 10 },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 }
      })
    },
    viola: {
      name: '🎻 Viola',
      section: 'Strings',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sawtooth', partialCount: 8 },
        envelope: { attack: 0.12, decay: 0.35, sustain: 0.45, release: 0.9 }
      })
    },
    cello: {
      name: '🎻 Cello',
      section: 'Strings',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sawtooth', partialCount: 6 },
        envelope: { attack: 0.15, decay: 0.4, sustain: 0.5, release: 1.2 }
      })
    },
    doublebass: {
      name: '🎻 Double Bass',
      section: 'Strings',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sawtooth', partialCount: 4 },
        envelope: { attack: 0.2, decay: 0.5, sustain: 0.6, release: 1.5 }
      })
    },
    harp: {
      name: '🎵 Harp',
      section: 'Strings',
      createSynth: () => new Tone.PluckSynth({
        attackNoise: 0.2,
        dampening: 1000,
        resonance: 0.9
      })
    },

    // WOODWINDS SECTION
    flute: {
      name: '🎶 Flute',
      section: 'Woodwinds',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 1.0 }
      })
    },
    piccolo: {
      name: '🎶 Piccolo',
      section: 'Woodwinds',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.03, decay: 0.08, sustain: 0.95, release: 0.8 }
      })
    },
    oboe: {
      name: '🎶 Oboe',
      section: 'Woodwinds',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.08, decay: 0.2, sustain: 0.7, release: 1.1 }
      })
    },
    clarinet: {
      name: '🎶 Clarinet',
      section: 'Woodwinds',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.06, decay: 0.15, sustain: 0.8, release: 1.0 }
      })
    },
    bassoon: {
      name: '🎶 Bassoon',
      section: 'Woodwinds',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sawtooth', partialCount: 4 },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.3 }
      })
    },

    // BRASS SECTION
    trumpet: {
      name: '🎺 Trumpet',
      section: 'Brass',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'square', partialCount: 8 },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.9, release: 0.6 }
      })
    },
    horn: {
      name: '🎺 French Horn',
      section: 'Brass',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sawtooth', partialCount: 6 },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.8 }
      })
    },
    trombone: {
      name: '🎺 Trombone',
      section: 'Brass',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'square', partialCount: 6 },
        envelope: { attack: 0.08, decay: 0.2, sustain: 0.85, release: 1.0 }
      })
    },
    tuba: {
      name: '🎺 Tuba',
      section: 'Brass',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'square', partialCount: 4 },
        envelope: { attack: 0.15, decay: 0.3, sustain: 0.9, release: 1.2 }
      })
    },

    // PERCUSSION SECTION
    timpani: {
      name: '🥁 Timpani',
      section: 'Percussion',
      createSynth: () => new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 1.4, sustain: 0.01, release: 1.4 }
      })
    },
    xylophone: {
      name: '🎵 Xylophone',
      section: 'Percussion',
      createSynth: () => new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      })
    },
    celesta: {
      name: '🎵 Celesta',
      section: 'Percussion',
      createSynth: () => new Tone.FMSynth({
        modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 2, sustain: 0.1, release: 2 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 }
      })
    },

    // KEYBOARD (often featured)
    piano: {
      name: '🎹 Piano',
      section: 'Keyboard',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1.2 }
      })
    },
    organ: {
      name: '🎹 Pipe Organ',
      section: 'Keyboard',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'square', partialCount: 5 },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.4 }
      })
    },

    // VOCAL (for choir arrangements)
    choir: {
      name: '🎭 Choir (SATB)',
      section: 'Vocal',
      createSynth: () => new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1.5 }
      })
    }
  }

  // Choir arrangements for multi-part songs
  const choirArrangements = {
    saints: {
      soprano: [
        { note: 'D4', time: 0, duration: '4n' },
        { note: 'G4', time: 0.5, duration: '4n' },
        { note: 'A4', time: 1.0, duration: '4n' },
        { note: 'B4', time: 1.5, duration: '4n' },
        { note: 'D5', time: 2.0, duration: '2n' },
        { note: 'B4', time: 3.0, duration: '2n' },
        { note: 'D4', time: 4.0, duration: '4n' },
        { note: 'G4', time: 4.5, duration: '4n' },
        { note: 'A4', time: 5.0, duration: '4n' },
        { note: 'B4', time: 5.5, duration: '4n' },
        { note: 'D5', time: 6.0, duration: '2n' },
        { note: 'D5', time: 7.0, duration: '2n' },
      ],
      alto: [
        { note: 'B3', time: 0, duration: '4n' },
        { note: 'D4', time: 0.5, duration: '4n' },
        { note: 'E4', time: 1.0, duration: '4n' },
        { note: 'G4', time: 1.5, duration: '4n' },
        { note: 'A4', time: 2.0, duration: '2n' },
        { note: 'G4', time: 3.0, duration: '2n' },
        { note: 'B3', time: 4.0, duration: '4n' },
        { note: 'D4', time: 4.5, duration: '4n' },
        { note: 'E4', time: 5.0, duration: '4n' },
        { note: 'G4', time: 5.5, duration: '4n' },
        { note: 'A4', time: 6.0, duration: '2n' },
        { note: 'A4', time: 7.0, duration: '2n' },
      ],
      tenor: [
        { note: 'G3', time: 0, duration: '4n' },
        { note: 'B3', time: 0.5, duration: '4n' },
        { note: 'C4', time: 1.0, duration: '4n' },
        { note: 'D4', time: 1.5, duration: '4n' },
        { note: 'F#4', time: 2.0, duration: '2n' },
        { note: 'D4', time: 3.0, duration: '2n' },
        { note: 'G3', time: 4.0, duration: '4n' },
        { note: 'B3', time: 4.5, duration: '4n' },
        { note: 'C4', time: 5.0, duration: '4n' },
        { note: 'D4', time: 5.5, duration: '4n' },
        { note: 'F#4', time: 6.0, duration: '2n' },
        { note: 'F#4', time: 7.0, duration: '2n' },
      ],
      bass: [
        { note: 'G2', time: 0, duration: '4n' },
        { note: 'G2', time: 0.5, duration: '4n' },
        { note: 'A2', time: 1.0, duration: '4n' },
        { note: 'G2', time: 1.5, duration: '4n' },
        { note: 'D3', time: 2.0, duration: '2n' },
        { note: 'G2', time: 3.0, duration: '2n' },
        { note: 'G2', time: 4.0, duration: '4n' },
        { note: 'G2', time: 4.5, duration: '4n' },
        { note: 'A2', time: 5.0, duration: '4n' },
        { note: 'G2', time: 5.5, duration: '4n' },
        { note: 'D3', time: 6.0, duration: '2n' },
        { note: 'D3', time: 7.0, duration: '2n' },
      ]
    }
  }

  // Song data
  const builtInSongs = {
    twinkle: {
      title: 'Twinkle Twinkle Little Star',
      melody: [
        // Twinkle, twinkle
        { note: 'C4', time: 0, duration: '4n' },
        { note: 'C4', time: 0.5, duration: '4n' },
        // little star
        { note: 'G4', time: 1.0, duration: '4n' },
        { note: 'G4', time: 1.5, duration: '4n' },
        // How I wonder
        { note: 'A4', time: 2.0, duration: '4n' },
        { note: 'A4', time: 2.5, duration: '4n' },
        // what you are
        { note: 'G4', time: 3.0, duration: '2n' },
        // Up above the
        { note: 'F4', time: 4.0, duration: '4n' },
        { note: 'F4', time: 4.5, duration: '4n' },
        // world so high
        { note: 'E4', time: 5.0, duration: '4n' },
        { note: 'E4', time: 5.5, duration: '4n' },
        // Like a diamond
        { note: 'D4', time: 6.0, duration: '4n' },
        { note: 'D4', time: 6.5, duration: '4n' },
        // in the sky
        { note: 'C4', time: 7.0, duration: '2n' }
      ]
    },
    turkish: {
      title: 'Turkish March (Mozart)',
      melody: [
        { note: 'B4', time: 0, duration: '8n' },
        { note: 'A4', time: 0.125, duration: '8n' },
        { note: 'G#4', time: 0.25, duration: '8n' },
        { note: 'A4', time: 0.375, duration: '8n' },
        { note: 'C5', time: 0.5, duration: '4n' },
        { note: 'A4', time: 0.75, duration: '4n' },
        { note: 'B4', time: 1.0, duration: '8n' },
        { note: 'A4', time: 1.125, duration: '8n' },
        { note: 'G#4', time: 1.25, duration: '8n' },
        { note: 'A4', time: 1.375, duration: '8n' },
        { note: 'C5', time: 1.5, duration: '4n' },
        { note: 'A4', time: 1.75, duration: '4n' },
        { note: 'E5', time: 2.0, duration: '8n' },
        { note: 'D#5', time: 2.125, duration: '8n' },
        { note: 'E5', time: 2.25, duration: '8n' },
        { note: 'D#5', time: 2.375, duration: '8n' },
        { note: 'E5', time: 2.5, duration: '8n' },
        { note: 'B4', time: 2.625, duration: '8n' },
        { note: 'D5', time: 2.75, duration: '8n' },
        { note: 'C5', time: 2.875, duration: '8n' },
        { note: 'A4', time: 3.0, duration: '2n' }
      ]
    },
    saints: {
      title: 'When the Saints Go Marching In (Soprano)',
      melody: [
        // "Oh when the saints"
        { note: 'D4', time: 0, duration: '4n' },
        { note: 'G4', time: 0.5, duration: '4n' },
        { note: 'A4', time: 1.0, duration: '4n' },
        { note: 'B4', time: 1.5, duration: '4n' },
        // "go marching in"
        { note: 'D5', time: 2.0, duration: '2n' },
        { note: 'B4', time: 3.0, duration: '2n' },
        // "Oh when the saints"
        { note: 'D4', time: 4.0, duration: '4n' },
        { note: 'G4', time: 4.5, duration: '4n' },
        { note: 'A4', time: 5.0, duration: '4n' },
        { note: 'B4', time: 5.5, duration: '4n' },
        // "go marching in"
        { note: 'D5', time: 6.0, duration: '2n' },
        { note: 'D5', time: 7.0, duration: '2n' },
      ]
    }
  }

  // Combine built-in songs with uploaded song and imported songs
  const songs = {
    ...builtInSongs,
    ...(uploadedSong || {}),
    ...importedSongs
  }

  // Initialize audio on first interaction
  const initializeAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }

    // Clean up existing part
    if (part) {
      part.dispose()
    }

    // Clean up existing synth if switching instruments
    if (synth) {
      synth.dispose()
    }

    const currentSong = songs[selectedSong as keyof typeof songs]

    if (!currentSong) return

    if (isChoirMode && choirArrangements.saints) {
      // Multi-part choir mode
      const choirSynths: { [key: string]: Tone.Synth } = {}
      const choirParts: Tone.Part[] = []

      // Create synths for each voice with appropriate timbres
      Object.entries(voiceParts).forEach(([voiceName, voiceConfig]) => {
        let voiceSynth: Tone.Synth

        switch (voiceName) {
          case 'soprano':
            voiceSynth = new Tone.Synth({
              oscillator: { type: 'sine' },
              envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1.5 }
            })
            break
          case 'alto':
            voiceSynth = new Tone.Synth({
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.12, decay: 0.25, sustain: 0.75, release: 1.3 }
            })
            break
          case 'tenor':
            voiceSynth = new Tone.Synth({
              oscillator: { type: 'sawtooth', partialCount: 4 },
              envelope: { attack: 0.15, decay: 0.3, sustain: 0.7, release: 1.0 }
            })
            break
          case 'bass':
            voiceSynth = new Tone.Synth({
              oscillator: { type: 'square', partialCount: 2 },
              envelope: { attack: 0.2, decay: 0.4, sustain: 0.6, release: 0.8 }
            })
            break
          default:
            voiceSynth = new Tone.Synth()
        }

        // Apply volume and connect to destination
        const gain = new Tone.Gain(voiceConfig.muted ? 0 : voiceConfig.volume * volume)
        voiceSynth.connect(gain)
        gain.toDestination()

        choirSynths[voiceName] = voiceSynth

        // Create part for this voice with transposition
        const voiceArrangement = choirArrangements.saints[voiceName as keyof typeof choirArrangements.saints]
        const transposedArrangement = voiceArrangement.map(note => ({
          ...note,
          note: transposeNote(note.note, keyTransposition)
        }))
        const voicePart = new Tone.Part((time, note) => {
          const hasSolo = Object.values(voiceParts).some(v => v.solo)
          const shouldPlay = !voiceConfig.muted && (!hasSolo || voiceConfig.solo)

          if (shouldPlay) {
            voiceSynth.triggerAttackRelease(note.note, note.duration, time)
          }
        }, transposedArrangement).start(0)

        choirParts.push(voicePart)
      })

      // Store the first synth as the main synth (for compatibility)
      setSynth(choirSynths.soprano)
      // Store all parts in an array - we'll need to update this to handle multiple parts
      setPart(choirParts[0]) // This is a limitation - we're only storing one part

    } else {
      // Single instrument mode
      const instrumentConfig = instruments[selectedInstrument as keyof typeof instruments]
      const newSynth = instrumentConfig.createSynth().toDestination()
      setSynth(newSynth)

      const transposedMelody = currentSong.melody.map(note => ({
        ...note,
        note: transposeNote(note.note, keyTransposition)
      }))
      const newPart = new Tone.Part((time, note) => {
        newSynth.triggerAttackRelease(note.note, note.duration, time)
      }, transposedMelody).start(0)

      setPart(newPart)
    }

    Tone.Transport.bpm.value = tempo
  }

  const handlePlay = async () => {
    try {
      setIsLoading(true)
      await initializeAudio()

      if (!isPlaying) {
        // Start metronome if enabled
        if (metronomeActive && metronomeClick) {
          new Tone.Loop((time) => {
            metronomeClick.triggerAttackRelease('C6', '32n', time)
          }, '4n').start(0)
        }

        Tone.Transport.start()
        setIsPlaying(true)

        // Auto-stop after duration (unless looping)
        if (!isLooping) {
          setTimeout(() => {
            handleStop()
          }, (duration * 1000) * (120 / tempo))
        } else {
          // Set up looping
          Tone.Transport.loopEnd = `${duration}s`
          Tone.Transport.loop = true
        }
      } else {
        handlePause()
      }
    } catch (error) {
      console.error('Audio error:', error)
      alert('Audio initialization failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = () => {
    Tone.Transport.pause()
    setIsPlaying(false)
  }

  const handleStop = () => {
    Tone.Transport.stop()
    Tone.Transport.loop = false
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo)
    if (synth) {
      Tone.Transport.bpm.rampTo(newTempo, 0.5)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (synth) {
      const db = newVolume === 0 ? -Infinity : Tone.gainToDb(newVolume)
      synth.volume.rampTo(db, 0.1)
    }
  }

  // Update current time during playback
  useEffect(() => {
    let interval: number
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1
          return next >= duration ? 0 : next
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Professional Notation Display */}
      <SimpleNotation
        isPlaying={isPlaying}
        currentTime={currentTime}
        tempo={tempo}
        selectedSong={selectedSong}
        keyTransposition={keyTransposition}
        songData={songs[selectedSong as keyof typeof songs]}
      />

      {/* Audio Controls */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">🎵 Audio Player Controls</h3>
          <p className="text-gray-600 text-sm">
            Watch the notation above as you play the demo melody
          </p>
        </div>

        {/* Song Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Song:
          </label>
          <select
            value={selectedSong}
            onChange={(e) => {
              setSelectedSong(e.target.value)
              if (isPlaying) {
                handleStop()
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {/* Built-in Songs */}
            <optgroup label="Built-in Songs">
              <option value="twinkle">Twinkle Twinkle Little Star</option>
              <option value="turkish">Turkish March (Mozart)</option>
              <option value="saints">When the Saints Go Marching In</option>
            </optgroup>

            {/* Uploaded Songs */}
            {uploadedSong && (
              <optgroup label="Uploaded from Images">
                <option value="uploaded">📤 {uploadedSong.uploaded.title}</option>
              </optgroup>
            )}

            {/* Imported Songs */}
            {Object.keys(importedSongs).length > 0 && (
              <optgroup label="Imported Files">
                {Object.entries(importedSongs).map(([key, song]) => (
                  <option key={key} value={key}>
                    📂 {song.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{currentTime.toFixed(1)}s</span>
            <span>{songs[selectedSong as keyof typeof songs].title}</span>
            <span>{duration}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-semibold transition-colors
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Loading...</span>
              </>
            ) : isPlaying ? (
              <>
                <span>⏸️</span>
                <span>Pause</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span>Play Demo</span>
              </>
            )}
          </button>

          <button
            onClick={handleStop}
            disabled={!isPlaying && currentTime === 0}
            className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏹️ Stop
          </button>
        </div>

        {/* Instrument Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instrument
          </label>
          <select
            value={selectedInstrument}
            onChange={(e) => {
              setSelectedInstrument(e.target.value)
              if (isPlaying) {
                handleStop() // Stop and restart to apply new instrument/choir mode
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {/* Group instruments by orchestra section */}
            {['Strings', 'Woodwinds', 'Brass', 'Percussion', 'Keyboard', 'Vocal'].map(section => (
              <optgroup key={section} label={`${section} Section`}>
                {Object.entries(instruments)
                  .filter(([_, instrument]) => instrument.section === section)
                  .map(([key, instrument]) => (
                    <option key={key} value={key}>{instrument.name}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Interactive Controls */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Loop Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playback Mode
            </label>
            <button
              onClick={() => {
                setIsLooping(!isLooping)
                if (isPlaying) {
                  Tone.Transport.loop = !isLooping
                  if (!isLooping) {
                    Tone.Transport.loopEnd = `${duration}s`
                  }
                }
              }}
              className={`w-full p-2 rounded-lg border font-medium transition-colors ${
                isLooping
                  ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isLooping ? '🔁 Loop Mode' : '▶️ Play Once'}
            </button>
          </div>

          {/* Metronome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metronome
            </label>
            <button
              onClick={() => setShowMetronome(!showMetronome)}
              className={`w-full p-2 rounded-lg border font-medium transition-colors ${
                showMetronome
                  ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {showMetronome ? '⏱️ Hide Beat' : '⏱️ Show Beat'}
            </button>
          </div>
        </div>

        {/* Metronome Indicator */}
        {showMetronome && (
          <div className="mb-6 text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full transition-all duration-100 ${
                isPlaying && (Math.floor(currentTime * 2) % 2 === 0)
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              <span className="text-2xl">♪</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Beat: {Math.floor(currentTime * 2) + 1}
            </p>
          </div>
        )}

        {/* Choir Voice Controls - Only show when choir mode is active */}
        {isChoirMode && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3 text-center">🎭 Choir Voice Controls</h4>
            <div className="space-y-3">
              {Object.entries(voiceParts).map(([voiceName, voice]) => (
                <div key={voiceName} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <span className="capitalize font-medium text-gray-700 min-w-0 w-16">
                      {voiceName === 'soprano' ? '🎤 S' :
                       voiceName === 'alto' ? '🎵 A' :
                       voiceName === 'tenor' ? '🎶 T' : '🎼 B'}
                    </span>

                    {voice.solo && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                        SOLO
                      </span>
                    )}
                    {voice.muted && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">
                        MUTED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const hasSolo = Object.values(voiceParts).some(v => v.solo)
                        setVoiceParts(prev => ({
                          ...prev,
                          [voiceName]: { ...voice, muted: !voice.muted }
                        }))
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        voice.muted
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {voice.muted ? '🔇' : '🔊'}
                    </button>

                    <button
                      onClick={() => {
                        const newSoloState = !voice.solo
                        setVoiceParts(prev => {
                          const updated = { ...prev }
                          if (newSoloState) {
                            // Turn off all other solos
                            Object.keys(updated).forEach(key => {
                              updated[key] = { ...updated[key], solo: key === voiceName }
                            })
                          } else {
                            // Just turn off this solo
                            updated[voiceName] = { ...voice, solo: false }
                          }
                          return updated
                        })
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        voice.solo
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {voice.solo ? 'Solo' : 'Solo'}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voice.volume}
                      onChange={(e) => {
                        setVoiceParts(prev => ({
                          ...prev,
                          [voiceName]: { ...voice, volume: Number(e.target.value) }
                        }))
                      }}
                      className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-2 mt-3">
              <button
                onClick={() => setVoiceParts(prev => {
                  const updated = { ...prev }
                  Object.keys(updated).forEach(key => {
                    updated[key] = { ...updated[key], muted: false, solo: false }
                  })
                  return updated
                })}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
              >
                🎵 All Parts
              </button>
              <button
                onClick={() => setVoiceParts(prev => ({
                  ...prev,
                  soprano: { ...prev.soprano, solo: true },
                  alto: { ...prev.alto, solo: false },
                  tenor: { ...prev.tenor, solo: false },
                  bass: { ...prev.bass, solo: false }
                }))}
                className="px-3 py-1 bg-pink-100 text-pink-700 rounded text-xs hover:bg-pink-200 transition-colors"
              >
                👩‍🎤 Soprano
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Tempo Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo: {tempo} BPM
            </label>
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => handleTempoChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>🔇</span>
              <span>🔊</span>
            </div>
          </div>
        </div>

        {/* Key Transposition & Metronome */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Key Transposition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Signature
            </label>
            <select
              value={keyTransposition}
              onChange={(e) => setKeyTransposition(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>C Major (Original)</option>
              <option value={-5}>G♭ Major</option>
              <option value={2}>D♭ Major</option>
              <option value={-9}>A♭ Major</option>
              <option value={4}>E♭ Major</option>
              <option value={-7}>B♭ Major</option>
              <option value={-6}>F Major</option>
              <option value={7}>G Major</option>
              <option value={-4}>D Major</option>
              <option value={9}>A Major</option>
              <option value={-2}>E Major</option>
              <option value={-11}>B Major</option>
            </select>
          </div>

          {/* Metronome */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Metronome
              </label>
              <button
                onClick={() => setMetronomeActive(!metronomeActive)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  metronomeActive
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {metronomeActive ? '⏸️ ON' : '▶️ OFF'}
              </button>
            </div>
            {metronomeActive && (
              <>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={metronomeVolume}
                  onChange={(e) => setMetronomeVolume(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>🔇 Quiet</span>
                  <span>🔊 Loud</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Import & Export Controls */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📁 Import, Export & Recording</h4>

          {/* Import Section */}
          <div className="mb-4">
            <h5 className="text-xs font-medium text-gray-600 mb-2">Import Music Files</h5>
            <div className="flex flex-wrap gap-2">
              <label className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors cursor-pointer flex items-center gap-1">
                <input
                  type="file"
                  accept=".mid,.midi,.xml,.musicxml"
                  onChange={handleFileImport}
                  className="hidden"
                  disabled={isImporting}
                />
                {isImporting ? '⏳ Importing...' : '📂 Import MIDI/XML'}
              </label>
              {Object.keys(importedSongs).length > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                  {Object.keys(importedSongs).length} imported song{Object.keys(importedSongs).length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Export Section */}
          <div>
            <h5 className="text-xs font-medium text-gray-600 mb-2">Export & Recording</h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportToMIDI}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                🎼 Export MIDI
              </button>
              <button
                onClick={toggleRecording}
                className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isRecording ? '⏹️ Stop Recording' : '⏺️ Record Audio'}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            💡 <strong>Import:</strong> Upload MIDI or MusicXML files to play them • <strong>Export:</strong> Save current song as MIDI or record as audio
          </p>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            {isChoirMode ? (
              <>
                🎭 <strong>4-Part Choir Mode Active!</strong><br />
                Experience traditional SATB harmony. Try soloing different voice parts!
              </>
            ) : (
              <>
                This is what your processed sheet music would sound like!<br />
                <strong>Try "When the Saints Go Marching In" with Choir Mode!</strong>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}