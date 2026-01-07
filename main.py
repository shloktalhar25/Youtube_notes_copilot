from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import faiss
import numpy as np
from youtube_transcript_api import YouTubeTranscriptApi
from sentence_transformers import SentenceTransformer
from groq import Groq
import re
import uuid
from pathlib import Path
import pickle

# Load environment variables
load_dotenv()

app = FastAPI(title="YouTube Note Taking App")

# Initialize models and clients
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Store active sessions with FAISS indexes
sessions = {}
faiss_indexes = {}  # Store FAISS indexes per session

class VideoRequest(BaseModel):
    youtube_url: str

class AutocompleteRequest(BaseModel):
    session_id: str
    current_text: str
    cursor_position: int

class SessionResponse(BaseModel):
    session_id: str
    video_title: str
    transcript_length: int

class AutocompleteResponse(BaseModel):
    suggestion: str
    full_context: str

def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    raise ValueError("Invalid YouTube URL")

def get_youtube_transcript(video_id: str) -> tuple[str, str]:
    """Fetch YouTube transcript and video title"""
    try:
        # Get list of available transcripts
        transcript_list = YouTubeTranscriptApi().list(video_id)
        
        # Try to find English, then fall back to the first available transcript
        try:
            transcript = transcript_list.find_transcript(['en'])
        except:
            # Fallback to the first available transcript (handles Hindi, etc.)
            transcript = next(iter(transcript_list))
            
        transcript_data = transcript.fetch()
        transcript_text = " ".join([item.text for item in transcript_data])
        
        # Get video title (simplified)
        video_title = f"Video_{video_id} ({transcript.language_code})"
        
        return transcript_text, video_title
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch transcript: {str(e)}")

def create_embeddings_and_store(session_id: str, transcript: str, chunk_size: int = 500):
    """Create embeddings and store in FAISS"""
    # Split transcript into chunks
    words = transcript.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    # Create embeddings
    embeddings = embedding_model.encode(chunks)
    embeddings_np = np.array(embeddings).astype('float32')
    
    # Create FAISS index
    dimension = embeddings_np.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_np)
    
    # Store index and chunks for this session
    faiss_indexes[session_id] = {
        'index': index,
        'chunks': chunks,
        'embeddings': embeddings_np
    }
    
    return chunks

def get_relevant_context(session_id: str, query: str, n_results: int = 3) -> str:
    """Retrieve relevant context from FAISS"""
    if session_id not in faiss_indexes:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = faiss_indexes[session_id]
    index = session_data['index']
    chunks = session_data['chunks']
    
    # Create query embedding
    query_embedding = embedding_model.encode([query])
    query_embedding_np = np.array(query_embedding).astype('float32')
    
    # Search in FAISS index
    n_results = min(n_results, len(chunks))  # Don't request more than available
    distances, indices = index.search(query_embedding_np, n_results)
    
    # Get the relevant chunks
    relevant_chunks = [chunks[i] for i in indices[0]]
    
    # Combine retrieved documents
    context = "\n".join(relevant_chunks)
    return context

def generate_autocomplete(current_text: str, context: str) -> str:
    """Generate autocomplete suggestion using Groq"""
    
    # Extract the last incomplete sentence
    sentences = current_text.split('\n')
    last_line = sentences[-1] if sentences else ""
    
    prompt = f"""You are an intelligent note-taking assistant for technical and educational videos. 
Based on the video transcript context and the user's current notes, predict the NEXT words or sentence to help them complete their thought.

IMPORTANT: The video and notes may be in English, Hindi, or mixed (Hinglish). Provide suggestions in the SAME language style as the context.

Video Context:
{context}

User's Current Notes:
{current_text}

Instructions:
- Provide a concise completion that follows naturally from the user's current line.
- Do NOT provide conversational responses, only the completion text.
- Match the terminology and tone of the video (including technical terms).
- If the user is writing a step-by-step guide, suggest the next logical step.
- Return ONLY the prediction/completion.

Prediction:"""

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional note-taking assistant. You provide extremely concise, context-aware autocomplete suggestions in both English and Hindi."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1, # Lower temperature for more predictable completion
            max_tokens=64, # Shorter limit for autocomplete
        )
        
        suggestion = chat_completion.choices[0].message.content.strip()
        return suggestion
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")

@app.post("/api/create-session", response_model=SessionResponse)
async def create_session(request: VideoRequest):
    """Create a new note-taking session from YouTube URL"""
    try:
        # Extract video ID
        video_id = extract_video_id(request.youtube_url)
        
        # Get transcript
        transcript, video_title = get_youtube_transcript(video_id)
        
        # Create session ID
        session_id = str(uuid.uuid4())
        
        # Create embeddings and store in FAISS
        chunks = create_embeddings_and_store(session_id, transcript)
        
        # Store session info
        sessions[session_id] = {
            "video_id": video_id,
            "video_title": video_title,
            "transcript": transcript,
            "chunks": chunks
        }
        
        return SessionResponse(
            session_id=session_id,
            video_title=video_title,
            transcript_length=len(transcript)
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@app.post("/api/autocomplete", response_model=AutocompleteResponse)
async def autocomplete(request: AutocompleteRequest):
    """Generate autocomplete suggestion"""
    try:
        # Check if session exists
        if request.session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get relevant context from FAISS
        context = get_relevant_context(request.session_id, request.current_text)
        
        # Generate autocomplete suggestion
        suggestion = generate_autocomplete(request.current_text, context)
        
        return AutocompleteResponse(
            suggestion=suggestion,
            full_context=context
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating autocomplete: {str(e)}")

@app.get("/api/sessions")
async def get_sessions():
    """Get all active sessions"""
    return {
        "sessions": [
            {
                "session_id": sid,
                "video_title": info["video_title"],
                "video_id": info["video_id"]
            }
            for sid, info in sessions.items()
        ]
    }

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its FAISS index"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete FAISS index
    if session_id in faiss_indexes:
        del faiss_indexes[session_id]
    
    # Remove from sessions
    del sessions[session_id]
    
    return {"message": "Session deleted successfully"}

# Serve static files
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    html_path = Path(__file__).parent / "static" / "index.html"
    if html_path.exists():
        return FileResponse(html_path)
    return HTMLResponse(content="<h1>Static files not found. Please create the static folder.</h1>")

# Mount static files
static_path = Path(__file__).parent / "static"
static_path.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
