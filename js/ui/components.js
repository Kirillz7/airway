(function (App) {
  'use strict';
  const { el } = App.dom;

  function header({ onBack, title, subtitle, showTimer } = {}) {
    return el('header', { class: 'app-header' }, [
      onBack
        ? el('button', { class: 'btn-icon', 'aria-label': 'Назад', onclick: onBack }, ['←'])
        : el('span', { class: 'header-logo' }, ['AIRWAY']),
      el('div', { class: 'header-titles' }, [
        title ? el('h1', { class: 'header-title', text: title }) : null,
        subtitle ? el('p', { class: 'header-sub', text: subtitle }) : null
      ]),
      showTimer
        ? el('span', { class: 'header-timer', 'data-timer': '' }, ['00:00'])
        : el('span', { class: 'header-spacer' })
    ]);
  }

  function button(text, { variant = 'primary', block = false, onClick } = {}) {
    return el('button', {
      class: `btn ${variant} ${block ? 'btn-block' : ''}`,
      type: 'button',
      onclick: onClick
    }, [text]);
  }

  function modal(content, { dismissible = true } = {}) {
    const root = document.getElementById('modal-root');
    root.innerHTML = '';
    const close = () => {
      root.innerHTML = '';
      document.body.classList.remove('modal-open');
    };
    const overlay = el('div', {
      class: 'modal-overlay',
      onclick: (e) => {
        if (dismissible && e.target === overlay) close();
      }
    }, [
      el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, content)
    ]);
    root.appendChild(overlay);
    document.body.classList.add('modal-open');
    return { close };
  }

  function progressRing(value) {
    const r = 52;
    const c = 2 * Math.PI * r;
    const v = Math.max(0, Math.min(100, Number(value) || 0));
    const off = c - (v / 100) * c;
    const node = el('div', { class: 'ring-inner', html: `
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="${r}" class="ring-bg"/>
        <circle cx="60" cy="60" r="${r}" class="ring-fg" style="stroke-dasharray:${c};stroke-dashoffset:${c}"/>
      </svg>
      <span class="ring-value">${v}</span>` });

    // Двойной rAF гарантирует, что браузер успел отрисовать начальное состояние
    // (stroke-dashoffset: c) до применения финального (off) — срабатывает CSS-переход.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fg = node.querySelector('.ring-fg');
      if (fg) fg.style.strokeDashoffset = String(off);
    }));

    return node;
  }

  App.components = { header, button, modal, progressRing };
})(window.App = window.App || {});