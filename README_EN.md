# TTS Studio 🎙️

Desktop application for Text-to-Speech conversion using **Microsoft Edge TTS**.

[![English](https://img.shields.io/badge/lang-English-blue)](README_EN.md) [![Thai](https://img.shields.io/badge/lang-Thai-red)](README.md)
![Version](https://img.shields.io/badge/version-1.0.0-blue) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-green) ![Size](https://img.shields.io/badge/size-~10MB-orange)

## ✨ Key Features

- 📝 **Text Input** - Type or paste long text.
- 📄 **File Upload** - Support `.txt` and `.pdf` files.
- 🎯 **Auto Language Detection** - Automatically detect Thai/English.
- 🔊 **Audio Player** - Play/Pause, Volume control, Speed control.
- 🎵 **Compact Player** - Minimal design, non-intrusive floating player.
- 📁 **File Management** - History, Rename, Delete audio files.
- ⚙️ **Settings** - Voice gender, UI Language, Theme (Dark/Light).
- 🎨 **Glassmorphism UI** - Modern and beautiful design.

## 🚀 Installation

### For Developers

**Step 1: Install Dependencies**

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Linux Dependencies (Ubuntu/Debian)
sudo apt-get install -y libwebkit2gtk-4.1-dev librsvg2-dev libgtk-3-dev poppler-utils

# Node.js packages
cd app_tts
npm install

# Python packages
pip install edge-tts PyPDF2 chardet
```

**Step 2: Run Development**

```bash
npm run tauri dev
```

**Step 3: Build Production**

```bash
npm run tauri build
```

Output files will be in `src-tauri/target/release/bundle/`.

## 📁 Project Structure

```
app_tts/
├── src/                    # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
├── src-tauri/              # Tauri Backend (Rust)
│   ├── src/lib.rs
│   └── tauri.conf.json
├── python/                 # TTS Engine
│   ├── tts_engine.py
│   └── lang_detector.py
└── audio_files/            # Generated audio
```

## 🎤 Voice Models

| Language | Female | Male |
|----------|--------|------|
| Thai | th-TH-PremwadeeNeural | th-TH-NiwatNeural |
| English | en-US-JennyNeural | en-US-GuyNeural |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Generate Audio |
| `Space` | Play/Pause |
| `R` | Restart |

## 📝 License

MIT License

## 🙏 Credits

- [Edge-TTS](https://github.com/rany2/edge-tts) - Microsoft Edge TTS library
- [Tauri](https://tauri.app/) - Desktop app framework
