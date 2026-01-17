"""
Language Detector for Thai/English text
"""

import re

# Thai Unicode range: \u0E00-\u0E7F
THAI_PATTERN = re.compile(r'[\u0E00-\u0E7F]')
ENGLISH_PATTERN = re.compile(r'[a-zA-Z]')

def detect_language(text: str) -> str:
    """
    Detect dominant language in text.
    Returns 'th' for Thai, 'en' for English.
    """
    if not text:
        return "th"
    
    # Count Thai and English characters
    thai_count = len(THAI_PATTERN.findall(text))
    english_count = len(ENGLISH_PATTERN.findall(text))
    
    # If more Thai characters, return Thai
    if thai_count >= english_count:
        return "th"
    else:
        return "en"

def get_text_stats(text: str) -> dict:
    """Get detailed statistics about text language composition"""
    thai_count = len(THAI_PATTERN.findall(text))
    english_count = len(ENGLISH_PATTERN.findall(text))
    total = thai_count + english_count
    
    return {
        "thai_chars": thai_count,
        "english_chars": english_count,
        "thai_percentage": round(thai_count / total * 100, 2) if total > 0 else 0,
        "english_percentage": round(english_count / total * 100, 2) if total > 0 else 0,
        "detected_language": detect_language(text)
    }

if __name__ == "__main__":
    # Test
    test_texts = [
        "สวัสดีครับ",
        "Hello World",
        "สวัสดี Hello ครับ",
        "Welcome to Thailand นะครับ"
    ]
    
    for text in test_texts:
        stats = get_text_stats(text)
        print(f"'{text}' -> {stats}")
