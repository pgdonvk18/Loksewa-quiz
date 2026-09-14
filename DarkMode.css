document.addEventListener("DOMContentLoaded", () => {
    // 1. CSS styles lai dynamically inject garne (Alag bata CSS file halna naparos bhanna)
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --bg-color: #ffffff;
            --text-color: #333333;
            --button-bg: #f0f0f0;
            --button-text: #333333;
        }
        [data-theme='dark'] {
            --bg-color: #121212;
            --text-color: #e0e0e0;
            --button-bg: #333333;
            --button-text: #ffffff;
        }
        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .global-dark-mode-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background-color: var(--button-bg);
            color: var(--button-text);
            border: 1px solid var(--text-color);
            padding: 10px 16px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        .global-dark-mode-toggle:hover {
            opacity: 0.9;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);

    // 2. Saved theme check garera apply garne (Flickering hatauna page load hune bitikai)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 3. Button aafai generate garera page ma halne
    const button = document.createElement('button');
    button.className = 'global-dark-mode-toggle';
    button.innerHTML = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    document.body.appendChild(button);

    // 4. Click event handle garne
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
