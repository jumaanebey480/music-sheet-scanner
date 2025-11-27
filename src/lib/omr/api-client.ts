import axios from 'axios'
import { OMRResponse } from '../../types'

const OMR_API_URL = import.meta.env.VITE_OMR_API_URL || 'http://localhost:8000'

const omrApi = axios.create({
  baseURL: OMR_API_URL,
  timeout: 60000, // 60 seconds timeout for processing
})

export class OMRApiClient {
  static async processImage(file: File): Promise<OMRResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await omrApi.post('/api/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Failed to process sheet music'
        )
      }
      throw new Error('An unexpected error occurred while processing the image')
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await omrApi.get('/api/health')
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  static async processWithRetry(file: File, maxRetries = 3): Promise<OMRResponse> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.processImage(file)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}

// Mock OMR response for development when service is not available
export const mockOMRResponse = (filename: string): OMRResponse => ({
  status: 'success',
  musicxml: `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`,
  midi_data: 'TVRoZAAAAAYAAAABAQBgTVRyawAAABkA/y8A/1gEBAIYCJgAwCAAhAAQgMAAAA==', // Base64 encoded simple MIDI
  confidence: 0.85,
  staves: [
    {
      id: 1,
      name: 'Treble',
      clef: 'G',
      instrument: 'Piano',
    }
  ]
})

export default OMRApiClient