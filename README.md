# 📝 YouTube Note Taking - AI-Powered Smart Notes

An intelligent web application that helps you take notes from YouTube videos with AI-powered autocomplete. Never pause your learning flow again!

## ✨ Features

- 🎥 **YouTube Integration**: Automatically fetch video transcripts from any YouTube URL
- 🤖 **AI Autocomplete**: Smart sentence completion using Groq's Llama 3.1 8B model
- 💾 **Vector Database**: ChromaDB embeddings for context-aware suggestions
- 📚 **Session Management**: Separate sessions for each video to prevent content mixing
- ⌨️ **TAB Autocomplete**: Press TAB to get intelligent suggestions based on video content
- 🎨 **Modern UI**: Beautiful glassmorphism design with smooth animations
- 📥 **Export Notes**: Download your notes as text files

## 🚀 How It Works

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

## 📋 Prerequisites

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

## 🎯 Usage

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

## 🎨 Features in Detail

### Autocomplete Behavior

- **Context-Aware**: Suggestions are based on the video transcript using RAG (Retrieval Augmented Generation)
- **Smart Completion**: Completes the current sentence or suggests the next logical step
- **Video-Specific**: Each session uses only its video's content - no mixing!
- **Low Latency**: Uses Groq's ultra-fast Llama 3.1 8B Instant model

### Example Usage

```
You type: "Step 1: visit python official doc.."
Press TAB
AI suggests: "Step 2: select python 3.14"
```

The AI understands the context from the video and predicts what you're likely to write next!

## 🏗️ Architecture

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

## 📁 Project Structure

```
yt_notetaking/
├── main.py                 # FastAPI backend
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .env                   # Your API keys (create this)
├── static/
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Beautiful CSS styling
│   └── app.js            # Frontend JavaScript
├── chroma_db/            # ChromaDB storage (auto-created)
└── README.md             # This file
```

## 🔧 API Endpoints

- `POST /api/create-session`: Create a new session from YouTube URL
- `POST /api/autocomplete`: Get autocomplete suggestion
- `GET /api/sessions`: List all active sessions
- `DELETE /api/session/{session_id}`: Delete a session

## 🎨 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **ChromaDB**: Vector database for embeddings
- **Sentence Transformers**: Create embeddings from text
- **Groq**: Ultra-fast LLM inference
- **YouTube Transcript API**: Fetch video captions

### Frontend
- **Vanilla JavaScript**: No frameworks, pure performance
- **Modern CSS**: Glassmorphism, gradients, animations
- **Google Fonts**: Inter & Fira Code

## 🐛 Troubleshooting

### "Failed to fetch transcript"
- Make sure the YouTube video has captions/subtitles enabled
- Try a different video
- Some videos may have restricted access

### "Groq API error"
- Check that your API key is correct in `.env`
- Ensure you have API credits available
- Check your internet connection

### ChromaDB errors
- Delete the `chroma_db` folder and restart
- Make sure you have write permissions in the project directory

## 🚀 Future Enhancements

- [ ] Support for multiple languages
- [ ] Custom embedding models
- [ ] Note templates
- [ ] Export to Markdown/PDF
- [ ] Collaborative note-taking
- [ ] Video timestamp linking
- [ ] Search across all notes

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 💡 Tips

- For best results, use videos with clear, well-structured content
- Type at least a few words before pressing TAB for better suggestions
- The more context you provide, the better the autocomplete
- Each session is independent - perfect for organizing notes by topic

---

**Built with ❤️ using Groq, ChromaDB, and FastAPI**
