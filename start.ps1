# YouTube Note Taking App - Quick Start Script

Write-Host "🚀 Starting YouTube Note Taking App..." -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env and add your Groq API key!" -ForegroundColor Red
    Write-Host "Get your API key from: https://console.groq.com" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter after you've added your API key to .env"
}

# Install dependencies if needed
Write-Host "📥 Checking dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Starting server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python main.py
