# TTS Studio 🎙️

แอปพลิเคชัน Desktop สำหรับแปลงข้อความเป็นเสียงพูด ด้วย **Microsoft Edge TTS**

![TTS Studio](https://img.shields.io/badge/version-1.0.0-blue) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-green) ![Size](https://img.shields.io/badge/size-~10MB-orange)

## ✨ ฟีเจอร์หลัก

- 📝 **ป้อนข้อความ** - พิมพ์หรือวางข้อความยาวๆ ได้
- 📄 **อัปโหลดไฟล์** - รองรับ .txt และ .pdf
- 🎯 **Auto Language Detection** - ตรวจจับภาษาอัตโนมัติ (ไทย/อังกฤษ)
- 🔊 **Audio Player** - เล่น/หยุด/ปรับเสียง/ปรับความเร็ว
- 🎵 **Compact Player** - ดีไซน์ใหม่ มินิมอล ไม่เกะกะหน้าจอ
- 📁 **จัดการไฟล์** - ดูประวัติ, เปลี่ยนชื่อ, ลบไฟล์เสียง
- ⚙️ **ตั้งค่า** - เลือกเพศเสียง, ภาษา UI, ธีม (มืด/สว่าง)
- 🎨 **Glassmorphism UI** - ดีไซน์สวยงามทันสมัย

## 🚀 วิธีติดตั้ง

### สำหรับนักพัฒนา

**ขั้นตอนที่ 1: ติดตั้ง Dependencies**

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

**ขั้นตอนที่ 2: รัน Development**

```bash
npm run tauri dev
```

**ขั้นตอนที่ 3: Build Production**

```bash
npm run tauri build
```

ไฟล์ output จะอยู่ที่ `src-tauri/target/release/bundle/`

## 📁 โครงสร้างโปรเจค

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

| ภาษา | หญิง | ชาย |
|------|------|-----|
| ไทย | th-TH-PremwadeeNeural | th-TH-NiwatNeural |
| อังกฤษ | en-US-JennyNeural | en-US-GuyNeural |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | สร้างเสียง |
| `Space` | เล่น/หยุด |
| `R` | เริ่มใหม่ |

## 📝 License

MIT License

## 🙏 Credits

- [Edge-TTS](https://github.com/rany2/edge-tts) - Microsoft Edge TTS library
- [Tauri](https://tauri.app/) - Desktop app framework
