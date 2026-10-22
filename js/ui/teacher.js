import { db } from '../firebase.js';
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function (App) {
  'use strict';
  const { el } = App.dom;

  async function renderTeacherScreen() {
    const root = document.getElementById('app');
    root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--ink);">Загрузка...</div>';

    // Проверка роли
    try {
      if (!App.currentUser) { App.router.go('auth'); return; }
      const meSnap = await getDoc(doc(db, "users", App.currentUser.uid));
      const myRole = meSnap.exists() ? meSnap.data().role : 'student';
      if (myRole !== 'teacher' && myRole !== 'admin') {
        root.innerHTML = '<div style="text-align:center; padding: 50px; color: var(--red);">Доступ запрещён. Раздел только для преподавателей.</div>';
        return;
      }
    } catch (e) {
      root.innerHTML = `<div style="color:red; text-align:center;">${e.message}</div>`;
      return;
    }

    try {
      const q = query(collection(db, "users"), orderBy("xp", "desc"));
      const snap = await getDocs(q);
      const students = [];
      snap.forEach(doc => { const d = doc.data(); if (d.role !== 'teacher' && d.role !== 'admin') students.push(d); });

      const caseCounts = { adult: 0, child: 0, infant: 0, pregnant: 0, self: 0, burn: 0, bleeding: 0, fracture: 0 };
      const levels = { '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0 };

      students.forEach(s => {
        (s.completedCases || []).forEach(c => { if (caseCounts[c] !== undefined) caseCounts[c]++; });
        const lvl = s.level || 1;
        if (lvl >= 5) levels['5+']++; else levels[String(lvl)]++;
      });

      const rows = students.map(student => el('tr', { style: 'border-bottom: 1px solid #eee;' }, [
        el('td', { style: 'padding: 12px; text-align: left; color: var(--ink);', text: student.displayName || 'Без имени' }),
        el('td', { style: 'padding: 12px; text-align: center; color: var(--ink);', text: student.email }),
        el('td', { style: 'padding: 12px; text-align: center; font-weight: 800; color: var(--red);', text: student.xp || 0 }),
        el('td', { style: 'padding: 12px; text-align: center; color: var(--ink);', text: student.level || 1 }),
        el('td', { style: 'padding: 12px; text-align: center; color: var(--ink);', text: (student.completedCases || []).length + ' из 8' })
      ]));

      function downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "Имя,Email,XP,Уровень,Пройдено кейсов\n";
        students.forEach(s => {
          const row = [
            `"${s.displayName || 'Без имени'}"`,
            `"${s.email}"`,
            s.xp || 0,
            s.level || 1,
            (s.completedCases || []).length
          ].join(",");
          csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "airway_students.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      root.innerHTML = '';
      const container = el('div', { class: 'screen', style: 'max-width: 900px; margin: 40px auto; background: var(--surface); padding: 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); color: var(--ink);' }, [
        el('h2', { text: '👨‍🏫 Кабинет преподавателя', style: 'text-align: center; margin-bottom: 24px; color: var(--ink);' }),
        el('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px;' }, [
          el('div', { style: 'background: var(--bg); padding: 16px; border-radius: 12px;' }, [el('canvas', { id: 'casesChart' })]),
          el('div', { style: 'background: var(--bg); padding: 16px; border-radius: 12px;' }, [el('canvas', { id: 'levelsChart' })])
        ]),
        el('div', { style: 'overflow-x: auto; margin-bottom: 24px;' }, [
          el('table', { style: 'width: 100%; border-collapse: collapse; min-width: 600px; color: var(--ink);' }, [
            el('thead', {}, [el('tr', { style: 'background: var(--bg);' }, [
              el('th', { style: 'padding: 12px; text-align: left; color: var(--ink);', text: 'Студент' }),
              el('th', { style: 'padding: 12px; color: var(--ink);', text: 'Email' }),
              el('th', { style: 'padding: 12px; color: var(--ink);', text: 'XP' }),
              el('th', { style: 'padding: 12px; color: var(--ink);', text: 'Уровень' }),
              el('th', { style: 'padding: 12px; color: var(--ink);', text: 'Кейсы' })
            ])]),
            el('tbody', {}, rows)
          ])
        ]),
        el('div', { style: 'display: grid; gap: 12px;' }, [
          App.components.button('📥 Скачать CSV (Excel)', { variant: 'primary', block: true, onClick: downloadCSV }),
          App.components.button('На главную', { variant: 'ghost', block: true, onClick: () => App.router.go('home') })
        ])
      ]);
      root.appendChild(container);

      setTimeout(() => {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1B1B1E';
        new Chart(document.getElementById('casesChart'), {
          type: 'bar',
          data: {
            labels: ['Взрослый', 'Ребенок', 'Младенец', 'Беременная', 'Сам себе', 'Ожог', 'Кровотеч.', 'Перелом'],
            datasets: [{ label: 'Пройдено', data: Object.values(caseCounts), backgroundColor: '#D62839' }]
          },
          options: {
            plugins: {
              title: { display: true, text: 'Популярность кейсов', color: textColor },
              legend: { labels: { color: textColor } }
            },
            scales: {
              x: { ticks: { color: textColor }, grid: { color: 'rgba(128,128,128,.15)' } },
              y: { ticks: { color: textColor }, grid: { color: 'rgba(128,128,128,.15)' } }
            }
          }
        });

        new Chart(document.getElementById('levelsChart'), {
          type: 'doughnut',
          data: {
            labels: Object.keys(levels),
            datasets: [{ data: Object.values(levels), backgroundColor: ['#D62839', '#F4A261', '#2A9D8F', '#264653', '#E76F51'] }]
          },
          options: {
            plugins: {
              title: { display: true, text: 'Распределение уровней', color: textColor },
              legend: { labels: { color: textColor } }
            }
          }
        });
      }, 100);

    } catch (err) { root.innerHTML = `<div style="color:red; text-align:center;">${err.message}</div>`; }
  }
  App.teacher = { renderTeacherScreen };
})(window.App = window.App || {});