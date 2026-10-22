import { auth, db } from '../firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

(function (App) {
  'use strict';
  const { el } = App.dom;

  const REAL_CASE_IDS = ['adult', 'child', 'infant', 'pregnant', 'self', 'burn', 'bleeding', 'fracture'];

  const ALL_ACHIEVEMENTS = [
    { id: 'first_case', icon: '🎯', title: 'Первый шаг', desc: 'Пройден первый кейс' },
    { id: 'all_cases', icon: '🏆', title: 'Спасатель', desc: 'Все 8 кейсов' },
    { id: 'perfect', icon: '⭐', title: 'Идеально', desc: 'Кейс без ошибок' },
    { id: 'fast', icon: '⚡', title: 'Скорость', desc: 'Кейс за 30 секунд' },
    { id: 'expert', icon: '🎓', title: 'Эксперт', desc: '500 XP' }
  ];

  async function shareProfile() {
    const url = `${window.location.origin}${window.location.pathname}#user/${App.currentUser.uid}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('🔗 Ссылка на профиль скопирована!');
    } catch (err) { prompt('Скопируйте ссылку:', url); }
  }

  async function renderProfileScreen() {
    const root = document.getElementById('app');

    if (App.isGuest) {
      root.innerHTML = '';
      const guestContainer = el('div', { class: 'screen', style: 'max-width: 500px; margin: 40px auto; background: var(--surface); padding: 40px 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); text-align: center; color: var(--ink);' }, [
        el('div', { style: 'width: 100px; height: 100px; border-radius: 50%; background: var(--bg); color: var(--muted); font-size: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;' }, ['👤']),
        el('h2', { text: 'Режим гостя', style: 'margin-bottom: 8px; color: var(--ink);' }),
        el('p', { text: 'Войдите или зарегистрируйтесь, чтобы сохранять прогресс, получать XP, достижения и попасть в рейтинг.', style: 'color: var(--muted); margin-bottom: 32px; font-size: 14px;' }),
        el('div', { style: 'display: grid; gap: 12px;' }, [
          App.components.button('Войти / Зарегистрироваться', { variant: 'primary', block: true, onClick: () => {
            localStorage.removeItem('airway_guest');
            App.isGuest = false;
            App.router.go('auth');
          }}),
          App.components.button('На главную', { variant: 'ghost', block: true, onClick: () => App.router.go('home') })
        ])
      ]);
      root.appendChild(guestContainer);
      return;
    }

    if (!App.currentUser) { App.router.go('auth'); return; }

    root.innerHTML = `
      <div class="screen" style="max-width: 500px; margin: 40px auto; background: var(--surface); padding: 40px 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); text-align: center;">
        <div class="skeleton" style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 20px;"></div>
        <div class="skeleton" style="width: 60%; height: 24px; margin: 0 auto 8px;"></div>
        <div class="skeleton" style="width: 40%; height: 16px; margin: 0 auto 32px;"></div>
        <div class="skeleton" style="width: 100%; height: 80px; margin-bottom: 32px;"></div>
        <div class="skeleton" style="width: 100%; height: 60px; margin-bottom: 16px;"></div>
        <div class="skeleton" style="width: 100%; height: 60px;"></div>
      </div>
    `;

    try {
      const user = App.currentUser;
      const docRef = doc(db, "users", user.uid);
      let docSnap = await Promise.race([
        getDoc(docRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Таймаут")), 5000))
      ]);

      if (!docSnap.exists()) {
        const defaultData = {
          displayName: user.displayName || 'Пользователь',
          email: user.email, role: "student", xp: 0, level: 1,
          achievements: [], completedCases: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, defaultData);
        docSnap = await getDoc(docRef);
      }

      const data = docSnap.data();
      const initials = data.displayName
        ? data.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'U';
      const userAchievements = data.achievements || [];

      // КЛЮЧЕВОЙ ФИКС: считаем только реальные кейсы
      const completedCount = (data.completedCases || [])
        .filter(id => REAL_CASE_IDS.includes(id))
        .length;

      const avatar = data.avatarEmoji || initials;

      const getProgress = (id) => {
        if (id === 'all_cases') {
          return { current: Math.min(completedCount, REAL_CASE_IDS.length), max: REAL_CASE_IDS.length, label: `${Math.min(completedCount, REAL_CASE_IDS.length)}/${REAL_CASE_IDS.length}` };
        }
        if (id === 'expert') {
          return { current: Math.min(data.xp || 0, 500), max: 500, label: `${Math.min(data.xp || 0, 500)}/500` };
        }
        return null;
      };

      const achievementsBlock = el('div', { style: 'display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 32px;' },
        ALL_ACHIEVEMENTS.map(a => {
          const unlocked = userAchievements.includes(a.id);
          const prog = getProgress(a.id);

          return el('div', {
            title: a.desc,
            style: `padding: 10px 4px; border-radius: 10px; text-align: center; font-size: 10px; font-weight: 700; position: relative; overflow: hidden; ${unlocked ? 'background: rgba(214,40,57,.1); color: var(--ink); border: 1px solid var(--red);' : 'background: var(--bg); color: var(--muted); border: 1px solid #EEE;'}`
          }, [
            el('div', { style: `font-size: 22px; margin-bottom: 4px; ${unlocked ? '' : 'filter: grayscale(1); opacity: 0.5;'}`, text: a.icon }),
            el('div', { text: a.title }),
            prog && !unlocked ? el('div', { style: 'font-size: 9px; color: var(--muted); margin-top: 4px;', text: prog.label }) : null,
            prog && !unlocked ? el('div', { style: `position: absolute; bottom: 0; left: 0; height: 3px; background: var(--red); width: ${(prog.current / prog.max) * 100}%; transition: width 0.3s;` }) : null
          ]);
        })
      );

      const infoBlock = el('div', { style: 'margin-bottom: 24px; text-align: left;' }, [
        data.group ? el('p', { style: 'font-size: 13px; color: var(--muted); margin-bottom: 4px;', text: `🎓 ${data.group}` }) : null,
        data.bio ? el('p', { style: 'font-size: 13px; color: var(--ink); font-style: italic; margin-top: 12px; padding: 12px; background: var(--bg); border-radius: 8px; line-height: 1.4;', text: data.bio }) : null
      ]);

      root.innerHTML = '';
      root.appendChild(el('div', { class: 'screen', style: 'max-width: 500px; margin: 40px auto; background: var(--surface); padding: 40px 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); text-align: center; color: var(--ink);' }, [
        el('div', { style: 'width: 100px; height: 100px; border-radius: 50%; background: var(--red); color: #fff; font-size: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 4px 12px rgba(214, 40, 57, 0.3);' }, [avatar]),
        el('h2', { text: data.displayName || 'Пользователь', style: 'margin-bottom: 4px; color: var(--ink); font-size: 24px;' }),
        el('p', { text: data.email, style: 'color: var(--muted); margin-bottom: 16px; font-size: 14px;' }),
        infoBlock,
        el('div', { style: 'background: var(--bg); padding: 20px; border-radius: 12px; margin-bottom: 32px; display: flex; justify-content: space-around;' }, [
          el('div', {}, [
            el('div', { text: data.xp || 0, style: 'font-size: 28px; font-weight: 900; color: var(--red);' }),
            el('div', { text: 'Очков опыта', style: 'font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-top: 4px;' })
          ]),
          el('div', { style: 'width: 1px; background: #E6E6EA;' }),
          el('div', {}, [
            el('div', { text: data.level || 1, style: 'font-size: 28px; font-weight: 900; color: var(--ink);' }),
            el('div', { text: 'Уровень', style: 'font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-top: 4px;' })
          ])
        ]),
        el('h3', { text: 'Достижения', style: 'font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;' }),
        achievementsBlock,
        el('div', { style: 'display: grid; gap: 12px;' }, [
          App.components.button('📜 Моя история попыток', { variant: 'ghost', block: true, onClick: () => App.router.go('attempts') }),
          App.components.button('🔗 Поделиться профилем', { variant: 'primary', block: true, onClick: shareProfile }),
          App.components.button('✏️ Редактировать профиль', { variant: 'ghost', block: true, onClick: () => App.editProfile.renderEditProfile(data, () => App.router.go('profile')) }),
          ...(data.role === 'teacher' || data.role === 'admin' ? [App.components.button('👨‍🏫 Кабинет преподавателя', { variant: 'ghost', block: true, onClick: () => App.router.go('teacher') })] : []),
          ...(data.role === 'admin' ? [App.components.button('🛡 Админ-панель', { variant: 'ghost', block: true, onClick: () => App.router.go('admin') })] : []),
          App.components.button('Выйти из аккаунта', { variant: 'ghost', block: true, onClick: async () => {
            await signOut(auth);
            localStorage.removeItem('airway_guest');
            App.isGuest = false;
            App.router.go('auth');
          }}),
          App.components.button('На главную', { variant: 'ghost', block: true, onClick: () => App.router.go('home') })
        ])
      ]));
    } catch (error) {
      root.innerHTML = `<div style="text-align:center; padding: 50px; color: red;">Ошибка: ${error.message}</div>`;
    }
  }

  App.profile = { renderProfileScreen };
})(window.App = window.App || {});