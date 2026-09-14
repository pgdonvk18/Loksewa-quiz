document.addEventListener("DOMContentLoaded", () => {
    // 1. Saved theme check garera apply garne
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Professional Sliding Switch Container aafai generate garera page ma halne
    const switchWrapper = document.createElement('div');
    switchWrapper.className = 'theme-switch-wrapper';

    switchWrapper.innerHTML = `
        <label class="theme-switch" for="darkModeCheckbox">
            <input type="checkbox" id="darkModeCheckbox" ${savedTheme === 'dark' ? 'checked' : ''}>
            <span class="slider-toggle"></span>
        </label>
    `;
    document.body.appendChild(switchWrapper);

    const checkbox = document.getElementById('darkModeCheckbox');

    // 3. Click/Change event handle garne
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
});
