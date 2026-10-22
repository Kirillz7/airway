(function (App) {
  'use strict';

  const KEY = 'airway_challenge_steps';

  function saveSteps(steps) {
    try { sessionStorage.setItem(KEY, JSON.stringify(steps)); } catch (e) {}
  }

  function loadSteps() {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) && arr.length ? arr : null;
    } catch (e) { return null; }
  }

  function startChallenge() {
    let allSteps = [];
    App.CASES.forEach(c => {
      c.steps.forEach(s => allSteps.push({ ...s, caseId: c.id, caseTitle: c.title }));
    });

    allSteps = allSteps.sort(() => Math.random() - 0.5).slice(0, 10);

    saveSteps(allSteps);

    Object.assign(App.state, {
      screen: 'simulation',
      caseId: 'challenge',
      step: 0,
      score: 100,
      time: 0,
      hintsUsed: 0,
      history: [],
      result: null,
      customSteps: allSteps
    });

    App.timer.start();
    App.router.go('simulation');
  }

  function restoreChallenge() {
    const steps = loadSteps();
    if (!steps) return false;
    Object.assign(App.state, {
      screen: 'simulation',
      caseId: 'challenge',
      step: 0,
      score: 100,
      time: 0,
      hintsUsed: 0,
      history: [],
      result: null,
      customSteps: steps
    });
    return true;
  }

  App.challenge = { startChallenge, restoreChallenge };
})(window.App = window.App || {});