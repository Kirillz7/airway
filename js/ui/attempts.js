import { db } from '../firebase.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function (App) {
  'use strict';
  const { el } = App.dom;

  async function renderAttemptsScreen() {
    const root = document.getElementById('app');

    if (!App.currentUser) {
      root.innerHTML = '';
      root.appendChild(el('div', { class: 'screen', style: 'max-width: 500px; margin: 40px auto; background: var(--surface); padding: 32px; border-radius: 16px; text-align: center; color: var(--ink);' }, [
        el('h2', { text: 'История доступна после входа', style: 'margin-bottom: 16px; color: var(--ink);' }),
        el('p', { text: 'Войдите в аккаунт, чтобы видеть свои попытки.', style: 'color: var(--muted); margin-bottom: 24px;' }),
        App.components.button('Войти', { variant: 'primary', block: true, onClick: () => App.router.go('auth') }),
        el('div', { style: 'margin-top: 12px;' }, [
          App.components.button('На главную', { variant: 'ghost', block: true, onClick: () => App.router.go('home') })
        ])
      ]));
      return;
    }

    root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--ink);">Загрузка истории...</div>';

    try {
      const q = query(collection(db, "results"), where("userId", "==", App.currentUser.uid));
      const snap = await getDocs(q);

      let attempts = [];
      snap.forEach(doc => attempts.push(doc.data()));
      attempts.sort((a, b) => new Date(b.date) - new Date(a.date));

      const rows = attempts.map(a => {
        const c = App.getCase(a.caseId);
        const title = a.caseId === 'challenge' ? 'Испытание' : (c ? c.title : a.caseId);
        return el('div', { style: 'display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee; gap: 8px;' }, [
          el('div', { text: title, style: 'font-weight: bold; color: var(--ink);' }),
          el('div', { text: new Date(a.date).toLocaleString(), style: 'color: var(--muted); font-size: 13px;' }),
          el('div', { text: `${a.score} б.`, style: 'font-weight: 800; color: var(--red);' })
        ]);
      });

      root.innerHTML = '';
      root.appendChild(el('div', { class: 'screen', style: 'max-width: 600px; margin: 40px auto; background: var(--surface); padding: 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); color: var(--ink);' }, [
        el('h2', { text: '📜 Моя история', style: 'text-align: center; margin-bottom: 24px; color: var(--ink);' }),
        el('div', {}, rows.length ? rows : [el('p', { text: 'Пока нет пройденных кейсов.', style: 'color: var(--muted);' })]),
        el('div', { style: 'margin-top: 24px;' }, [App.components.button('Назад в профиль', { variant: 'primary', block: true, onClick: () => App.router.go('profile') })])
      ]));
    } catch (err) {
      root.innerHTML = `<div style="color:red; text-align:center;">${err.message}</div>`;
    }
  }

  App.attempts = { renderAttemptsScreen };
})(window.App = window.App || {});