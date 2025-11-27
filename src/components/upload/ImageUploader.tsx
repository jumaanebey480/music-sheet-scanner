import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, File } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { useUpload } from '../../hooks/useUpload'
import { ImagePreview } from './ImagePreview'
import { ProcessingIndicator } from './ProcessingIndicator'

interface ImageUploaderProps {
  onUploadComplete?: (uploadId: string) => void
}

export function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const { file, preview, uploading, progress, error, setFile, uploadFile, resetUpload, canUpload } = useUpload()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [setFile])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: true,
    noKeyboard: true,
  })

  const handleUpload = async () => {
    const result = await uploadFile()
    if (result && onUploadComplete) {
      onUploadComplete(result.id)
    }
  }

  if (uploading) {
    return <ProcessingIndicator progress={progress} />
  }

  if (file && preview) {
    return (
      <ImagePreview
        file={file}
        preview={preview}
        onRemove={resetUpload}
        onUpload={handleUpload}
        canUpload={canUpload}
        error={error}
      />
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            {isDragActive ? (
              <>
                <Upload className="h-16 w-16 text-primary mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-primary">Drop your sheet music here!</h3>
                  <p className="text-muted-foreground">Release to upload</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center space-x-4 mb-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <File className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upload Sheet Music</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your sheet music here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Supported formats: JPG, PNG, PDF (max 10MB)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={open} className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                  </Button>
                  <Button variant="outline" onClick={open} className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Take Photo</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <h4 className="text-sm font-semibold mb-2">Tips for best results:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use good lighting and avoid shadows</li>
            <li>• Keep the camera steady and sheet music flat</li>
            <li>• Make sure all notes and symbols are clearly visible</li>
            <li>• PDF uploads typically provide more accurate results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}