(function (App) {
  'use strict';
  const { el } = App.dom;

  function initOnboarding() {
    if (localStorage.getItem('airway_onboarded')) return;

    let step = 0;
    const steps = [
      { text: 'Привет! Нажми здесь, чтобы начать симуляцию.', target: '.btn-start' },
      { text: 'Здесь ты можешь посмотреть свой прогресс, XP и достижения.', target: '.nav-grid > button:nth-child(3)' },
      { text: 'А здесь — рейтинг лучших спасателей.', target: '.nav-grid > button:nth-child(2)' }
    ];

    const overlay = el('div', {
      style: 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; text-align: center; padding: 20px;'
    });

    const updateStep = () => {
      const s = steps[step];
      const targetEl = document.querySelector(s.target);
      
      // Очищаем оверлей
      overlay.innerHTML = '';
      
      // Блок с текстом
      const textBlock = el('div', { style: 'max-width: 400px; margin-bottom: 24px;' }, [
        el('h2', { style: 'color: var(--red); margin-bottom: 10px;', text: `Шаг ${step + 1} из 3` }),
        el('p', { style: 'font-size: 18px; margin-bottom: 0;', text: s.text })
      ]);

      // Кнопка Далее
      const nextBtn = el('button', { class: 'btn primary', style: 'padding: 12px 32px;', onclick: () => {
        if (targetEl) {
          targetEl.style.zIndex = '';
          targetEl.style.boxShadow = '';
        }
        step++;
        if (step < steps.length) updateStep();
        else { overlay.remove(); localStorage.setItem('airway_onboarded', 'true'); }
      } }, ['Далее']);

      // Кнопка Пропустить (с принудительным стилем)
      const skipBtn = el('button', { 
        style: 'margin-top: 16px; background: rgba(255,255,255,0.1); border: 1px solid #555; color: #fff; padding: 10px 24px; border-radius: 12px; cursor: pointer; font-size: 14px;',
        onclick: () => {
          if (targetEl) { targetEl.style.zIndex = ''; targetEl.style.boxShadow = ''; }
          overlay.remove(); localStorage.setItem('airway_onboarded', 'true');
        }
      }, ['Пропустить']);

      overlay.appendChild(textBlock);
      overlay.appendChild(nextBtn);
      overlay.appendChild(skipBtn);

      // Подсветка элемента
      if (targetEl) {
        targetEl.style.position = 'relative';
        targetEl.style.zIndex = '10000';
        targetEl.style.boxShadow = '0 0 0 4px var(--red)';
        targetEl.style.borderRadius = '12px';
      }
    };

    document.body.appendChild(overlay);
    updateStep();
  }

  App.onboarding = { initOnboarding };
})(window.App = window.App || {});