import { db } from '../firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function (App) {
  'use strict';
  const { el } = App.dom;
  const ALL_ACHIEVEMENTS = [
    { id: 'first_case', icon: '🎯' }, { id: 'all_cases', icon: '🏆' }, { id: 'perfect', icon: '⭐' },
    { id: 'fast', icon: '⚡' }, { id: 'expert', icon: '🎓' }
  ];

  async function renderUserPublicScreen(userId) {
    const root = document.getElementById('app');
    root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--ink);">Загрузка...</div>';

    if (!userId) {
      root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--red);">Пользователь не указан</div>';
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", userId));
      if (!snap.exists()) { root.innerHTML = 'Пользователь не найден'; return; }

      const data = snap.data();
      const initials = data.displayName ? data.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
      const avatarFinal = data.avatarEmoji || initials;
      const userAchievements = data.achievements || [];

      const achievementsBlock = el('div', { style: 'display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 32px;' },
        ALL_ACHIEVEMENTS.map(a => {
          const unlocked = userAchievements.includes(a.id);
          return el('div', { style: `padding: 10px 4px; border-radius: 10px; text-align: center; font-size: 10px; ${unlocked ? 'background: rgba(214,40,57,.1); border: 1px solid var(--red);' : 'background: var(--bg); filter: grayscale(1); opacity: 0.3;'}` }, [
            el('div', { style: 'font-size: 22px;', text: a.icon })
          ]);
        })
      );

      root.innerHTML = '';
      root.appendChild(el('div', { class: 'screen', style: 'max-width: 500px; margin: 40px auto; background: var(--surface); padding: 40px 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); text-align: center; color: var(--ink);' }, [
        el('div', { style: 'width: 100px; height: 100px; border-radius: 50%; background: var(--red); color: #fff; font-size: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;' }, [avatarFinal]),
        el('h2', { text: data.displayName || 'Пользователь', style: 'margin-bottom: 8px; color: var(--ink);' }),
        el('p', { text: data.group || 'Группа не указана', style: 'color: var(--muted); margin-bottom: 24px;' }),
        el('div', { style: 'background: var(--bg); padding: 20px; border-radius: 12px; margin-bottom: 32px; display: flex; justify-content: space-around;' }, [
          el('div', {}, [
            el('div', { text: data.xp || 0, style: 'font-size: 28px; font-weight: 900; color: var(--red);' }),
            el('div', { text: 'XP', style: 'font-size: 11px; color: var(--muted); font-weight: 700;' })
          ]),
          el('div', { style: 'width: 1px; background: #E6E6EA;' }),
          el('div', {}, [
            el('div', { text: data.level || 1, style: 'font-size: 28px; font-weight: 900; color: var(--ink);' }),
            el('div', { text: 'Уровень', style: 'font-size: 11px; color: var(--muted); font-weight: 700;' })
          ])
        ]),
        achievementsBlock,
        App.components.button('Назад к рейтингу', { variant: 'ghost', block: true, onClick: () => App.router.go('leaderboard') })
      ]));
    } catch (err) { root.innerHTML = `<div style="color:red; text-align:center;">${err.message}</div>`; }
  }
  App.userPublic = { renderUserPublicScreen };
})(window.App = window.App || {});