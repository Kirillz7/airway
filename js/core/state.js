(function (App) {
  'use strict';
  const init = () => ({
    screen: 'home',
    caseId: null,
    step: 0,
    score: 100,
    time: 0,
    hintsUsed: 0,
    history: [],
    result: null,
    customSteps: null
  });

  const state = init();

  function reset() { Object.assign(state, init()); }

  function startCase(caseId) {
    Object.assign(state, init(), { screen: 'briefing', caseId });
    state.time = 0;
    state.score = 100;
  }

  function answer(option) {
    if (option.correct === 'warn') {
      state.score = Math.max(0, state.score - 8);
    } else if (option.correct === 'bad') {
      state.score = Math.max(0, state.score - 15);
      state.time += 20;
    }

    state.history.push({
      step: state.step,
      correct: option.correct,
      text: option.text
    });
  }

  function nextStep() {
    let totalSteps = 0;
    if (state.caseId === 'challenge') {
      totalSteps = state.customSteps ? state.customSteps.length : 0;
    } else {
      const c = App.getCase(state.caseId);
      totalSteps = c ? c.steps.length : 0;
    }

    state.step++;
    if (state.step >= totalSteps) return finish();
    return false;
  }

  function finish() {
    state.screen = 'debrief';
    state.result = { score: state.score, time: state.time, history: state.history.slice() };

    // storage.recordCase сам отфильтрует «challenge», но оставляем явный вызов —
    // так прогресс по реальным кейсам сохраняется в localStorage.
    App.storage.recordCase(state.caseId, state.result);

    return true;
  }

  App.state = state;
  App.stateApi = { reset, startCase, answer, nextStep, finish };
})(window.App = window.App || {});