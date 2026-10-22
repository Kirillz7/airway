import { db } from '../firebase.js';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function (App) {
  'use strict';
  const { el } = App.dom;

  async function renderAdminScreen() {
    const root = document.getElementById('app');
    root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--ink);">Загрузка...</div>';

    try {
      if (!App.currentUser) { App.router.go('auth'); return; }
      const meSnap = await getDoc(doc(db, "users", App.currentUser.uid));
      const myRole = meSnap.exists() ? meSnap.data().role : 'student';
      if (myRole !== 'admin') {
        root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--red);">Доступ запрещён. Раздел только для администратора.</div>';
        return;
      }
    } catch (e) {
      root.innerHTML = `<div style="color:red; text-align:center;">${e.message}</div>`;
      return;
    }

    try {
      const snap = await getDocs(collection(db, "users"));
      const users = [];
      snap.forEach(d => users.push({ id: d.id, ...d.data() }));

      const rows = users.map(user => {
        const roleSelect = el('select', { style: 'padding: 6px; border-radius: 6px; border: 1px solid #ccc; background: var(--surface); color: var(--ink);', onchange: async (e) => {
          await updateDoc(doc(db, 'users', user.id), { role: e.target.value });
        }}, [
          el('option', { value: 'student', selected: user.role === 'student' }, ['Студент']),
          el('option', { value: 'teacher', selected: user.role === 'teacher' }, ['Преподаватель']),
          el('option', { value: 'admin', selected: user.role === 'admin' }, ['Админ'])
        ]);

        return el('tr', { style: 'border-bottom: 1px solid #eee;' }, [
          el('td', { style: 'padding: 10px; text-align: left; color: var(--ink);', text: user.displayName || 'Без имени' }),
          el('td', { style: 'padding: 10px; font-size: 12px; color: var(--ink);', text: user.email }),
          el('td', { style: 'padding: 10px; text-align: center;' }, [roleSelect]),
          el('td', { style: 'padding: 10px; text-align: center;' }, [
            el('button', { style: 'background:none; border:none; color:red; cursor:pointer; font-size: 18px;', onclick: async () => {
              if(confirm('Удалить пользователя?')) { await deleteDoc(doc(db, 'users', user.id)); location.reload(); }
            }}, ['🗑'])
          ])
        ]);
      });

      root.innerHTML = '';
      root.appendChild(el('div', { class: 'screen', style: 'max-width: 900px; margin: 40px auto; background: var(--surface); padding: 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); color: var(--ink);' }, [
        el('h2', { text: '🛡 Админ-панель', style: 'text-align: center; margin-bottom: 24px; color: var(--ink);' }),
        el('div', { style: 'overflow-x: auto; margin-bottom: 24px;' }, [
          el('table', { style: 'width: 100%; border-collapse: collapse; min-width: 600px; color: var(--ink);' }, [
            el('thead', {}, [el('tr', { style: 'background: var(--bg);' }, [
              el('th', { style: 'padding: 10px; text-align: left; color: var(--ink);', text: 'Имя' }),
              el('th', { style: 'padding: 10px; color: var(--ink);', text: 'Email' }),
              el('th', { style: 'padding: 10px; color: var(--ink);', text: 'Роль' }),
              el('th', { style: 'padding: 10px; color: var(--ink);', text: '' })
            ])]),
            el('tbody', {}, rows)
          ])
        ]),
        el('div', { style: 'margin-top: 24px;' }, [
          App.components.button('На главную', { variant: 'primary', block: true, onClick: () => App.router.go('home') })
        ])
      ]));
    } catch (err) { root.innerHTML = `<div style="color:red; text-align:center;">${err.message}</div>`; }
  }
  App.admin = { renderAdminScreen };
})(window.App = window.App || {});