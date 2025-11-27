import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Settings
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8000))

    # File Processing Settings
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10 * 1024 * 1024))  # 10MB
    ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"]
    ALLOWED_FILE_TYPES = ALLOWED_IMAGE_TYPES + ["application/pdf"]

    # OMR Settings
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.7))

    # Development Settings
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

settings = Settings()