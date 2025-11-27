import React from 'react'
import { X, Upload, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter } from '../ui/card'
import { formatFileSize } from '../../lib/utils'

interface ImagePreviewProps {
  file: File
  preview: string | null
  onRemove: () => void
  onUpload: () => void
  canUpload: boolean
  error: string | null
}

export function ImagePreview({ file, preview, onRemove, onUpload, canUpload, error }: ImagePreviewProps) {
  const isImage = file.type.startsWith('image/')
  const isPdf = file.type === 'application/pdf'

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="relative">
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {isImage && preview ? (
              <img
                src={preview}
                alt="Sheet music preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : isPdf ? (
              <div className="text-center">
                <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">PDF Document</p>
                <p className="text-sm text-muted-foreground">Ready for processing</p>
              </div>
            ) : (
              <div className="text-center">
                <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">File Selected</p>
                <p className="text-sm text-muted-foreground">Ready for processing</p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filename:</span>
              <span className="text-sm text-muted-foreground truncate max-w-xs">{file.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">File size:</span>
              <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm text-muted-foreground">
                {isPdf ? 'PDF Document' : isImage ? 'Image' : 'Document'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onRemove}>
          Choose Different File
        </Button>
        <Button onClick={onUpload} disabled={!canUpload} className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Upload & Process</span>
        </Button>
      </CardFooter>
    </Card>
  )
}