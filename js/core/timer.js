(function (App) {
  'use strict';
  let id = null;
  
  function start() {
    stop();
    id = setInterval(() => {
      App.state.time++;
      
      // Обновляем таймер в шапке
      const el = document.querySelector('[data-timer]');
      if (el) el.textContent = format(App.state.time);
      
      // Обновляем строку с баллами и временем внизу
      const scoreRow = document.querySelector('.score-row');
      if (scoreRow) {
        const spans = scoreRow.querySelectorAll('span');
        if (spans.length >= 2) {
          spans[0].textContent = `Баллы: ${App.state.score}`;
          spans[1].textContent = `Время: ${format(App.state.time)}`;
        }
      }
    }, 1000);
  }
  
  function stop() { 
    if (id) clearInterval(id); 
    id = null; 
  }
  
  function format(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  }
  
  App.timer = { start, stop, format };
})(window.App = window.App || {});