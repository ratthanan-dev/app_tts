/**
 * Custom Audio Player Component
 */

class AudioPlayerComponent {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.btnPlay = document.getElementById('btn-play');
        this.btnRestart = document.getElementById('btn-restart');
        this.btnVolume = document.getElementById('btn-volume');
        this.volumeSlider = document.getElementById('volume-slider');
        this.speedSelect = document.getElementById('speed-select');
        this.timelineSlider = document.getElementById('timeline-slider');
        this.currentTimeEl = document.getElementById('current-time');
        this.totalTimeEl = document.getElementById('total-time');

        this.isPlaying = false;
        this.init();
    }

    init() {
        // Play/Pause
        this.btnPlay.addEventListener('click', () => this.togglePlay());

        // Error handling
        this.audio.addEventListener('error', (e) => {
            const err = this.audio.error;
            console.error('Audio Error:', err);
            let msg = 'Unknown Error';
            if (err) {
                switch (err.code) {
                    case 1: msg = 'Aborted'; break;
                    case 2: msg = 'Network Error'; break;
                    case 3: msg = 'Decode Error'; break;
                    case 4: msg = 'Src Not Supported'; break;
                    default: msg = `Error Code: ${err.code}`;
                }
                if (err.message) msg += ` - ${err.message}`;
            }
            if (window.showNotification) {
                window.showNotification(`Audio Error: ${msg}`, 'error');
            }
        });


        // Restart
        this.btnRestart.addEventListener('click', () => {
            this.audio.currentTime = 0;
            this.play();
        });

        // Volume
        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });

        // Speed
        this.speedSelect.addEventListener('change', (e) => {
            this.audio.playbackRate = parseFloat(e.target.value);
        });

        // Timeline
        this.timelineSlider.addEventListener('input', (e) => {
            const time = (e.target.value / 100) * this.audio.duration;
            this.audio.currentTime = time;
        });

        // Audio events
        this.audio.addEventListener('loadedmetadata', () => {
            this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
            this.timelineSlider.max = 100;
        });

        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.timelineSlider.value = progress;
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });

        // Set initial volume
        this.audio.volume = this.volumeSlider.value / 100;

    }

    load(src) {
        this.audio.src = src;
        this.audio.load();
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    updatePlayButton() {
        const iconPlay = this.btnPlay.querySelector('.icon-play');
        const iconPause = this.btnPlay.querySelector('.icon-pause');

        if (this.isPlaying) {
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        } else {
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize audio player
const audioPlayer = new AudioPlayerComponent();
