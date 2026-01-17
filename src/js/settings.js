/**
 * Settings Module
 */

// Voice gender toggle
document.addEventListener('DOMContentLoaded', () => {
    const voiceGenderBtns = document.querySelectorAll('.settings-group:first-of-type .toggle-btn');
    const savedGender = localStorage.getItem('voiceGender') || 'female';

    voiceGenderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const gender = btn.dataset.value;
            localStorage.setItem('voiceGender', gender);

            // Update active state
            voiceGenderBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.value === gender);
            });
        });

        // Set initial active state
        btn.classList.toggle('active', btn.dataset.value === savedGender);
    });
});
