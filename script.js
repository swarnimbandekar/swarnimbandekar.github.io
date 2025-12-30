document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    let isDark = true; // Default to dark as per design

    // Optional: Add logic here if the user wanted a working light mode
    // For now, the button is present to match the UI but we can make it strictly decorative 
    // or functional. Let's make it functional for completeness.

    themeToggle.addEventListener('click', () => {
        isDark = !isDark;
        if (isDark) {
            root.style.setProperty('--bg-color', '#000000');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--border-color', '#333333');
            root.style.setProperty('--secondary-text-color', '#888888');
        } else {
            root.style.setProperty('--bg-color', '#ffffff');
            root.style.setProperty('--text-color', '#000000');
            root.style.setProperty('--border-color', '#e5e5e5');
            root.style.setProperty('--secondary-text-color', '#555555');
        }
    });
});
