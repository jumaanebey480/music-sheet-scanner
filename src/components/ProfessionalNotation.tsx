import { useEffect, useRef, useState } from 'react'
import Vex from 'vexflow'

const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Accidental } = Vex.Flow

interface ProfessionalNotationProps {
  isPlaying: boolean
  currentTime: number
  tempo: number
  selectedSong: string
  keyTransposition: number
  songData: {
    title: string
    melody: Array<{ note: string; time: number | string; duration: string }>
  }
}

export function ProfessionalNotation({
  isPlaying,
  currentTime,
  tempo,
  selectedSong,
  keyTransposition,
  songData
}: ProfessionalNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<any>(null)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1)
  const [vexNotes, setVexNotes] = useState<any[]>([])

  // Get key signature information
  const getKeySignature = (transposition: number) => {
    const keySignatures: { [key: number]: string } = {
      0: 'C',    // C Major
      -5: 'Gb',  // G♭ Major (6 flats)
      2: 'Db',   // D♭ Major (5 flats)
      -9: 'Ab',  // A♭ Major (4 flats)
      4: 'Eb',   // E♭ Major (3 flats)
      -7: 'Bb',  // B♭ Major (2 flats)
      -6: 'F',   // F Major (1 flat)
      7: 'G',    // G Major (1 sharp)
      -4: 'D',   // D Major (2 sharps)
      9: 'A',    // A Major (3 sharps)
      -2: 'E',   // E Major (4 sharps)
      -11: 'B'   // B Major (5 sharps)
    }
    return keySignatures[transposition] || 'C'
  }

  // Convert Tone.js duration to VexFlow duration
  const convertDuration = (toneDuration: string) => {
    const durationMap: { [key: string]: string } = {
      '1n': 'w',   // whole note
      '2n': 'h',   // half note
      '4n': 'q',   // quarter note
      '8n': '8',   // eighth note
      '16n': '16'  // sixteenth note
    }
    return durationMap[toneDuration] || 'q'
  }

  // Convert note name to VexFlow format
  const convertNoteToVexFlow = (noteName: string, duration: string) => {
    // Extract note and octave
    const match = noteName.match(/([A-G])(#|b)?(\d)/)
    if (!match) return { keys: ['c/4'], duration: 'q' }

    const [, note, accidental, octave] = match
    const vexDuration = convertDuration(duration)

    // VexFlow format: note/octave
    const vexNote = `${note.toLowerCase()}${accidental || ''}/${octave}`

    return {
      keys: [vexNote],
      duration: vexDuration
    }
  }

  // Create and render the notation
  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous content
    containerRef.current.innerHTML = ''

    // Calculate width based on number of notes
    const notesCount = songData.melody.length
    const width = Math.max(800, notesCount * 100)
    const height = 300

    try {
      // Create renderer
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG)
      renderer.resize(width, height)
      rendererRef.current = renderer

      const context = renderer.getContext()
      context.setFont('Arial', 10)

      // Create main stave
      const stave = new Stave(10, 40, width - 20)

      // Add clef, time signature, and key signature
      stave.addClef('treble')
      stave.addTimeSignature('4/4')

      const keySignature = getKeySignature(keyTransposition)
      if (keySignature !== 'C') {
        stave.addKeySignature(keySignature)
      }

      stave.setContext(context).draw()

      // Convert melody to VexFlow notes
      const notes: any[] = []
      songData.melody.forEach((note, index) => {
        const { keys, duration } = convertNoteToVexFlow(note.note, note.duration)

        const staveNote = new StaveNote({
          keys,
          duration,
          clef: 'treble'
        })

        // Add accidentals if needed
        const noteMatch = note.note.match(/([A-G])(#|b)?/)
        if (noteMatch && noteMatch[2]) {
          const accidentalType = noteMatch[2] === '#' ? '#' : 'b'
          staveNote.addModifier(new Accidental(accidentalType), 0)
        }

        notes.push(staveNote)
      })

      setVexNotes(notes)

      // Create beams for eighth notes
      const beamGroups: any[] = []
      let currentBeam: any[] = []

      notes.forEach((note, index) => {
        if (note.duration === '8') {
          currentBeam.push(note)
        } else {
          if (currentBeam.length >= 2) {
            beamGroups.push(new Beam(currentBeam))
          }
          currentBeam = []
        }
      })

      // Handle last beam group
      if (currentBeam.length >= 2) {
        beamGroups.push(new Beam(currentBeam))
      }

      // Create voice and format
      const voice = new Voice({
        num_beats: Math.ceil(notes.length / 4) * 4,
        beat_value: 4
      })
      voice.addTickables(notes)

      // Format and draw
      const formatter = new Formatter()
      formatter.joinVoices([voice]).format([voice], width - 100)

      // Draw notes
      voice.draw(context, stave)

      // Draw beams
      beamGroups.forEach(beam => beam.setContext(context).draw())

      // Add title
      context.setFont('Arial', 16, 'bold')
      context.fillText(songData.title, width / 2 - 100, 25)

    } catch (error) {
      console.error('VexFlow rendering error:', error)
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current = null
      }
    }
  }, [songData, selectedSong, keyTransposition])

  // Highlight current note during playback
  useEffect(() => {
    if (!isPlaying || vexNotes.length === 0) {
      setCurrentNoteIndex(-1)
      return
    }

    const adjustedTime = currentTime * (tempo / 120)

    const noteIndex = songData.melody.findIndex((note, index) => {
      const noteTime = typeof note.time === 'string' ? parseFloat(note.time) : note.time
      const nextNote = songData.melody[index + 1]
      const nextTime = nextNote ? (typeof nextNote.time === 'string' ? parseFloat(nextNote.time) : nextNote.time) : Infinity

      return adjustedTime >= noteTime && adjustedTime < nextTime
    })

    setCurrentNoteIndex(noteIndex)

    // Highlight the current note in the SVG
    if (containerRef.current && noteIndex >= 0 && noteIndex < vexNotes.length) {
      const svgElement = containerRef.current.querySelector('svg')
      if (svgElement) {
        // Remove previous highlights
        svgElement.querySelectorAll('.vf-stavenote').forEach((el, idx) => {
          if (idx === noteIndex) {
            el.setAttribute('fill', '#ef4444')
            el.setAttribute('stroke', '#ef4444')
          } else {
            el.setAttribute('fill', '#000000')
            el.setAttribute('stroke', '#000000')
          }
        })
      }
    }
  }, [currentTime, isPlaying, tempo, vexNotes, songData])

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
      <div className="text-center mb-4">
        <h4 className="text-xl font-bold text-gray-900 mb-1">
          🎼 Professional Music Notation
        </h4>
        <p className="text-sm text-gray-600">
          High-quality sheet music rendering powered by VexFlow
        </p>
        {keyTransposition !== 0 && (
          <p className="text-xs text-blue-600 mt-2">
            Key: {getKeySignature(keyTransposition)} Major
          </p>
        )}
      </div>

      {/* Notation Container */}
      <div className="bg-white border-2 border-gray-100 rounded-lg p-6 overflow-x-auto">
        <div
          ref={containerRef}
          className="min-w-full"
          style={{
            fontFamily: 'Arial, sans-serif',
            minHeight: '300px'
          }}
        />
      </div>

      {/* Controls and Info */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span className="text-gray-700">Note</span>
          </div>
          {isPlaying && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">
                Playing: {currentNoteIndex + 1} / {songData.melody.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (containerRef.current) {
                const svg = containerRef.current.querySelector('svg')
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg)
                  const blob = new Blob([svgData], { type: 'image/svg+xml' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `${songData.title.replace(/\s+/g, '_')}.svg`
                  link.click()
                  URL.revokeObjectURL(url)
                }
              }
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
          >
            📄 Export SVG
          </button>
          <button
            onClick={() => {
              if (containerRef.current) {
                const svg = containerRef.current.querySelector('svg')
                if (svg) {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  const svgData = new XMLSerializer().serializeToString(svg)
                  const img = new Image()
                  img.onload = () => {
                    canvas.width = img.width
                    canvas.height = img.height
                    ctx?.drawImage(img, 0, 0)
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `${songData.title.replace(/\s+/g, '_')}.png`
                        link.click()
                        URL.revokeObjectURL(url)
                      }
                    })
                  }
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
                }
              }
            }}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
          >
            🖼️ Export PNG
          </button>
        </div>
      </div>

      {/* Professional Features Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800 text-center">
          ✨ <strong>Professional Features:</strong> Automatic beaming • Proper spacing • Key signatures • Accidentals • Exportable as SVG/PNG
        </p>
      </div>
    </div>
  )
}
