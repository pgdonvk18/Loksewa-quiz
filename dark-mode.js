document.addEventListener("DOMContentLoaded", () => {
    // 1. Saved theme check garera apply garne
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Button aafai generate garera page ma halne
    const button = document.createElement('button');
    button.className = 'global-dark-mode-toggle';
    button.innerHTML = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    document.body.appendChild(button);

    // 3. Click event handle garne
    button.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            button.innerHTML = '🌙 Dark Mode';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            button.innerHTML = '☀️ Light Mode';
        }
    });
});
