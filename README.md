# Multi-Model-NSFW-Content-Detection-and-Moderation

A real-time content moderation system that detects and blocks explicit language in text and audio streams using browser extensions and a FastAPI backend.

## Features

- **Text Moderation**: Replaces explicit words with fun alternatives (emojis, facts, math problems, riddles)
- **Audio Moderation**: Real-time speech-to-text with explicit word detection and muting
- **Browser Extensions**: Chrome/Edge extensions for seamless integration
- **FastAPI Backend**: RESTful API for processing requests

## Project Structure

```
backend.py              # FastAPI server with moderation logic
requirements.txt         # Python dependencies
explicit_words.csv       # Dataset of explicit terms
replacements/            # Alternative content files
text-extension/          # Browser extension for text moderation
audio-extension/         # Browser extension for audio moderation
vosk-model-small-en-us-0.15/  # Speech recognition model
```

## Installation

1. **Clone/Download** the project to your local machine.

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Download Vosk Model** (if not included):
   - The small English model is already in `vosk-model-small-en-us-0.15/`
   - For other languages, download from [Vosk Models](https://alphacephei.com/vosk/models)

## Running the Backend

From the project root:

```bash
uvicorn backend:app --reload --host 127.0.0.1 --port 8000
```

The server will start on `http://127.0.0.1:8000`.

### Verify It's Running

- Open `http://127.0.0.1:8000/docs` for FastAPI docs
- Or test with curl:
  ```bash
  curl -X POST http://127.0.0.1:8000/text -H "Content-Type: application/json" -d '{"text":"hello"}'
  ```

## Loading Browser Extensions

### Text Extension
1. Open `chrome://extensions/` in Chrome/Edge
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `text-extension/` folder
5. The extension will moderate text on web pages

### Audio Extension
1. Follow the same steps as above
2. Select the `audio-extension/` folder
3. The extension will capture and moderate audio streams

## API Endpoints

- `POST /text`: Moderate text content
  - Input: `{"text": "your text here"}`
  - Output: `{"original": "...", "moderated": "..."}`

- `POST /audio`: Process audio stream
  - Input: Raw audio bytes with `X-Sample-Rate` header
  - Output: `{"text": "...", "mute": [...], "explicit_words": [...]}`

## Customization

- **Explicit Words**: Edit `explicit_words.csv` to add/remove terms
- **Replacements**: Modify files in `replacements/` for different alternatives
- **Model**: Swap the Vosk model in the code for different languages

## Stopping the Server

- Press `Ctrl+C` in the terminal running uvicorn
- Or find the process: `lsof -i :8000` and `kill <PID>`

## Requirements

- Python 3.8+
- Chrome/Edge browser for extensions
- Microphone access for audio moderation

## License

This project is for educational/demonstration purposes. Use responsibly.