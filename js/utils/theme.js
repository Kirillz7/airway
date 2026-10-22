(function (App) {
  'use strict';
  
  function initTheme() {
    const savedTheme = localStorage.getItem('airway_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: var(--surface); border: 2px solid var(--red); box-shadow: 0 4px 12px rgba(0,0,0,.2); font-size: 24px; cursor: pointer; z-index: 999; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;';
    btn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    btn.onclick = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('airway_theme', 'light');
        btn.textContent = '🌙';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('airway_theme', 'dark');
        btn.textContent = '☀️';
      }
    };
    
    document.body.appendChild(btn);
  }
  
  document.addEventListener('DOMContentLoaded', initTheme);
})(window.App = window.App || {});