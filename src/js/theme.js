/**
 * Theme Switching Module
 */

let currentTheme = localStorage.getItem('theme') || 'dark';

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    document.body.dataset.theme = theme;
}

function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    setTheme(currentTheme);

    // Theme toggle buttons
    document.querySelectorAll('[data-setting="theme"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.value;
            setTheme(theme);

            // Update active state
            document.querySelectorAll('[data-setting="theme"]').forEach(b => {
                b.classList.toggle('active', b.dataset.value === theme);
            });
        });

        // Set initial active state
        btn.classList.toggle('active', btn.dataset.value === currentTheme);
    });
});
