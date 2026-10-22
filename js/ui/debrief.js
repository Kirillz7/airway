import { saveResult } from '../game.js';

(function (App) {
  'use strict';
  const { el } = App.dom;

  // ==========================================
  // Вердикт по баллам
  // ==========================================
  function verdict(score) {
    if (score >= 90) return { label: 'Спасатель', text: 'Ты действовал по протоколу.' };
    if (score >= 70) return { label: 'Уверенный', text: 'Хорошо, но есть над чем работать.' };
    if (score >= 50) return { label: 'Новичок', text: 'Повтори алгоритм и попробуй снова.' };
    return { label: 'Критично', text: 'Риск для жизни. Изучи алгоритм заново.' };
  }

  // ==========================================
  // Получение данных кейса (с поддержкой challenge)
  // ==========================================
  function getDebriefCase() {
    if (App.state.caseId === 'challenge') {
      return {
        id: 'challenge',
        title: 'Испытание',
        icon: '⚡',
        steps: App.state.customSteps || []
      };
    }
    return App.getCase(App.state.caseId);
  }

  // ==========================================
  // Скачивание памятки в PDF
  // ==========================================
  function downloadMemo() {
    const caseData = getDebriefCase();

    if (!caseData || !Array.isArray(caseData.steps) || caseData.steps.length === 0) {
      alert('Памятка недоступна: кейс не найден.');
      return;
    }
    if (caseData.id === 'challenge') {
      alert('Памятка недоступна для режима «Испытание». Пройдите тематический кейс.');
      return;
    }

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#1B1B1E';
    element.style.background = '#fff';

    let html = `
      <h1 style="color: #D62839; font-size: 24px; margin-bottom: 10px;">AIRWAY — Памятка первой помощи</h1>
      <h2 style="font-size: 18px; margin-bottom: 20px;">Кейс: ${caseData.title}</h2>
      <h3 style="font-size: 16px; margin-bottom: 15px;">Правильный алгоритм действий:</h3>
      <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px;">
    `;
    caseData.steps.forEach((step) => {
      const correct = step.options && step.options.find(o => o.correct === 'ok');
      if (correct) html += `<li style="margin-bottom: 10px;">${correct.text}</li>`;
    });

    html += `
      </ul>
      <div style="margin-top: 30px; padding: 15px; background: #F5F6F7; border-left: 4px solid #D62839; font-size: 12px;">
        <b>Важно:</b> Данная памятка носит образовательный характер. При реальной угрозе жизни немедленно вызывайте скорую помощь (112 или 103).
      </div>

      <div style="margin-top: 40px; display: flex; align-items: center; gap: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://kirillz7.github.io/airway/" style="width: 100px; height: 100px;" crossorigin="anonymous" />
        <div>
          <p style="font-size: 14px; font-weight: bold; margin: 0 0 5px 0;">Тренируйся дальше!</p>
          <p style="font-size: 12px; color: #666; margin: 0;">Наведи камеру телефона на QR-код, чтобы перейти в веб-симулятор AIRWAY.</p>
        </div>
      </div>
    `;
    element.innerHTML = html;

    const opt = {
      margin: 1,
      filename: `AIRWAY_Памятка_${caseData.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }

  // ==========================================
  // Тост о новых достижениях и XP
  // Экспортируется как App.debrief._showAchievementToast
  // Используется в debrief.js и app.js (для streak-бонуса).
  // ==========================================
  function showAchievementToast(achievements, xpGain) {
    let toast = document.getElementById('achievement-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'achievement-toast';
      toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; max-width: 320px;';
      document.body.appendChild(toast);
    }

    if (xpGain && xpGain > 0) {
      const xpNote = document.createElement('div');
      xpNote.style.cssText = 'background: var(--red); color: #fff; padding: 12px 16px; border-radius: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,.15); animation: slideIn 0.3s ease;';
      xpNote.textContent = `+${xpGain} XP`;
      toast.appendChild(xpNote);
    }

    (achievements || []).forEach((a, i) => {
      setTimeout(() => {
        const card = document.createElement('div');
        card.style.cssText = 'background: #fff; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.15); display: flex; gap: 12px; align-items: center; border-left: 4px solid var(--red); animation: slideIn 0.3s ease;';
        card.innerHTML = `<span style="font-size: 28px;">${a.icon}</span><div><div style="font-weight: 800; font-size: 14px; color: #1B1B1E;">${a.title}</div><div style="font-size: 12px; color: #666;">${a.desc}</div></div>`;
        toast.appendChild(card);
      }, i * 400);
    });

    setTimeout(() => {
      if (toast && toast.parentNode) toast.style.transition = 'opacity 0.5s';
      if (toast) toast.style.opacity = '0';
      setTimeout(() => { if (toast && toast.parentNode) toast.remove(); }, 500);
    }, 5000);
  }

  // ==========================================
  // Основной рендер экрана дебрифа
  // ==========================================
  function render(container) {
    const { state } = App;
    const c = getDebriefCase();
    const v = verdict(state.score);
    const isChallenge = state.caseId === 'challenge';

    if (App.sound) App.sound.win();

    // Сохранение результата в Firestore (только авторизованному пользователю)
    if (App.currentUser && !App.isGuest) {
      saveResult(App.currentUser.uid, state.caseId, state.score, state.time)
        .then(result => {
          if (result && result.newAchievements && result.newAchievements.length > 0) {
            showAchievementToast(result.newAchievements, result.xpGain || 0);
          }
        })
        .catch(err => console.error("Ошибка сохранения:", err));
    } else if (App.isGuest) {
      // Гостю начисляем XP в localStorage
      try {
        const guest = JSON.parse(localStorage.getItem('airway_guest_stats') || '{}');
        guest.xp = (guest.xp || 0) + Math.max(5, Math.floor(state.score / 10));
        localStorage.setItem('airway_guest_stats', JSON.stringify(guest));
      } catch (e) {}
    }

    // Защита: если кейс/шаги недоступны — показываем «безопасный» дебриф
    if (!c || !Array.isArray(c.steps) || c.steps.length === 0) {
      container.appendChild(el('div', { class: 'screen debrief' }, [
        el('h1', { class: 'debrief-title', text: isChallenge ? 'Разбор испытания' : 'Разбор' }),
        el('div', { class: 'debrief-hero' }, [
          App.components.progressRing(state.score),
          el('div', {}, [
            el('p', { class: 'debrief-verdict', text: v.label }),
            el('p', { class: 'debrief-text', text: v.text }),
            el('p', { class: 'debrief-meta', text: `Время: ${App.timer.format(state.time)} · Шагов: ${state.history.length}` })
          ])
        ]),
        el('p', { style: 'color: var(--muted); text-align: center;', text: 'Детали шагов недоступны.' }),
        el('div', { class: 'debrief-actions' }, [
          App.components.button('К другим кейсам', { variant: 'primary', block: true, onClick: () => App.router.go('cases') }),
          App.components.button('На главную', { variant: 'ghost', block: true, onClick: () => App.router.go('home') })
        ])
      ]));
      return;
    }

    // История шагов
    const items = state.history.map((h, i) => {
      const step = c.steps[h.step != null ? h.step : i];
      if (!step) return null;
      const cls = h.correct === 'ok' ? 'ok' : h.correct === 'warn' ? 'warn' : 'bad';
      return el('li', { class: `history-item ${cls}` }, [
        el('span', { class: 'history-mark', text: h.correct === 'ok' ? '✓' : h.correct === 'warn' ? '!' : '×' }),
        el('div', {}, [
          el('p', { class: 'history-q', text: step.q }),
          el('p', { class: 'history-a', text: h.text })
        ])
      ]);
    }).filter(Boolean);

    // Кнопки действий
    const actions = isChallenge
      ? [
          App.components.button('Пройти испытание ещё раз', { variant: 'primary', block: true, onClick: () => App.challenge.startChallenge() }),
          App.components.button('К другим кейсам', { variant: 'ghost', block: true, onClick: () => App.router.go('cases') }),
          App.components.button('На главную', { variant: 'ghost', block: true, onClick: () => App.router.go('home') })
        ]
      : [
          App.components.button('Пройти ещё раз', { variant: 'primary', block: true, onClick: () => App.router.go('briefing', { caseId: state.caseId }) }),
          App.components.button('К другим кейсам', { variant: 'ghost', block: true, onClick: () => App.router.go('cases') }),
          App.components.button('Скачать памятку (PDF)', { variant: 'ghost', block: true, onClick: () => downloadMemo() })
        ];

    container.appendChild(el('div', { class: 'screen debrief' }, [
      el('h1', { class: 'debrief-title', text: isChallenge ? 'Разбор испытания' : 'Разбор' }),
      el('div', { class: 'debrief-hero' }, [
        App.components.progressRing(state.score),
        el('div', {}, [
          el('p', { class: 'debrief-verdict', text: v.label }),
          el('p', { class: 'debrief-text', text: v.text }),
          el('p', { class: 'debrief-meta', text: `Время: ${App.timer.format(state.time)} · Шагов: ${state.history.length}` })
        ])
      ]),
      el('h2', { class: 'section-title', text: 'Твои шаги' }),
      el('ul', { class: 'history' }, items),
      el('div', { class: 'debrief-actions' }, actions)
    ]));
  }

  App.debrief = { render };
  // Экспорт для app.js: показывает тост после ежедневного бонуса XP
  App.debrief._showAchievementToast = showAchievementToast;
})(window.App = window.App || {});