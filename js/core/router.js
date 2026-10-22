(function (App) {
  'use strict';

  function render404() {
    const root = document.getElementById('app');
    root.innerHTML = '';
    root.appendChild(App.dom.el('div', { class: 'screen', style: 'text-align: center; padding: 80px 20px;' }, [
      App.dom.el('h1', { style: 'font-size: 80px; color: var(--red); margin-bottom: 16px;', text: '404' }),
      App.dom.el('h2', { style: 'color: var(--graphite); margin-bottom: 24px;', text: 'Упс! Страница не найдена' }),
      App.dom.el('div', { style: 'max-width: 300px; margin: 0 auto;' }, [
        App.components.button('На главную', {
          variant: 'primary', block: true,
          onClick: () => App.router.go('home')
        })
      ])
    ]));
  }

  function go(screen, params) {
    App.state.screen = screen;
    if (params) Object.assign(App.state, params);

    const id = App.state.caseId;
    const withId = ['briefing', 'simulation', 'debrief'].includes(screen) && id;
    const hash = withId ? `#${screen}/${id}` : `#${screen}`;

    if (location.hash !== hash) history.replaceState(null, '', hash);

    const moduleScreens = ['auth', 'profile', 'leaderboard', 'teacher', 'admin', 'user', 'attempts'];
    if (moduleScreens.includes(screen)) {
      if (screen === 'auth' && App.auth) return App.auth.renderAuthScreen();
      if (screen === 'profile' && App.profile) return App.profile.renderProfileScreen();
      if (screen === 'leaderboard' && App.leaderboard) return App.leaderboard.renderLeaderboard();
      if (screen === 'teacher' && App.teacher) return App.teacher.renderTeacherScreen();
      if (screen === 'admin' && App.admin) return App.admin.renderAdminScreen();
      if (screen === 'user' && App.userPublic) return App.userPublic.renderUserPublicScreen(App.state.userId);
      if (screen === 'attempts' && App.attempts) return App.attempts.renderAttemptsScreen();
    }

    const staticScreens = ['home', 'cases', 'briefing', 'simulation', 'debrief', 'library', 'about'];
    if (staticScreens.includes(screen) || !screen) {
      App.screens.render(screen || 'home');
      return;
    }

    render404();
  }

  function handleHash() {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) { go('home'); return; }
    const [screen, param] = raw.split('/');
    if (screen === 'user' && param) go('user', { userId: param });
    else if (param) go(screen, { caseId: param });
    else go(screen);
  }

  window.addEventListener('hashchange', handleHash);
  window.addEventListener('popstate', handleHash);

  App.router = { go, handleHash };
})(window.App = window.App || {});