import { useEffect, useState, useMemo } from 'react'

interface Note {
  note: string
  time: number
  duration: string
  displayName: string
  position: number // staff position (0-6, where 0 is top line)
}

interface SimpleNotationProps {
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

export function SimpleNotation({ isPlaying, currentTime, tempo, selectedSong, keyTransposition, songData }: SimpleNotationProps) {
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1)

  // Get key signature information
  const getKeySignature = (transposition: number) => {
    const keySignatures: { [key: string]: { sharps: string[], flats: string[], name: string } } = {
      '0': { sharps: [], flats: [], name: 'C Major' }, // C Major
      '-5': { sharps: [], flats: ['B', 'E', 'A', 'D', 'G', 'C'], name: 'G♭ Major' }, // G♭ Major
      '2': { sharps: [], flats: ['B', 'E', 'A', 'D', 'G'], name: 'D♭ Major' }, // D♭ Major
      '-9': { sharps: [], flats: ['B', 'E', 'A', 'D'], name: 'A♭ Major' }, // A♭ Major
      '4': { sharps: [], flats: ['B', 'E', 'A'], name: 'E♭ Major' }, // E♭ Major
      '-7': { sharps: [], flats: ['B', 'E'], name: 'B♭ Major' }, // B♭ Major
      '-6': { sharps: [], flats: ['B'], name: 'F Major' }, // F Major
      '7': { sharps: ['F'], flats: [], name: 'G Major' }, // G Major
      '-4': { sharps: ['F', 'C'], flats: [], name: 'D Major' }, // D Major
      '9': { sharps: ['F', 'C', 'G'], flats: [], name: 'A Major' }, // A Major
      '-2': { sharps: ['F', 'C', 'G', 'D'], flats: [], name: 'E Major' }, // E Major
      '-11': { sharps: ['F', 'C', 'G', 'D', 'A'], flats: [], name: 'B Major' } // B Major
    }
    return keySignatures[transposition.toString()] || { sharps: [], flats: [], name: 'C Major' }
  }

  const keySignature = getKeySignature(keyTransposition)

  // Debug logging
  console.log('Key signature debug:', {
    keyTransposition,
    keySignatureName: keySignature.name,
    sharps: keySignature.sharps,
    flats: keySignature.flats
  })

  // Apply key signature to note display
  const applyKeySignature = (noteName: string) => {
    const baseNote = noteName.replace(/[0-9#♯♭]/g, '')

    if (keySignature.sharps.includes(baseNote)) {
      return baseNote + '♯'
    } else if (keySignature.flats.includes(baseNote)) {
      return baseNote + '♭'
    }
    return baseNote
  }

  // Convert song data to notation format
  const getStaffPosition = (note: string): number => {
    // Standard treble clef staff positioning
    // Staff lines from top to bottom: F5(0), D5(1), B4(2), G4(3), E4(4)
    // Position 0 = F5 line, Position 4 = E4 line, Position 6 = C4 (ledger line below)
    const notePositions: { [key: string]: number } = {
      // Notes below staff
      'C4': 6,    // First ledger line below staff
      'D4': 5.5,  // Space below staff

      // Notes on staff
      'E4': 4,    // Bottom line of staff
      'F4': 3.5,  // Space above E line
      'G4': 3,    // Second line from bottom
      'A4': 2.5,  // Space above G line
      'B4': 2,    // Middle line of staff
      'C5': 1.5,  // Space above B line
      'D5': 1,    // Second line from top
      'E5': 0.5,  // Space above D line
      'F5': 0,    // Top line of staff

      // Notes above staff
      'G5': -0.5, // Space above staff
      'A5': -1,   // First ledger line above staff

      // Sharps/flats - positioned between their natural notes
      'G#4': 2.75, // Between G4 and A4
      'A#4': 2.25, // Between A4 and B4
      'D#5': 0.75  // Between D5 and E5
    }
    return notePositions[note] ?? 3
  }

  const melody: Note[] = useMemo(() => songData.melody.map((note, index) => ({
    note: note.note,
    time: typeof note.time === 'string' ? parseFloat(note.time) : note.time,
    duration: note.duration,
    displayName: note.note.replace(/[0-9]/g, '').replace('#', '♯'),
    position: getStaffPosition(note.note)
  })), [songData])

  // Update current note based on playback time
  useEffect(() => {
    if (isPlaying) {
      // Adjust timing based on tempo (120 BPM = 0.5 seconds per beat)
      const adjustedTime = currentTime * (tempo / 120)

      const noteIndex = melody.findIndex((note, index) => {
        const nextNote = melody[index + 1]
        return adjustedTime >= note.time && (!nextNote || adjustedTime < nextNote.time)
      })

      setCurrentNoteIndex(noteIndex)
    } else {
      setCurrentNoteIndex(-1)
    }
  }, [currentTime, isPlaying, tempo, selectedSong, melody])

  // Memoize beaming calculation for eighth notes
  const beamingData = useMemo(() => {
    const beams = []
    let beamStart = -1
    let beamNotes = []
    const maxBeamGroupSize = 4 // Maximum notes in a beam group

    melody.forEach((note, index) => {
      if (note.duration === '8n') {
        if (beamStart === -1) {
          // Start a new beam group
          beamStart = index
          beamNotes = [index]
        } else {
          // Continue the beam group, but check if we should end it
          beamNotes.push(index)

          // End beam group if we reach max size or if it's a good musical break point
          if (beamNotes.length >= maxBeamGroupSize) {
            beams.push({
              startIndex: beamStart,
              endIndex: beamNotes[beamNotes.length - 1],
              noteIndices: [...beamNotes]
            })
            beamStart = -1
            beamNotes = []
          }
        }
      } else {
        // End current beam group if it exists and has 2+ notes
        if (beamStart !== -1 && beamNotes.length >= 2) {
          beams.push({
            startIndex: beamStart,
            endIndex: beamNotes[beamNotes.length - 1],
            noteIndices: [...beamNotes]
          })
        }
        beamStart = -1
        beamNotes = []
      }
    })

    // Handle beam group at end of melody
    if (beamStart !== -1 && beamNotes.length >= 2) {
      beams.push({
        startIndex: beamStart,
        endIndex: beamNotes[beamNotes.length - 1],
        noteIndices: [...beamNotes]
      })
    }

    return beams
  }, [melody])

  // Memoize bar lines calculation
  const barLinesData = useMemo(() => {
    const getSpacing = (duration: string) => {
      switch (duration) {
        case '8n': return 22
        case '4n': return 45
        case '2n': return 90
        default: return 45
      }
    }

    const barLines = []
    let currentX = 100
    let currentBeats = 0
    const beatsPerBar = 4

    melody.forEach((note, index) => {
      const beatValue = note.duration === '2n' ? 2 : note.duration === '4n' ? 1 : 0.5

      // Add bar line BEFORE adding the note spacing if we've completed 4 beats
      if (currentBeats >= beatsPerBar && index < melody.length - 1) {
        barLines.push({
          x: currentX - (getSpacing(note.duration) / 2), // Position bar line between notes
          key: `bar-${barLines.length}`
        })
        currentBeats = beatValue // Reset to current note's beat value
      } else {
        currentBeats += beatValue
      }

      currentX += getSpacing(note.duration)
    })

    const finalX = 100 + melody.reduce((acc, note) => acc + getSpacing(note.duration), 0) + 15

    return { barLines, finalX }
  }, [melody])

  // Calculate cursor position based on continuous time
  const getCursorPosition = () => {
    if (!isPlaying) return 100

    const adjustedTime = currentTime * (tempo / 120)
    const totalDuration = 8 // Total song duration in beats
    const progress = Math.min(adjustedTime / totalDuration, 1)

    // Calculate total width of notation
    const getSpacing = (duration: string) => {
      switch (duration) {
        case '8n': return 22  // eighth notes
        case '4n': return 45  // quarter notes
        case '2n': return 90  // half notes
        default: return 45
      }
    }

    const totalWidth = melody.reduce((acc, note) => {
      return acc + getSpacing(note.duration)
    }, 0)

    return 100 + (progress * totalWidth)
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800">🎼 Musical Notation</h4>
        <p className="text-sm text-gray-600">Watch the notes highlight as they play</p>
        {keyTransposition !== 0 && (
          <p className="text-xs text-blue-600 mt-1">
            Key: {keySignature.name} ({keySignature.sharps.length > 0 ? `${keySignature.sharps.length} sharps` : `${keySignature.flats.length} flats`})
          </p>
        )}
      </div>

      {/* Staff Lines */}
      <div className="relative bg-white p-4 rounded border-2 border-gray-100">
        <svg key={selectedSong} viewBox="0 0 800 200" className="w-full h-32">
          {/* Staff lines */}
          {[0, 1, 2, 3, 4].map(line => (
            <line
              key={line}
              x1="50"
              y1={50 + line * 20}
              x2="750"
              y2={50 + line * 20}
              stroke="#374151"
              strokeWidth="1"
            />
          ))}

          {/* Treble clef symbol */}
          <text
            x="20"
            y="90"
            fontSize="40"
            fill="#374151"
            fontFamily="serif"
          >
            𝄞
          </text>

          {/* Key signature - Debug: keyTransposition={keyTransposition}, sharps={keySignature.sharps.length}, flats={keySignature.flats.length} */}
          {keySignature.sharps.length > 0 && keySignature.sharps.map((sharp, index) => {
            const sharpPositions: { [key: string]: number } = {
              'F': 80, // F4 sharp position (between E and G lines)
              'C': 60, // C5 sharp position (above D line)
              'G': 100, // G4 sharp position (on G line)
              'D': 70, // D5 sharp position (on D line)
              'A': 50 // A4 sharp position (between A and B)
            }
            return (
              <text
                key={`sharp-${index}`}
                x={50 + (index * 10)}
                y={sharpPositions[sharp] || 90}
                fontSize="24"
                fill="#ef4444"
                fontFamily="serif"
                textAnchor="middle"
                fontWeight="bold"
              >
                #
              </text>
            )
          })}
          {(keySignature.flats.length > 0 || keyTransposition === -6) && keySignature.flats.map((flat, index) => {
            const flatPositions: { [key: string]: number } = {
              'B': 70, // B4 flat position (on B line)
              'E': 110, // E4 flat position (on E line)
              'A': 50, // A4 flat position (between lines)
              'D': 90, // D5 flat position (on D line)
              'G': 40, // G5 flat position (above staff)
              'C': 80 // C5 flat position (above B line)
            }
            return (
              <text
                key={`flat-${index}`}
                x={50 + (index * 10)}
                y={flatPositions[flat] || 90}
                fontSize="24"
                fill="#ef4444"
                fontFamily="serif"
                textAnchor="middle"
                fontWeight="bold"
              >
                b
              </text>
            )
          })}

          {/* Time signature (4/4) - positioned after key signature */}
          <text
            x={90 + (Math.max(keySignature.sharps.length, keySignature.flats.length) * 12)}
            y="75"
            fontSize="20"
            fill="#374151"
            fontFamily="serif"
            textAnchor="middle"
          >
            4
          </text>
          <text
            x={90 + (Math.max(keySignature.sharps.length, keySignature.flats.length) * 12)}
            y="105"
            fontSize="20"
            fill="#374151"
            fontFamily="serif"
            textAnchor="middle"
          >
            4
          </text>

          {/* Dynamic Bar lines */}
          {barLinesData.barLines.map(barLine => (
            <line
              key={barLine.key}
              x1={barLine.x}
              y1="50"
              x2={barLine.x}
              y2="130"
              stroke="#374151"
              strokeWidth="2"
            />
          ))}

          {/* Final double bar line */}
          <g>
            <line
              x1={barLinesData.finalX}
              y1="50"
              x2={barLinesData.finalX}
              y2="130"
              stroke="#374151"
              strokeWidth="2"
            />
            <line
              x1={barLinesData.finalX + 5}
              y1="50"
              x2={barLinesData.finalX + 5}
              y2="130"
              stroke="#374151"
              strokeWidth="3"
            />
          </g>

          {/* Notes */}
          {melody.map((note, index) => {
            // Better spacing based on duration
            const getSpacing = (duration: string) => {
              switch (duration) {
                case '8n': return 22  // eighth notes
                case '4n': return 45  // quarter notes
                case '2n': return 90  // half notes
                default: return 45
              }
            }

            const x = 100 + (melody.slice(0, index).reduce((acc, n) => {
              return acc + getSpacing(n.duration)
            }, 0))

            // Accurate staff positioning (10px per half-space)
            const y = 50 + (note.position * 10)
            const isActive = currentNoteIndex === index
            const isPast = currentNoteIndex > index
            const isHalfNote = note.duration === '2n'

            return (
              <g key={index}>
                {/* Ledger lines for notes above/below staff */}
                {note.position === 6 && ( // C4 ledger line
                  <line
                    x1={x - 12}
                    y1={y}
                    x2={x + 12}
                    y2={y}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                )}
                {note.position <= -1 && ( // Above staff ledger lines (A5 and higher)
                  <line
                    x1={x - 12}
                    y1={50 + (-1 * 10)} // A5 ledger line
                    x2={x + 12}
                    y2={50 + (-1 * 10)}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                )}

                {/* Note head - filled for quarter notes, hollow for half notes */}
                <ellipse
                  cx={x}
                  cy={y}
                  rx="8"
                  ry="6"
                  fill={
                    isHalfNote
                      ? 'white'
                      : (isActive ? '#ef4444' : '#374151')
                  }
                  stroke={
                    isActive
                      ? '#dc2626'
                      : '#1f2937'
                  }
                  strokeWidth="2"
                  className={isActive ? 'animate-pulse' : ''}
                />

                {/* Note stem - direction based on position on staff */}
                {/* Only show individual stems for non-beamed eighth notes */}
                {!(note.duration === '8n' && beamingData.some(beam => beam.noteIndices.includes(index))) && (
                  note.position <= 2.5 ? (
                    // High notes: stem goes down on left
                    <line
                      x1={x - 7}
                      y1={y}
                      x2={x - 7}
                      y2={y + 35}
                      stroke={
                        isActive
                          ? '#dc2626'
                          : '#374151'
                      }
                      strokeWidth="2"
                    />
                  ) : (
                    // Low notes: stem goes up on right
                    <line
                      x1={x + 7}
                      y1={y}
                      x2={x + 7}
                      y2={y - 35}
                      stroke={
                        isActive
                          ? '#dc2626'
                          : '#374151'
                      }
                      strokeWidth="2"
                    />
                  )
                )}

                {/* Note name below */}
                <text
                  x={x}
                  y={y + 45}
                  fontSize="10"
                  fill={
                    isActive
                      ? '#ef4444'
                      : '#6b7280'
                  }
                  textAnchor="middle"
                  fontWeight={isActive ? 'bold' : 'normal'}
                >
                  {note.displayName}
                </text>

              </g>
            )
          })}

          {/* Beams for eighth notes */}
          {beamingData.map((beam, beamIndex) => {
            const getSpacing = (duration: string) => {
              switch (duration) {
                case '8n': return 22
                case '4n': return 45
                case '2n': return 90
                default: return 45
              }
            }

            // Calculate positions for beam start and end
            const startX = 100 + (melody.slice(0, beam.startIndex).reduce((acc, n) => {
              return acc + getSpacing(n.duration)
            }, 0))
            const endX = 100 + (melody.slice(0, beam.endIndex + 1).reduce((acc, n) => {
              return acc + getSpacing(n.duration)
            }, 0)) - getSpacing(melody[beam.endIndex].duration)

            // Determine beam direction based on average note position
            const avgPosition = beam.noteIndices.reduce((sum, idx) => sum + melody[idx].position, 0) / beam.noteIndices.length
            const stemsUp = avgPosition > 2.5

            // Calculate beam Y positions
            const startY = 50 + (melody[beam.startIndex].position * 10) + (stemsUp ? -35 : 35)
            const endY = 50 + (melody[beam.endIndex].position * 10) + (stemsUp ? -35 : 35)

            return (
              <g key={`beam-${beamIndex}`}>
                {/* Individual stems for beamed notes */}
                {beam.noteIndices.map(noteIdx => {
                  const noteX = 100 + (melody.slice(0, noteIdx).reduce((acc, n) => {
                    return acc + getSpacing(n.duration)
                  }, 0))
                  const noteY = 50 + (melody[noteIdx].position * 10)
                  const isActive = currentNoteIndex === noteIdx

                  return (
                    <line
                      key={`stem-${noteIdx}`}
                      x1={stemsUp ? noteX + 7 : noteX - 7}
                      y1={noteY}
                      x2={stemsUp ? noteX + 7 : noteX - 7}
                      y2={stemsUp ? noteY - 35 : noteY + 35}
                      stroke={isActive ? '#dc2626' : '#374151'}
                      strokeWidth="2"
                    />
                  )
                })}

                {/* Beam connecting the notes */}
                <line
                  x1={stemsUp ? startX + 7 : startX - 7}
                  y1={startY}
                  x2={stemsUp ? endX + 7 : endX - 7}
                  y2={endY}
                  stroke="#374151"
                  strokeWidth="3"
                />
              </g>
            )
          })}

          {/* Playback cursor */}
          {isPlaying && (
            <line
              x1={getCursorPosition()}
              y1="20"
              x2={getCursorPosition()}
              y2="180"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.7"
              style={{
                transition: 'none' // Smooth movement without CSS transitions
              }}
            />
          )}
        </svg>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span>Notes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>Playing Now</span>
          </div>
        </div>
      </div>

      {/* Song info */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
          <span className="text-blue-600 font-medium text-sm">
            🎵 {songData.title}
          </span>
          {isPlaying && (
            <span className="text-blue-500 text-xs">
              Note {currentNoteIndex + 1} of {melody.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}