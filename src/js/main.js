/**
 * Main Application Logic
 */

// Import Tauri API
const { invoke, convertFileSrc } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

// State
let isGenerating = false;
let currentAudioFile = null;

// DOM Elements
const textInput = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const btnGenerate = document.getElementById('btn-generate');
const btnClear = document.getElementById('btn-clear');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const playerSection = document.getElementById('player-section');

const filenameDisplay = document.getElementById('filename-display');

// Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const navSettings = document.querySelector('.nav-settings');
const views = document.querySelectorAll('.view');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTextInput();
    initDropZone();
    initGenerate();
    initSettings();
    loadHistory();
    initEvents();
});

async function initEvents() {
    if (listen) {
        await listen('tts-progress', (event) => {
            const { progress, message } = event.payload;
            updateProgress(progress, message);
        });
    }
}

// Navigation
function initNavigation() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewId = tab.dataset.view;
            switchView(viewId);

            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    navSettings.addEventListener('click', () => {
        switchView('settings');
        navTabs.forEach(t => t.classList.remove('active'));
    });
}

function switchView(viewId) {
    views.forEach(view => {
        view.classList.remove('active');
        if (view.id === `${viewId}-view`) {
            view.classList.add('active');
        }
    });
}


function initSettings() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Handle active state
            const group = btn.closest('.toggle-group');
            if (group) {
                group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }

            // Save to localStorage
            const value = btn.dataset.value;
            const setting = btn.dataset.setting;

            if (setting) {
                localStorage.setItem(setting, value);
                console.log(`Setting saved: ${setting} = ${value}`);

                // Real-time updates
                if (setting === 'theme' && window.setTheme) {
                    window.setTheme(value);
                }
            }
        });
    });
}
// Text Input
function initTextInput() {
    textInput.addEventListener('input', () => {
        updateCharCount();
        updateGenerateButton();
    });

    btnClear.addEventListener('click', () => {
        textInput.value = '';
        updateCharCount();
        updateGenerateButton();
    });
}

function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count.toLocaleString();
}

function updateGenerateButton() {
    const hasText = textInput.value.trim().length > 0;
    btnGenerate.disabled = !hasText || isGenerating;
}

// File Drop Zone
function initDropZone() {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            await handleFile(e.target.files[0]);
        }
    });
}

async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'txt') {
        const text = await file.text();
        textInput.value = text;
    } else if (ext === 'pdf') {
        // Call Tauri command to parse PDF
        try {
            const text = await invoke('parse_pdf', { path: file.path });
            textInput.value = text;
        } catch (err) {
            console.error('Error parsing PDF:', err);
            showNotification('ไม่สามารถอ่านไฟล์ PDF ได้', 'error');
        }
    } else {
        showNotification('รองรับเฉพาะไฟล์ .txt และ .pdf', 'warning');
        return;
    }

    updateCharCount();
    updateGenerateButton();
}

// Generate TTS
function initGenerate() {
    btnGenerate.addEventListener('click', generateTTS);
}

async function generateTTS() {
    if (isGenerating) return;

    const text = textInput.value.trim();
    if (!text) return;

    isGenerating = true;
    updateGenerateButton();

    // Show progress
    progressContainer.classList.remove('hidden');
    playerSection.classList.add('hidden');
    updateProgress(0);

    try {
        // Get settings
        const settings = getSettings();

        // Call Tauri command
        const result = await invoke('generate_tts', {
            text: text,
            gender: settings.voiceGender,
            rate: '+0%',
            pitch: '+0Hz'
        });

        if (result.success) {
            currentAudioFile = result.output;
            if (filenameDisplay) filenameDisplay.textContent = result.filename;

            // Load audio
            try {
                const base64Url = await invoke('read_audio_file', { path: currentAudioFile });
                audioPlayer.load(base64Url);
                // showNotification('พร้อมเล่นเสียง', 'success');
            } catch (err) {
                console.error('Load Error:', err);
                showNotification(`โหลดไฟล์เสียงไม่สำเร็จ: ${err}`, 'error');
            }

            // Show player
            progressContainer.classList.add('hidden');
            playerSection.classList.remove('hidden');

            // Refresh history
            loadHistory();
        } else {
            throw new Error(result.error);
        }
    } catch (err) {
        console.error('TTS Error:', err);
        showNotification('เกิดข้อผิดพลาดในการสร้างเสียง', 'error');
        progressContainer.classList.add('hidden');
    } finally {
        isGenerating = false;
        updateGenerateButton();
    }
}

function updateProgress(percent, message = '') {
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    if (message) {
        document.getElementById('progress-text').textContent = message;
    }
}

// History
async function loadHistory() {
    const historyList = document.getElementById('history-list');
    const historyEmpty = document.getElementById('history-empty');

    try {
        const files = await invoke('get_audio_files');

        if (files.length === 0) {
            historyEmpty.classList.remove('hidden');
            return;
        }

        historyEmpty.classList.add('hidden');

        // Clear existing items (except empty message)
        historyList.querySelectorAll('.history-item').forEach(el => el.remove());

        // Add items
        files.forEach(file => {
            const item = createHistoryItem(file);
            historyList.appendChild(item);
        });
    } catch (err) {
        console.error('Error loading history:', err);
    }
}

function createHistoryItem(file) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
        <div class="history-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
        </div>
        <div class="history-item-info">
            <div class="history-item-name">${file.name}</div>
            <div class="history-item-date">${formatDate(file.created)}</div>
        </div>
        <div class="history-item-actions">
            <button class="btn-icon" title="เล่น" data-action="play" data-path="${file.path}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </button>
            <button class="btn-icon" title="ลบ" data-action="delete" data-path="${file.path}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    // Event listeners
    div.querySelector('[data-action="play"]').addEventListener('click', () => playHistoryItem(file.path));
    div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteHistoryItem(file.path));

    return div;
}

async function playHistoryItem(path) {
    currentAudioFile = path;
    if (filenameDisplay) filenameDisplay.textContent = path.split('/').pop();
    try {
        const base64Url = await invoke('read_audio_file', { path: path });
        audioPlayer.load(base64Url);
    } catch (err) {
        console.error('Load Error:', err);
        showNotification(`โหลดไฟล์เสียงไม่สำเร็จ: ${err}`, 'error');
    }
    playerSection.classList.remove('hidden');
}

async function deleteHistoryItem(path) {
    if (!confirm('ต้องการลบไฟล์นี้?')) return;

    try {
        await invoke('delete_file', { path });
        loadHistory();
        showNotification('ลบไฟล์แล้ว', 'success');
    } catch (err) {
        console.error('Error deleting file:', err);
        showNotification('ไม่สามารถลบไฟล์ได้', 'error');
    }
}

// Settings
function getSettings() {
    return {
        voiceGender: localStorage.getItem('voiceGender') || 'female',
        language: localStorage.getItem('language') || 'th',
        theme: localStorage.getItem('theme') || 'dark'
    };
}

// Notifications
function showNotification(message, type = 'info') {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Icon
    let icon = '';
    if (type === 'success') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    else if (type === 'error') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    else icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;

    container.appendChild(notification);

    // Close handling
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto close
    setTimeout(() => {
        if (notification.isConnected) {
            notification.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Expose to window for audio-player.js
window.showNotification = showNotification;

// Utilities
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
