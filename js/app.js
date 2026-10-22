import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { addDirectXP } from './game.js';

(function (App) {
  'use strict';

  // ==========================================
  // Безопасная работа с localStorage
  // Safari в приватном режиме бросает SecurityError,
  // поэтому все обращения оборачиваем в try/catch.
  // ==========================================
  function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch {} }
  function safeRemove(key) { try { localStorage.removeItem(key); } catch {} }

  // ==========================================
  // Streak (ежедневный вход)
  // ==========================================
  function checkDailyStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastVisit = safeGet('airway_last_visit');
    const lastStreakDate = safeGet('airway_streak_date');
    let streak = parseInt(safeGet('airway_streak') || '0', 10) || 0;

    // Уже заходили сегодня — не начисляем повторно
    if (lastVisit === today) return;

    // Если последний визит был вчера — продолжаем серию, иначе сбрасываем на 1
    streak = (lastStreakDate === yesterday) ? streak + 1 : 1;

    safeSet('airway_last_visit', today);
    safeSet('airway_streak', String(streak));
    safeSet('airway_streak_date', today);

    setTimeout(() => {
      try {
        alert(`🔥 С возвращением! Ты заходишь ${streak}-й день подряд. Бонус: +10 XP!`);
      } catch (e) {}

      if (App.currentUser && !App.isGuest) {
        addDirectXP(App.currentUser.uid, 10)
          .then(res => {
            // Если после бонуса открылось достижение «expert» — показываем тост
            if (res && res.newAchievements && res.newAchievements.length > 0) {
              if (App.debrief && typeof App.debrief._showAchievementToast === 'function') {
                App.debrief._showAchievementToast(res.newAchievements, 0);
              }
            }
          })
          .catch(console.error);
      }
    }, 1500);
  }

  // ==========================================
  // Парсинг hash
  // Поддерживает:
  //   #home
  //   #briefing/adult
  //   #simulation/challenge
  //   #user/<uid>
  // ==========================================
  function parseHash() {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return { screen: 'home' };
    const [screen, param] = raw.split('/');

    if (screen === 'user' && param) {
      return { screen: 'user', params: { userId: param } };
    }
    if (param) {
      return { screen, params: { caseId: param } };
    }
    return { screen };
  }

  function routeFromHash() {
    const { screen, params } = parseHash();
    App.router.go(screen, params);
  }

  // ==========================================
  // Индикатор online/offline
  // ==========================================
  function initConnectionIndicator() {
    if (document.getElementById('connection-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'connection-banner';
    banner.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'right: 0',
      'background: #D62839',
      'color: #fff',
      'padding: 8px',
      'text-align: center',
      'font-size: 13px',
      'font-weight: 700',
      'z-index: 99999',
      'transform: translateY(-100%)',
      'transition: transform 0.3s ease'
    ].join(';');
    banner.textContent = 'Нет подключения к интернету';
    document.body.appendChild(banner);

    function update() {
      if (navigator.onLine) {
        banner.style.transform = 'translateY(-100%)';
      } else {
        banner.style.transform = 'translateY(0)';
      }
    }

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }

  // ==========================================
  // Bootstrap
  // ==========================================
  App.isGuest = safeGet('airway_guest') === 'true';

  document.addEventListener('DOMContentLoaded', initConnectionIndicator);

  onAuthStateChanged(auth, (user) => {
    // Пользователь авторизован — снимаем гостевой режим
    if (user) {
      App.currentUser = user;
      App.isGuest = false;
      checkDailyStreak();
      routeFromHash();
      return;
    }

    // Пользователь не авторизован
    App.currentUser = null;
    const { screen, params } = parseHash();

    // QR-код: разрешаем гостю сразу открыть кейс по #briefing/<id>
    if (!App.isGuest && (screen === 'briefing' || screen === 'simulation') && params && params.caseId) {
      safeSet('airway_guest', 'true');
      App.isGuest = true;
      checkDailyStreak();
      App.router.go(screen, params);
      return;
    }

    // Гостевой режим включён
    if (App.isGuest) {
      checkDailyStreak();
      if (screen === 'auth') { App.router.go('home'); return; }
      routeFromHash();
      return;
    }

    // Совсем без пользователя — на экран входа
    App.router.go('auth');
  });

  // Экспортируем утилиты для других модулей
  App.utils = App.utils || {};
  Object.assign(App.utils, {
    safeGet, safeSet, safeRemove,
    parseHash, routeFromHash
  });
})(window.App = window.App || {});