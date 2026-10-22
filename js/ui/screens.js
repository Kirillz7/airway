(function (App) {
  'use strict';
  const { el } = App.dom;
  const t = (k) => (App.i18n && typeof App.i18n.t === 'function') ? App.i18n.t(k) : k;

  const root = () => document.getElementById('app');
  const clear = () => { root().innerHTML = ''; };

  function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  function home() {
    clear();
    const done = Object.keys(App.storage.load().cases).length;

    const segments = Array.from({ length: 8 }, (_, i) =>
      el('div', { class: `segment ${i < done ? 'active' : ''}` })
    );

    const previewCases = ['adult', 'child', 'infant'].map(id => {
      const c = App.getCase(id);
      return el('button', { class: 'preview-card', onclick: () => App.router.go('briefing', { caseId: c.id }) }, [
        el('span', { class: 'preview-icon', text: c.icon }),
        el('span', { class: 'preview-title', text: c.title })
      ]);
    });

    root().appendChild(el('div', { class: 'screen home' }, [
      el('div', { class: 'desktop-grid' }, [
        el('div', { class: 'col-left' }, [
          el('div', { class: 'hero' }, [
            el('svg', { class: 'ecg', viewBox: '0 0 400 80', html: `<path d="M0 40 L100 40 L120 40 L130 20 L140 60 L150 10 L160 70 L170 40 L400 40" fill="none" stroke="currentColor" stroke-width="3" class="ecg-path"/>` }),
            el('h1', { class: 'hero-title', text: 'AIRWAY' }),
            el('p', { class: 'hero-sub', text: 'Симулятор первой помощи / First Aid Simulator' }),
            el('p', { class: 'progress-label', text: `ПРОЙДЕНО / DONE: ${done} / 8` }),
            el('div', { class: 'progress-segments' }, segments)
          ]),
          el('div', { class: 'actions' }, [
            App.components.button(t('start_sim'), { variant: 'primary btn-start', block: true, onClick: () => App.router.go('cases') }),
            App.components.button(t('challenge'), { variant: 'primary', block: true, onClick: () => App.challenge.startChallenge() }),
            App.components.button(t('watch_trailer'), { variant: 'ghost', block: true, onClick: () => showVideoModal() })
          ]),
          el('div', { class: 'how-it-works' }, [
            el('p', { class: 'how-title', text: t('how_it_works') }),
            el('div', { class: 'how-steps' }, [
              el('div', { class: 'how-step' }, [el('span', { class: 'how-step-num', text: '1' }), el('span', { text: t('step1') })]),
              el('div', { class: 'how-arrow', text: '→' }),
              el('div', { class: 'how-step' }, [el('span', { class: 'how-step-num', text: '2' }), el('span', { text: t('step2') })]),
              el('div', { class: 'how-arrow', text: '→' }),
              el('div', { class: 'how-step' }, [el('span', { class: 'how-step-num', text: '3' }), el('span', { text: t('step3') })])
            ])
          ])
        ]),
        el('div', { class: 'col-right' }, [
          el('div', { class: 'nav-grid' }, [
            el('button', { class: 'nav-card', onclick: () => App.router.go('library') }, [
              el('span', { class: 'nav-card-icon', text: '📚' }),
              el('span', { class: 'nav-card-title', text: t('lib') }),
              el('span', { class: 'nav-card-sub', text: t('lib_sub') })
            ]),
            el('button', { class: 'nav-card', onclick: () => App.router.go('leaderboard') }, [
              el('span', { class: 'nav-card-icon', text: '🏆' }),
              el('span', { class: 'nav-card-title', text: t('rank') }),
              el('span', { class: 'nav-card-sub', text: t('rank_sub') })
            ]),
            el('button', { class: 'nav-card', onclick: () => App.router.go('profile') }, [
              el('span', { class: 'nav-card-icon', text: '👤' }),
              el('span', { class: 'nav-card-title', text: t('prof') }),
              el('span', { class: 'nav-card-sub', text: t('prof_sub') })
            ]),
            el('button', { class: 'nav-card', onclick: () => App.router.go('about') }, [
              el('span', { class: 'nav-card-icon', text: 'ℹ️' }),
              el('span', { class: 'nav-card-title', text: t('about') }),
              el('span', { class: 'nav-card-sub', text: t('about_sub') })
            ])
          ]),
          el('div', { class: 'fact-block' }, [
            el('p', { class: 'fact-title', text: t('fact_title') }),
            el('p', { class: 'fact-text', text: t('fact_text') })
          ]),
          el('div', { class: 'preview-section' }, [
            el('p', { class: 'preview-header', text: t('pop_cases') }),
            el('div', { class: 'preview-grid' }, previewCases)
          ]),
          el('div', { class: 'emergency-block' }, [
            el('div', { class: 'emergency-item' }, [
              el('span', { class: 'emergency-num', text: '112' }),
              el('span', { class: 'emergency-text', text: 'Единая служба спасения' })
            ]),
            el('div', { class: 'emergency-item' }, [
              el('span', { class: 'emergency-num', text: '103' }),
              el('span', { class: 'emergency-text', text: 'Скорая медицинская помощь' })
            ])
          ])
        ])
      ]),
      el('footer', { class: 'app-footer' }, [
        el('p', { text: 'Образовательный проект. Сделано студентом РЭУ им. Г.В. Плеханова, 2026.' })
      ])
    ]));

    setTimeout(() => { if (App.onboarding) App.onboarding.initOnboarding(); }, 500);
  }

  function cases() {
    clear();
    const progress = App.storage.load();
    const list = App.CASES.map(c => {
      const st = progress.cases[c.id];
      return el('button', { class: 'case-card', type: 'button', onclick: () => App.router.go('briefing', { caseId: c.id }) }, [
        el('div', { class: 'case-icon', text: c.icon }),
        el('div', { class: 'case-body' }, [
          el('h3', { class: 'case-title', text: c.title }),
          el('p', { class: 'case-sub', text: c.subtitle }),
          el('p', { class: 'case-diff', text: `Сложность: ${c.difficulty}` })
        ]),
        el('span', { class: 'case-status', text: st?.passed ? '✓' : '—' })
      ]);
    });
    root().appendChild(el('div', { class: 'screen cases' }, [
      App.components.header({ onBack: () => App.router.go('home'), title: 'Кейсы', subtitle: 'Выбери ситуацию' }),
      el('div', { class: 'case-list' }, list)
    ]));
  }

  function briefing() {
    const c = App.getCase(App.state.caseId);
    if (!c) { App.router.go('cases'); return; }
    App.stateApi.startCase(c.id);
    clear();
    root().appendChild(el('div', { class: 'screen briefing' }, [
      App.components.header({ onBack: () => App.router.go('cases'), title: c.title, subtitle: c.subtitle }),
      el('div', { class: 'briefing-card' }, [
        el('div', { class: 'scene-icon', text: c.icon }),
        el('p', { class: 'scene-text', text: c.scene }),
        el('ul', { class: 'rules' }, [
          el('li', { text: `${c.steps.length} шагов.` }),
          el('li', { text: 'Ошибка снижает баллы.' }),
          el('li', { text: 'Подсказка стоит 10 баллов.' })
        ])
      ]),
      el('div', { class: 'actions' }, [
        App.components.button('Начать', { variant: 'primary', block: true, onClick: () => {
          App.timer.start();
          App.router.go('simulation');
        } })
      ])
    ]));
  }

  function simulation() {
    // Восстановление челленджа после перезагрузки страницы
    if (App.state.caseId === 'challenge') {
      if (!App.state.customSteps || !App.state.customSteps.length) {
        if (App.challenge && App.challenge.restoreChallenge) {
          App.challenge.restoreChallenge();
        }
        if (!App.state.customSteps || !App.state.customSteps.length) {
          App.router.go('home');
          return;
        }
      }
    }

    // Идемпотентно: stop() + start(). Восстанавливает таймер при прямом заходе по hash.
    if (App.state.caseId !== 'challenge') App.timer.start();

    const c = App.state.caseId === 'challenge'
      ? { steps: App.state.customSteps || [], title: 'Испытание', icon: '⚡' }
      : App.getCase(App.state.caseId);

    if (!c || !Array.isArray(c.steps)) { App.router.go('cases'); return; }
    const step = c.steps[App.state.step];
    if (!step) { App.timer.stop(); App.router.go('debrief'); return; }

    clear();

    const shuffledOptions = shuffleArray(step.options || []);

    const options = shuffledOptions.map((opt, i) => el('button', {
      class: 'option', type: 'button',
      onclick: () => {
        App.stateApi.answer(opt);
        App.feedback.show(opt, () => {
          const done = App.stateApi.nextStep();
          if (done) { App.timer.stop(); App.router.go('debrief'); }
          else App.router.go('simulation');
        });
      }
    }, [
      el('span', { class: 'option-key', text: String.fromCharCode(65 + i) }),
      el('span', { class: 'option-text', text: opt.text })
    ]));

    const progress = (App.state.step / c.steps.length) * 100;
    root().appendChild(el('div', { class: 'screen simulation' }, [
      App.components.header({
        onBack: () => { App.timer.stop(); App.router.go('cases'); },
        title: c.title || 'Испытание',
        subtitle: `Шаг ${App.state.step + 1} из ${c.steps.length}`,
        showTimer: true
      }),
      el('div', { class: 'progress-bar' }, [el('div', { class: 'progress-fill', style: `width:${progress}%` })]),
      el('div', { class: 'score-row' }, [
        el('span', { text: `Баллы: ${App.state.score}` }),
        el('span', { text: `Время: ${App.timer.format(App.state.time)}` })
      ]),
      el('h2', { class: 'question', text: step.q }),
      el('div', { class: 'options' }, options),
      el('button', { class: 'btn ghost hint', type: 'button', onclick: () => showHint(step) }, ['Подсказка (−10)'])
    ]));
  }

  function showHint(step) {
    App.state.score = Math.max(0, App.state.score - 10);
    let m;
    const content = el('div', { class: 'hint-modal' }, [
      el('h3', { text: 'Подсказка' }),
      el('p', { text: step.hint || 'Подумай о проходимости дыхательных путей.' }),
      el('button', { class: 'btn primary btn-block', type: 'button', onclick: () => m.close() }, ['Понятно'])
    ]);
    m = App.components.modal(content);
  }

  function library() {
    clear();
    const items = App.LIBRARY.map(item => el('details', { class: 'lib-item' }, [
      el('summary', { text: item.title }),
      el('p', { text: item.text })
    ]));
    root().appendChild(el('div', { class: 'screen library' }, [
      App.components.header({ onBack: () => App.router.go('home'), title: 'Библиотека', subtitle: 'Алгоритмы' }),
      el('div', { class: 'lib-list' }, items)
    ]));
  }

  function about() {
    clear();
    root().appendChild(el('div', { class: 'screen about' }, [
      App.components.header({ onBack: () => App.router.go('home'), title: 'О проекте' }),
      el('div', { class: 'about-body' }, [
        el('p', { text: 'Проект по дисциплине «Безопасность жизнедеятельности», РЭУ им. Г.В. Плеханова.' }),
        el('p', { text: 'Автор: Зеру Кирилл Дмитриевич.' }),
        el('p', { text: 'Студент группы 15.23В-Р1/26б.' }),
        el('p', { text: 'Преподаватель: Лагутина Д.Е.' }),
        el('p', { text: 'Источники: ERC 2021, AHA 2020.' })
      ])
    ]));
  }

  function showVideoModal() {
    let m;
    const content = el('div', { class: 'video-modal' }, [
      el('div', { class: 'video-container', html: `
        <video src="assets/video/promo.mp4" controls autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; background: #000;"></video>
      ` }),
      el('button', { class: 'btn primary btn-block', style: 'margin-top: 16px;', type: 'button', onclick: () => m.close() }, ['Закрыть'])
    ]);
    m = App.components.modal(content);
  }

  function render(screen) {
    if (screen === 'debrief') { clear(); App.debrief.render(root()); return; }
    const fn = { home, cases, briefing, simulation, library, about }[screen];
    (fn || home)();
  }

  App.screens = { render };
})(window.App = window.App || {});