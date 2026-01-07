# 🚀 Quick Start Guide

## Step 1: Get Your Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

## Step 2: Setup Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and add your Groq API key:
   ```
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

## Step 3: Install Dependencies

### Option A: Using the start script (Recommended)
```bash
.\start.ps1
```

### Option B: Manual installation
```bash
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python main.py
```

## Step 4: Use the App

1. Open browser to `http://localhost:8000`
2. Paste a YouTube URL (must have captions/subtitles)
3. Click "Create Session"
4. Wait for processing (10-30 seconds depending on video length)
5. Start typing notes in the editor
6. Press **TAB** to get AI autocomplete suggestions!

## 💡 Pro Tips

- **Best Videos**: Educational tutorials, lectures, how-to guides
- **TAB Key**: Your best friend - press it anytime for suggestions
- **Context Matters**: The more you type, the better the suggestions
- **Multiple Sessions**: You can have multiple videos open at once
- **Download Notes**: Use the Download button to save your notes

## 🎯 Example Workflow

1. Find a Python tutorial on YouTube
2. Copy the URL: `https://www.youtube.com/watch?v=example`
3. Paste it in the app and create session
4. Start typing: "Step 1: Install Python by..."
5. Press TAB
6. AI suggests: "visiting python.org and downloading the latest version"
7. Keep typing and pressing TAB for smart completions!

## ⚠️ Common Issues

**"Failed to fetch transcript"**
- Video must have captions/subtitles enabled
- Try a different video

**"Groq API error"**
- Check your API key in `.env`
- Ensure you have API credits

**Server won't start**
- Make sure port 8000 is not in use
- Check that all dependencies are installed

## 📚 Need Help?

Check the full README.md for detailed documentation!
