/**
 * Internationalization (i18n) Module
 */

const translations = {
    th: {
        appName: 'TTS Studio',
        navMain: 'หน้าหลัก',
        navHistory: 'ประวัติ',
        inputTitle: 'ป้อนข้อความ',
        inputPlaceholder: 'พิมพ์หรือวางข้อความที่ต้องการแปลงเป็นเสียง...',
        dropZoneText: 'ลากไฟล์มาวางที่นี่ หรือ',
        dropZoneLink: 'คลิกเลือก',
        dropZoneHint: 'รองรับ .txt, .pdf',
        characters: 'ตัวอักษร',
        generate: 'สร้างเสียง',
        generating: 'กำลังสร้างเสียง...',
        historyTitle: 'ประวัติไฟล์เสียง',
        historyEmpty: 'ยังไม่มีไฟล์เสียง',
        settingsTitle: 'ตั้งค่า',
        voiceSettings: 'เสียงพูด',
        voiceGender: 'เพศเสียง',
        female: 'หญิง',
        male: 'ชาย',
        appSettings: 'แอปพลิเคชัน',
        language: 'ภาษา',
        theme: 'ธีม',
        dark: 'มืด',
        light: 'สว่าง',
        aboutApp: 'เกี่ยวกับ'
    },
    en: {
        appName: 'TTS Studio',
        navMain: 'Home',
        navHistory: 'History',
        inputTitle: 'Enter Text',
        inputPlaceholder: 'Type or paste text to convert to speech...',
        dropZoneText: 'Drop file here or',
        dropZoneLink: 'click to select',
        dropZoneHint: 'Supports .txt, .pdf',
        characters: 'characters',
        generate: 'Generate',
        generating: 'Generating...',
        historyTitle: 'Audio History',
        historyEmpty: 'No audio files yet',
        settingsTitle: 'Settings',
        voiceSettings: 'Voice',
        voiceGender: 'Voice Gender',
        female: 'Female',
        male: 'Male',
        appSettings: 'Application',
        language: 'Language',
        theme: 'Theme',
        dark: 'Dark',
        light: 'Light',
        aboutApp: 'About'
    }
};

let currentLanguage = localStorage.getItem('language') || 'th';

function t(key) {
    return translations[currentLanguage][key] || key;
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updateAllTranslations();
}

function updateAllTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        el.placeholder = t(key);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAllTranslations();

    // Language toggle buttons
    document.querySelectorAll('[data-setting="language"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.value;
            setLanguage(lang);

            // Update active state
            document.querySelectorAll('[data-setting="language"]').forEach(b => {
                b.classList.toggle('active', b.dataset.value === lang);
            });
        });

        // Set initial active state
        btn.classList.toggle('active', btn.dataset.value === currentLanguage);
    });
});
