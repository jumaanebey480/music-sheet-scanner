from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64
import io
from PIL import Image
import numpy as np
from .omr_processor import OMRProcessor
from .config import settings

app = FastAPI(title="Music Sheet OMR Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OMR processor
omr = OMRProcessor()

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "OMR Processing Service"}

@app.post("/api/process")
async def process_sheet_music(file: UploadFile = File(...)):
    """Process uploaded sheet music image"""
    try:
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
            raise HTTPException(400, "Invalid file type. Supported: JPG, PNG, PDF")

        # Check file size (10MB limit)
        file_size = 0
        contents = await file.read()
        file_size = len(contents)

        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(400, "File too large. Maximum size is 10MB")

        # Process the file based on type
        if file.content_type == "application/pdf":
            result = omr.process_pdf(contents, file.filename)
        else:
            result = omr.process_image(contents, file.filename)

        return {
            "status": "success",
            "musicxml": result["musicxml"],
            "midi_data": result["midi_data"],
            "confidence": result["confidence"],
            "staves": result["staves"],
            "message": "Sheet music processed successfully"
        }

    except ValueError as e:
        raise HTTPException(400, f"Processing error: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Internal server error: {str(e)}")

@app.post("/api/process-url")
async def process_from_url(image_url: str):
    """Process sheet music from image URL"""
    try:
        import requests

        # Download image from URL
        response = requests.get(image_url, timeout=30)
        if response.status_code != 200:
            raise HTTPException(400, "Failed to download image from URL")

        # Process the downloaded image
        result = omr.process_image(response.content, "url_image")

        return {
            "status": "success",
            "musicxml": result["musicxml"],
            "midi_data": result["midi_data"],
            "confidence": result["confidence"],
            "staves": result["staves"],
            "message": "Sheet music processed successfully"
        }

    except Exception as e:
        raise HTTPException(500, f"Error processing URL: {str(e)}")

@app.get("/api/demo")
def get_demo_data():
    """Get demo/sample OMR result for testing"""
    return omr.get_demo_result()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )