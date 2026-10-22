(function (App) {
  'use strict';
  const { el } = App.dom;

  function show(option, onNext) {
    const ok = option.correct === 'ok';
    const warn = option.correct === 'warn';
    const cls = ok ? 'fb-ok' : warn ? 'fb-warn' : 'fb-bad';
    const title = ok ? 'Верно' : warn ? 'Допустимо, но не оптимально' : 'Ошибка';

    if (App.sound) {
      if (ok) App.sound.correct();
      else if (!warn) App.sound.wrong();
    }

    let advanced = false;
    let m; // <-- ОБЪЯВЛЕНИЕ, которого не хватало

    const advance = () => {
      if (advanced) return;
      advanced = true;
      if (m) m.close();
      onNext();
    };

    const content = el('div', { class: `feedback ${cls}` }, [
      el('div', { class: 'fb-icon', text: ok ? '✓' : warn ? '!' : '×' }),
      el('h2', { class: 'fb-title', text: title }),
      el('p', { class: 'fb-text', text: option.feedback }),
      el('button', { class: 'btn primary btn-block', type: 'button', onclick: advance }, ['Далее'])
    ]);

    // dismissible: false — нельзя закрыть кликом по фону.
    // Это гарантирует, что answer() и nextStep() всегда идут парой.
    m = App.components.modal(content, { dismissible: false });
  }

  App.feedback = { show };
})(window.App = window.App || {});