document.addEventListener("DOMContentLoaded", () => {
    // 1. Saved theme check garera apply garne
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Header vitra toggle switch halne (Find header element)
    const header = document.querySelector('.app-header');
    if (header) {
        const switchLabel = document.createElement('label');
        switchLabel.className = 'theme-switch';
        switchLabel.innerHTML = `
            <input type="checkbox" id="darkModeCheckbox" ${savedTheme === 'dark' ? 'checked' : ''}>
            <span class="slider-toggle"></span>
        `;
        
        // Header ko right side ma rakhna ko lagi style adjust gareko
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.justifyContent = 'space-between';
        
        // Back button ra title pachadi toggle insert garne
        header.appendChild(switchLabel);
    }

    const checkbox = document.getElementById('darkModeCheckbox');
    if (checkbox) {
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
    }
});
