import React from 'react'
import { Loader2, Music } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface ProcessingIndicatorProps {
  progress: number
}

export function ProcessingIndicator({ progress }: ProcessingIndicatorProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-12">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
            <Music className="h-6 w-6 text-primary absolute top-5 left-1/2 transform -translate-x-1/2" />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Processing Your Sheet Music</h3>
            <p className="text-muted-foreground mb-4">
              Our AI is analyzing your sheet music and converting it to digital notation...
            </p>
          </div>

          <div className="w-full max-w-xs mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>🔍 Analyzing image quality...</p>
            <p>🎼 Detecting musical symbols...</p>
            <p>🎵 Converting to digital notation...</p>
            <p>✨ Almost ready!</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              This usually takes 30-60 seconds. Please don't close this page.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}