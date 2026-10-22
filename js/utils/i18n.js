(function (App) {
  'use strict';
  
  App.i18n = {
    current: localStorage.getItem('airway_lang') || 'ru',
    dict: {
      ru: {
        // Главная
        start_sim: 'Начать симуляцию',
        challenge: '⚡ Испытание (10 вопросов)',
        watch_trailer: '▶ Смотреть трейлер',
        how_it_works: 'Как это работает',
        step1: 'Нажми старт',
        step2: 'Выбери действие',
        step3: 'Получи результат',
        lib: 'Библиотека',
        lib_sub: 'Алгоритмы',
        rank: 'Рейтинг',
        rank_sub: 'Топ игроков',
        prof: 'Профиль',
        prof_sub: 'Прогресс',
        about: 'О проекте',
        about_sub: 'Автор',
        fact_title: 'Знаете ли вы?',
        fact_text: 'Удушье — одна из самых частых причин смерти от несчастных случаев. Правильные действия в первые 3 минуты спасают жизнь.',
        pop_cases: 'Популярные сценарии',
        
        // Экран входа
        login_title: 'Вход в AIRWAY',
        login_sub: 'Войдите, чтобы сохранять прогресс',
        email: 'Email',
        password: 'Пароль',
        name: 'Ваше Имя и Фамилия',
        btn_login: 'Войти',
        btn_reg: 'Зарегистрироваться',
        btn_guest: 'Продолжить без регистрации →',
        btn_google: 'Войти через Google',
        btn_apple: 'Войти через Apple',
        no_acc: 'У меня нет аккаунта (Регистрация)',
        have_acc: 'У меня уже есть аккаунт (Вход)'
      },
      en: {
        // Home
        start_sim: 'Start Simulation',
        challenge: '⚡ Challenge (10 questions)',
        watch_trailer: '▶ Watch Trailer',
        how_it_works: 'How it works',
        step1: 'Press start',
        step2: 'Choose action',
        step3: 'Get result',
        lib: 'Library',
        lib_sub: 'Algorithms',
        rank: 'Leaderboard',
        rank_sub: 'Top players',
        prof: 'Profile',
        prof_sub: 'Progress',
        about: 'About',
        about_sub: 'Author',
        fact_title: 'Did you know?',
        fact_text: 'Choking is one of the most common causes of accidental death. Correct actions in the first 3 minutes save lives.',
        pop_cases: 'Popular scenarios',

        // Auth
        login_title: 'Login to AIRWAY',
        login_sub: 'Sign in to save your progress',
        email: 'Email',
        password: 'Password',
        name: 'Your Full Name',
        btn_login: 'Sign In',
        btn_reg: 'Sign Up',
        btn_guest: 'Continue as guest →',
        btn_google: 'Sign in with Google',
        btn_apple: 'Sign in with Apple',
        no_acc: "I don't have an account (Sign Up)",
        have_acc: 'I already have an account (Sign In)'
      }
    },
    t(key) {
      return this.dict[this.current][key] || key;
    },
    toggle() {
      this.current = this.current === 'ru' ? 'en' : 'ru';
      localStorage.setItem('airway_lang', this.current);
      location.reload();
    }
  };
})(window.App = window.App || {});