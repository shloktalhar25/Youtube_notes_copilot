#  YouTube Note Taking - AI-Powered Smart Notes

An intelligent web application that helps you take notes from YouTube videos with AI-powered autocomplete. Never pause your learning flow again!

## Features

-  **YouTube Integration**: Automatically fetch video transcripts from any YouTube URL
-  **AI Autocomplete**: Smart sentence completion using Groq's Llama 3.1 8B model
-  **Vector Database**: ChromaDB embeddings for context-aware suggestions
-  **Session Management**: Separate sessions for each video to prevent content mixing
-  **TAB Autocomplete**: Press TAB to get intelligent suggestions based on video content
-  **Modern UI**: Beautiful glassmorphism design with smooth animations
-  **Export Notes**: Download your notes as text files

##  How It Works

1. **Enter YouTube URL**: Paste any YouTube video URL
2. **Automatic Processing**: 
   - Downloads video transcript/captions
   - Creates embeddings using Sentence Transformers
   - Stores in ChromaDB (separate database per video)
3. **Smart Note-Taking**:
   - Start typing your notes
   - Press **TAB** to get AI-powered autocomplete suggestions
   - Suggestions are based entirely on the video content
4. **Session-Based**: Each video has its own session to keep content separated

##  Prerequisites

- Python 3.8 or higher
- Groq API key (get it from [Groq Console](https://console.groq.com))

## 🛠️ Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:\Users\shlok\Desktop\dev-projects\yt_notetaking
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

##  Usage

1. **Start the server**:
   ```bash
   python main.py
   ```

2. **Open your browser**:
   Navigate to `http://localhost:8000`

3. **Create a session**:
   - Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
   - Click "Create Session"
   - Wait for the transcript to be processed

4. **Take notes**:
   - Start typing in the editor
   - Press **TAB** to get AI autocomplete suggestions
   - The suggestions are based on the video content
   - Press **TAB** again to accept the suggestion

5. **Manage sessions**:
   - View all active sessions in the right panel
   - Switch between sessions by clicking on them
   - Delete sessions when done


### Example Usage

```
You type: "Step 1: visit python official doc.."
Press TAB
AI suggests: "Step 2: select python 3.14"
```

The AI understands the context from the video and predicts what you're likely to write next!

##  Architecture

```
┌─────────────────┐
│  YouTube Video  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Transcript    │
│   Extraction    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Embeddings    │
│ (Sentence-BERT) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ChromaDB      │
│  (Per Session)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Types     │
│  + Presses TAB  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RAG Retrieval  │
│  (Top 3 chunks) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Groq LLM      │
│ (Llama 3.1 8B)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Autocomplete   │
│   Suggestion    │
└─────────────────┘
```



##  Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **ChromaDB**: Vector database for embeddings
- **Sentence Transformers**: Create embeddings from text
- **Groq**: Ultra-fast LLM inference
- **YouTube Transcript API**: Fetch video captions
  
##  License

MIT License - feel free to use this project however you'd like!



