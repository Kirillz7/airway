import { getLeaderboard } from '../game.js';

(function (App) {
  'use strict';
  const { el } = App.dom;

  async function renderLeaderboard() {
    const root = document.getElementById('app');
    root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--ink);">Загрузка...</div>';

    try {
      const leaders = await getLeaderboard(20);
      const listItems = leaders.map((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        const name = user.displayName || 'Аноним';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const avatar = user.avatarEmoji || initials;

        return el('div', {
          style: 'display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;',
          onclick: () => App.router.go('user', { userId: user.id })
        }, [
          el('div', { style: 'width: 30px; font-weight: 800; color: var(--red);', text: medal }),
          el('div', { style: 'width: 40px; height: 40px; border-radius: 50%; background: var(--red); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;', text: avatar }),
          el('div', { style: 'flex: 1;' }, [
            el('div', { style: 'font-weight: 700; color: var(--ink);', text: name }),
            el('div', { style: 'font-size: 12px; color: var(--muted);', text: `Уровень ${user.level || 1}` })
          ]),
          el('div', { style: 'font-weight: 900; color: var(--red);', text: `${user.xp || 0} XP` })
        ]);
      });

      root.innerHTML = '';
      root.appendChild(el('div', { class: 'screen', style: 'max-width: 600px; margin: 40px auto; background: var(--surface); padding: 32px; border-radius: 16px; color: var(--ink);' }, [
        el('h2', { text: '🏆 Топ спасателей', style: 'text-align: center; margin-bottom: 24px; color: var(--ink);' }),
        el('div', {}, listItems.length ? listItems : [el('p', { style: 'text-align:center; color: var(--muted);', text: 'Пусто' })]),
        el('div', { style: 'margin-top: 24px;' }, [App.components.button('На главную', { variant: 'primary', block: true, onClick: () => App.router.go('home') })])
      ]));
    } catch (err) { root.innerHTML = `<div style="color:red; text-align:center;">${err.message}</div>`; }
  }
  App.leaderboard = { renderLeaderboard };
})(window.App = window.App || {});