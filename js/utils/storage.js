(function (App) {
  'use strict';
  const KEY = 'airway_progress_v1';
  const REAL_CASE_COUNT = 8;

  const empty = () => ({ cases: {}, badges: [] });
  function load() {
    try { return Object.assign(empty(), JSON.parse(localStorage.getItem(KEY)) || {}); }
    catch { return empty(); }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }
  function recordCase(caseId, result) {
    const d = load();
    if (caseId === 'challenge') return d; // «Испытание» не пишем в прогресс
    const prev = d.cases[caseId] || {};
    d.cases[caseId] = {
      best: Math.max(prev.best || 0, result.score),
      last: result.score,
      passed: result.score >= 70 || prev.passed || false,
      attempts: (prev.attempts || 0) + 1
    };
    if (result.score >= 90 && !d.badges.includes('rescuer')) d.badges.push('rescuer');
    if (Object.keys(d.cases).length >= REAL_CASE_COUNT && !d.badges.includes('mentor')) d.badges.push('mentor');
    save(d);
    return d;
  }
  App.storage = { load, save, recordCase };
})(window.App = window.App || {});