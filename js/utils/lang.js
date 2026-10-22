(function (App) {
  'use strict';
  
  function initLangToggle() {
    if (!App.i18n) return;
    if (document.getElementById('lang-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'lang-toggle';
    btn.style.cssText = 'position: fixed; bottom: 20px; right: 80px; width: 50px; height: 50px; border-radius: 50%; background: var(--surface); border: 2px solid var(--red); box-shadow: 0 4px 12px rgba(0,0,0,.2); font-size: 16px; font-weight: 900; cursor: pointer; z-index: 999; display: flex; align-items: center; justify-content: center; color: var(--ink);';
    btn.textContent = App.i18n.current === 'ru' ? 'EN' : 'RU';
    btn.onclick = () => App.i18n.toggle();
    document.body.appendChild(btn);
  }
  
  document.addEventListener('DOMContentLoaded', initLangToggle);
})(window.App = window.App || {});