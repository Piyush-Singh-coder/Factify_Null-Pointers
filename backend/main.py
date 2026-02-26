from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
import yt_dlp
import os
import re
import json
from openai import OpenAI
from dotenv import load_dotenv
import uuid
from datetime import datetime
import base64
import tempfile
import shutil

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Multimodal RAG + Video Verification API v2 (OpenAI)",
    description="Combined API for video verification and multimodal RAG with PDFs, images, and audio - All powered by OpenAI",
    version="2.0.2" # Incremented version for fixes
)

# --- Configuration ---
# Use environment variables or fallbacks
CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN_URL", "http://localhost:5173")
origins = [CLIENT_ORIGIN]

if CLIENT_ORIGIN == "*":
    print("Warning: CORS is set to allow all origins ('*'). This is insecure for production.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize OpenAI client
try:
    openai_client = OpenAI()
except Exception as e:
    print(f"Warning: OpenAI client initialization failed: {e}")
    openai_client = None

# --- Model Configuration ---
OPENAI_CHAT_MODEL = "gpt-4o"
# Use the standard model for transcriptions
OPENAI_TRANSCRIPTION_MODEL = "whisper-1" 

VERIFIER_SYSTEM_PROMPT = """
You are a fact-checker assistant. Your name is 'Verifier'.
Your job is to verify the content provided (which is a transcription of a video)
and determine if the claims made are factually correct based on your internal knowledge.

You must check if the content is scientifically, historically, or otherwise factually correct.
First, determine if the content contains a verifiable claim or if it is just
entertainment, opinion, or casual conversation.

If the information is half correct or wrong. You can add what is correct information, but the information provided by you should be scientifically correct. The information should be fully verified. In any condition, you should not provide any fake or unverified information yourself.

Rule:
- You MUST strictly follow the JSON output format.
- The system is in JSON mode, so your entire response must be a single, valid JSON object.

Output format:
{
  "isFactualClaim": boolean,
  "isContentCorrect": "Yes" | "No" | "Half" | "N/A",
  "reason": "string",
  "webSearchUsed": false
}

Guidelines for fields:
- "isFactualClaim": true if the text makes a specific claim that can be verified.
- "isContentCorrect":
    - "Yes": If the central claim is factually correct.
    - "No": If the central claim is factually incorrect.
    - "Half": If the claim is partially correct, misleading, or lacks critical context.
    - "N/A": If "isFactualClaim" is false (e.g., it's an opinion, joke, or greeting).
- "reason": Explain your reasoning. If "isFactualClaim" is false, state that.
- "webSearchUsed": Always set this to false.

"""

# Pydantic models for request/response
class VideoURLRequest(BaseModel):
    url: HttpUrl

class VerificationRequest(BaseModel):
    content: str


class VerificationResult(BaseModel):
    isFactualClaim: bool
    isContentCorrect: str
    reason: str
    webSearchUsed: bool = False

class FullPipelineRequest(BaseModel):
    url: HttpUrl
    # keep_audio is no longer relevant as we are using temp files
    # but we can keep it in the model if the client sends it
    keep_audio: bool = False



# ============================================
# VIDEO VERIFICATION UTILITY FUNCTIONS
# ============================================

def transcribe_audio_openai(audio_path: str) -> Optional[str]:
    """Transcribes the audio file using OpenAI Whisper."""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized")
    
    try:
        with open(audio_path, "rb") as audio_file:
            # Use the OPENAI_TRANSCRIPTION_MODEL constant
            transcription = openai_client.audio.transcriptions.create(
                model=OPENAI_TRANSCRIPTION_MODEL, 
                file=audio_file,
                response_format="text"
            )
        return transcription
    except Exception as e:
        print(f"Transcription error: {e}")
        return None



def sanitize_filename(filename: str) -> str:
    """Removes characters that are illegal in Windows/Linux/macOS filenames."""
    sanitized = re.sub(r'[\\/*?:"<>|]', "", filename)
    sanitized = re.sub(r'\.+', '.', sanitized)
    sanitized = re.sub(r'\s+', ' ', sanitized)
    sanitized = sanitized.strip(' .')
    return sanitized[:200]


def download_audio_from_url(video_url: str, download_dir: str) -> Optional[str]:
    """Downloads the best audio from a given URL and converts it to MP3 into the specified directory."""
    try:
        info_opts = {
            'quiet': True,
            'noplaylist': True,
            'simulate': True, # Don't download, just get info
        }
        with yt_dlp.YoutubeDL(info_opts) as ydl_info:
            info_dict = ydl_info.extract_info(video_url, download=False)
            title = info_dict.get('title', 'downloaded_audio')
            sanitized_title = sanitize_filename(title)
            
            unique_id = str(uuid.uuid4())[:8]
            # Use os.path.join to create a path in the temp directory
            final_filename_base = os.path.join(download_dir, f"{sanitized_title}_{unique_id}")
            # This is the path we expect after processing
            final_filepath_mp3 = f"{final_filename_base}.mp3"

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': f'{final_filename_base}.%(ext)s', # yt-dlp will handle the extension
            'noplaylist': True,
            'quiet': True,
            'noprogress': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            error_code = ydl.download([video_url])
            
            if error_code == 0:
                # The file should exist at the mp3 path
                if os.path.exists(final_filepath_mp3):
                    return final_filepath_mp3
                else:
                    print(f"Error: yt-dlp reported success but file not found at {final_filepath_mp3}")
                    return None
            else:
                print(f"Error: yt-dlp download failed with code {error_code}")
                return None

    except Exception as e:
        print(f"Error downloading audio: {e}")
        return None

# ---
# Endpoints will now call `transcribe_audio_openai` directly.
# ---

def translate_to_english(text_to_translate: str) -> Optional[str]:
    """Translates the given text to English using OpenAI."""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized")
    
    try:
        translation = openai_client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            messages=[
                {"role": "system", "content": "You are a translation assistant that accurately converts any language to English."},
                {"role": "user", "content": f"Translate the following text into English:\n\n{text_to_translate}"}
            ]
        )
        english_text = translation.choices[0].message.content
        return english_text
    except Exception as e:
        print(f"Translation error: {e}")
        return None

# ---
# for handling tool calls. This function now makes one simple call.
# ---
def verify_content(content_text: str) -> Optional[dict]:
    """
    Uses the enhanced prompt to fact-check the content using internal knowledge.
    """
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized")
    
    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": VERIFIER_SYSTEM_PROMPT},
                {"role": "user", "content": content_text}
            ]
        )
        
        json_string = response.choices[0].message.content
        result = json.loads(json_string)
        
        # Ensure 'webSearchUsed' exists, although prompt forces it to false
        if "webSearchUsed" not in result:
             result["webSearchUsed"] = False
            
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return None
    except Exception as e:
        print(f"Verification error: {e}")
        return None


# Note: cleanup_file is no longer needed as we'll use tempfile.TemporaryDirectory


# ------------------------------API Endpoint -------------------------------------------

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Multimodal RAG + Video Verification API v2 (OpenAI Powered)",
        "version": app.version, # Use app version
        "ai_provider": "OpenAI",
        "models": {
            "chat": OPENAI_CHAT_MODEL,
            "transcription": OPENAI_TRANSCRIPTION_MODEL, # Use constant
            "vision": OPENAI_CHAT_MODEL # gpt-4o handles vision
        },
        "endpoints": {
            "video_verification": {
                "POST /verify-video": "Simple: URL -> Verification result",
                "POST /full-pipeline": "Detailed: URL -> All steps + verification"
            },
        }
    }


# ============================================
# TEXT VERIFICATION ENDPOINTS
# ============================================


@app.post("/verify")
async def verify(request: VerificationRequest):
    """Verify content for factual accuracy."""
    if not request.content or len(request.content.strip()) < 5:
        raise HTTPException(status_code=400, detail="Content is too short or empty")
    
    verification_result = verify_content(request.content)
    
    if not verification_result:
        raise HTTPException(status_code=500, detail="Verification failed")
    
    return {
        "success": True,
        "verification": verification_result
    }

# ============================================
# VIDEO VERIFICATION ENDPOINTS
# ============================================

@app.post("/verify-video")
async def verify_video(request: VideoURLRequest):
    """
    Single endpoint to verify video content.
    Downloads audio, transcribes, translates, and verifies in one call.
    Returns only the verification result.
    
    Uses a temporary directory for safe file handling.
    """
    video_url = str(request.url)
    cleaned_url = video_url.split('?')[0].strip()

    # Use a temporary directory that cleans itself up
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            audio_path = download_audio_from_url(cleaned_url, temp_dir)
            if not audio_path:
                raise HTTPException(status_code=400, detail="Failed to download audio from URL")
            
            transcription = transcribe_audio_openai(audio_path)
            if not transcription:
                raise HTTPException(status_code=500, detail="Transcription failed")
            
            if len(transcription.strip()) < 5:
                raise HTTPException(status_code=400, detail="Transcription is too short to process")
            
            english_text = translate_to_english(transcription)
            if not english_text:
                raise HTTPException(status_code=500, detail="Translation failed")
            
            verification_result = verify_content(english_text)
            if not verification_result:
                raise HTTPException(status_code=500, detail="Verification failed")
            
            return {
                "success": True,
                "url": str(request.url),
                "verification": verification_result,
                "transcript": english_text
            }
            
    except HTTPException:
        # Re-raise HTTPException to return proper error code
        raise
    except Exception as e:
        # Catch-all for other errors
        print(f"Error in /verify-video pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    # temp_dir is automatically cleaned up here, even if an exception occurred


@app.post("/full-pipeline")
async def full_pipeline(request: FullPipelineRequest):
    """
    Complete pipeline: download audio, transcribe, translate, and verify content.
    Returns detailed information from each step.
    
    Uses a temporary directory for safe file handling.
    """
    video_url = str(request.url)
    cleaned_url = video_url.split('?')[0].strip()

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            audio_path = download_audio_from_url(cleaned_url, temp_dir)
            if not audio_path:
                raise HTTPException(status_code=400, detail="Failed to download audio")
            
            transcription = transcribe_audio_openai(audio_path)
            if not transcription:
                raise HTTPException(status_code=500, detail="Transcription failed")
            
            if len(transcription.strip()) < 5:
                raise HTTPException(status_code=400, detail="Transcription is too short")
            
            english_text = translate_to_english(transcription)
            if not english_text:
                raise HTTPException(status_code=500, detail="Translation failed")
            
            verification_result = verify_content(english_text)
            if not verification_result:
                raise HTTPException(status_code=500, detail="Verification failed")
            
            return {
                "success": True,
                "url": str(request.url),
                "audio_path": "deleted (temp file)",
                "transcription": transcription,
                "translated_text": english_text,
                "verification": verification_result,
                "timestamp": datetime.now().isoformat()
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /full-pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
    # temp_dir is automatically cleaned up here


@app.post("/transcribe-audio")
async def transcribe_audio_endpoint(audio_file: UploadFile = File(...)):
    """
    Transcribe audio using OpenAI Whisper.
    Returns the transcript text.
    """
    # Use a temporary file that is deleted automatically
    try:
        with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as temp_audio:
            shutil.copyfileobj(audio_file.file, temp_audio)
            temp_audio_path = temp_audio.name
            
            # temp_audio is still open, so we pass the path
            transcript = transcribe_audio_openai(temp_audio_path)
        
        # File is automatically deleted here
        
        if not transcript:
            raise HTTPException(status_code=500, detail="Transcription failed")
        
        return {
            "success": True,
            "filename": audio_file.filename,
            "transcript": transcript,
            "model": OPENAI_TRANSCRIPTION_MODEL # Use constant
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /transcribe-audio: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    openai_status = "ready" if openai_client else "not initialized"
    
    return {
        "status": "healthy",
        "ai_provider": "OpenAI",
        "openai_client": openai_status,
        "models": {
            "chat": OPENAI_CHAT_MODEL,
            "transcription": OPENAI_TRANSCRIPTION_MODEL, # Use constant
            "vision": OPENAI_CHAT_MODEL # gpt-4o handles vision
        },
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    # Defaulting to port 8000 as 5000 is common for other services
    port = int(os.getenv("PORT", 8000))
    # Note: for production, this file is run via Gunicorn (see Dockerfile)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)