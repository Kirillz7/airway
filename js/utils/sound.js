(function (App) {
  'use strict';
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function playTone(freq, type, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  App.sound = {
    correct: () => playTone(800, 'sine', 0.15),
    wrong: () => playTone(150, 'sawtooth', 0.3),
    win: () => {
      playTone(400, 'sine', 0.1);
      setTimeout(() => playTone(600, 'sine', 0.1), 100);
      setTimeout(() => playTone(800, 'sine', 0.2), 200);
    }
  };
})(window.App = window.App || {});