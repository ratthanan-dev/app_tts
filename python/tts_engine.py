"""
Text-to-Speech Engine using Edge-TTS
Usage: python tts_engine.py --text "Hello" --gender female --output output.mp3
"""

import asyncio
import argparse
import json
import sys
import os
from datetime import datetime
from pathlib import Path

import edge_tts
from lang_detector import detect_language
import logging


# Voice mapping
VOICES = {
    "th": {
        "female": "th-TH-PremwadeeNeural",
        "male": "th-TH-NiwatNeural"
    },
    "en": {
        "female": "en-US-JennyNeural",
        "male": "en-US-GuyNeural"
    }
}

def get_voice(text: str, gender: str = "female") -> str:
    """Get appropriate voice based on detected language and gender"""
    lang = detect_language(text)
    return VOICES.get(lang, VOICES["th"]).get(gender, VOICES[lang]["female"])

def generate_filename() -> str:
    """Generate filename in YYYYMMDD_HHmmss format"""
    return datetime.now().strftime("%Y%m%d_%H%M%S") + ".mp3"

def send_progress(progress: int, message: str = ""):
    """Send progress update to stdout as JSON"""
    print(json.dumps({"progress": progress, "message": message}), flush=True)

async def generate_tts(text: str, voice: str, output_path: str, rate: str = "+0%", pitch: str = "+0Hz"):
    """Generate TTS audio file"""
    try:
        send_progress(10, "Initializing TTS engine...")
        
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        
        send_progress(30, "Generating audio...")
        
        # Get total chunks for progress calculation
        chunks = []
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                chunks.append(chunk["data"])
        
        send_progress(70, "Writing audio file...")
        
        # Write to file
        with open(output_path, "wb") as f:
            for chunk in chunks:
                f.write(chunk)
        
        send_progress(100, "Complete!")
        
        return {"success": True, "output": output_path}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Text-to-Speech Engine")
    parser.add_argument("--text", type=str, required=True, help="Text to convert")
    parser.add_argument("--gender", type=str, default="female", choices=["male", "female"], help="Voice gender")
    parser.add_argument("--output", type=str, help="Output file path (optional)")
    parser.add_argument("--rate", type=str, default="+0%", help="Speech rate (e.g., +10%, -20%)")
    parser.add_argument("--pitch", type=str, default="+0Hz", help="Voice pitch (e.g., +5Hz, -10Hz)")
    parser.add_argument("--output-dir", type=str, default="audio_files", help="Output directory")
    
    args = parser.parse_args()
    
    # Ensure output directory exists
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Setup logging inside output directory to prevent triggering Tauri dev rebuilds
    log_path = output_dir / 'debug_tts.log'
    logging.basicConfig(
        filename=str(log_path),
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    logging.info(f"Starting TTS: text='{args.text}', gender={args.gender}, out_dir={output_dir}")

    # Generate output path
    if args.output:
        output_path = args.output
    else:
        output_path = str(output_dir / generate_filename())
    
    # Get voice
    try:
        voice = get_voice(args.text, args.gender)
        logging.info(f"Selected voice: {voice}")
        
        send_progress(5, f"Using voice: {voice}")
        
        # Run TTS
        result = asyncio.run(generate_tts(args.text, voice, output_path, args.rate, args.pitch))
        logging.info(f"TTS Result: {result}")
        
        # Final output
        print(json.dumps(result), flush=True)
        
        sys.exit(0 if result["success"] else 1)
        
    except Exception as e:
        logging.error(f"Critical Error: {e}", exc_info=True)
        error_result = {"success": False, "error": str(e)}
        print(json.dumps(error_result), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
