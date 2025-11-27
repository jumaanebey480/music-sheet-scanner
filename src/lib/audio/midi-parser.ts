import { Midi } from '@tonejs/midi'
import type { AudioNote, MidiData, MidiTrack } from '../../types'
import { midiNoteToName } from '../utils'

export class MidiParser {
  static parseMidiData(midiBase64: string): MidiData {
    try {
      // Convert base64 to array buffer
      const binaryString = atob(midiBase64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Parse MIDI using Tone.js MIDI
      const midi = new Midi(bytes)

      const tracks: MidiTrack[] = midi.tracks.map((track, index) => ({
        name: track.name || `Track ${index + 1}`,
        instrument: track.instrument?.number || 0,
        notes: track.notes.map(note => ({
          pitch: midiNoteToName(note.midi),
          duration: note.duration,
          velocity: note.velocity,
          startTime: note.time,
          staff: index + 1,
        })),
      }))

      return {
        tracks,
        ticksPerBeat: (midi.header as any).ticksPerBeat || 480,
        format: (midi.header as any).type || 1,
      }
    } catch (error) {
      throw new Error('Failed to parse MIDI data: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  static parseToAudioNotes(midiData: MidiData): AudioNote[] {
    const allNotes: AudioNote[] = []

    midiData.tracks.forEach(track => {
      allNotes.push(...track.notes)
    })

    // Sort by start time for proper playback order
    return allNotes.sort((a, b) => a.startTime - b.startTime)
  }

  static parseMusicXMLToNotes(musicXML: string): AudioNote[] {
    // Basic MusicXML to notes conversion
    // This is a simplified implementation - in a real app you'd use a proper MusicXML parser
    const notes: AudioNote[] = []

    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(musicXML, 'text/xml')

      // Find all note elements
      const noteElements = xmlDoc.querySelectorAll('note')
      let currentTime = 0

      noteElements.forEach((noteEl) => {
        const pitchEl = noteEl.querySelector('pitch')
        const durationEl = noteEl.querySelector('duration')
        const typeEl = noteEl.querySelector('type')

        if (pitchEl && durationEl) {
          const step = pitchEl.querySelector('step')?.textContent || 'C'
          const octave = pitchEl.querySelector('octave')?.textContent || '4'
          const alter = pitchEl.querySelector('alter')?.textContent || '0'

          // Convert to pitch name
          let pitch = `${step}${octave}`
          if (alter === '1') pitch = `${step}#${octave}`
          if (alter === '-1') pitch = `${step}b${octave}`

          const duration = parseFloat(durationEl.textContent || '1') * 0.25 // Convert to seconds (assuming 4/4 time)

          notes.push({
            pitch,
            duration,
            velocity: 0.8,
            startTime: currentTime,
            staff: 1,
          })

          currentTime += duration
        }
      })

      return notes
    } catch (error) {
      console.error('Failed to parse MusicXML:', error)
      // Return a simple scale as fallback
      return this.createFallbackNotes()
    }
  }

  static createFallbackNotes(): AudioNote[] {
    // Create a simple C major scale for testing
    const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']

    return scale.map((pitch, index) => ({
      pitch,
      duration: 0.5,
      velocity: 0.8,
      startTime: index * 0.5,
      staff: 1,
    }))
  }

  static createDemoNotes(): AudioNote[] {
    // Create a more musical demo melody
    const melody = [
      { pitch: 'C4', duration: 0.5 },
      { pitch: 'D4', duration: 0.5 },
      { pitch: 'E4', duration: 0.5 },
      { pitch: 'F4', duration: 0.5 },
      { pitch: 'G4', duration: 1.0 },
      { pitch: 'G4', duration: 1.0 },
      { pitch: 'A4', duration: 0.5 },
      { pitch: 'A4', duration: 0.5 },
      { pitch: 'A4', duration: 0.5 },
      { pitch: 'A4', duration: 0.5 },
      { pitch: 'G4', duration: 2.0 },
    ]

    let currentTime = 0
    return melody.map(({ pitch, duration }) => {
      const note: AudioNote = {
        pitch,
        duration,
        velocity: 0.8,
        startTime: currentTime,
        staff: 1,
      }
      currentTime += duration
      return note
    })
  }
}

export default MidiParser