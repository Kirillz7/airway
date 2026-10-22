import { db } from '../firebase.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function (App) {
  'use strict';
  const { el } = App.dom;
  const AVATARS = ['👤', '👨‍⚕️', '👩‍⚕️', '🦸', '🎓', '🚑', '❤️', '🩺'];

  async function renderEditProfile(data, onSave) {
    const root = document.getElementById('app');
    root.innerHTML = '';
    let selectedAvatar = data.avatarEmoji || '👤';

    const inputStyle = 'width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; font-size: 14px; background: var(--surface); color: var(--ink);';

    const createInput = (label, value, placeholder, type = 'text') => {
      return el('div', { style: 'margin-bottom: 12px;' }, [
        el('label', { text: label, style: 'display: block; font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 6px;' }),
        el('input', { type, value: value || '', placeholder, style: inputStyle })
      ]);
    };

    const nameInput = createInput('Имя и фамилия', data.displayName, 'Зеру Кирилл Дмитриевич');
    const groupInput = createInput('Группа', data.group, '15.23В-Р1/26б');
    const schoolInput = createInput('Высшая школа', data.school, 'Высшая школа креативных индустрий');
    const directionInput = createInput('Направление', data.direction, 'Креативные индустрии');

    const bioLabel = el('label', { text: 'О себе', style: 'display: block; font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 6px;' });
    const bioInput = el('textarea', {
      placeholder: 'Например: изучаю первую помощь, участвую в проектах по БЖД...',
      rows: '3',
      style: 'width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; font-size: 14px; resize: vertical; margin-bottom: 12px; background: var(--surface); color: var(--ink);'
    });
    bioInput.value = data.bio || '';

    const avatarGrid = el('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;' },
      AVATARS.map(emoji => {
        const isSelected = emoji === selectedAvatar;
        return el('button', {
          type: 'button',
          style: `font-size: 28px; padding: 8px; border-radius: 10px; border: 2px solid ${isSelected ? 'var(--red)' : '#E6E6EA'}; background: ${isSelected ? 'rgba(214,40,57,.1)' : 'var(--surface)'}; cursor: pointer; transition: all 0.15s; color: var(--ink);`,
          onclick: () => {
            selectedAvatar = emoji;
            Array.from(avatarGrid.children).forEach((b, idx) => {
              const isNow = AVATARS[idx] === emoji;
              b.style.border = isNow ? '2px solid var(--red)' : '2px solid #E6E6EA';
              b.style.background = isNow ? 'rgba(214,40,57,.1)' : 'var(--surface)';
            });
          }
        }, [emoji]);
      })
    );

    const saveBtn = App.components.button('Сохранить', { variant: 'primary', block: true });
    saveBtn.onclick = async () => {
      saveBtn.textContent = 'Сохранение...';
      saveBtn.disabled = true;
      try {
        await updateDoc(doc(db, 'users', App.currentUser.uid), {
          displayName: nameInput.querySelector('input').value.trim() || data.displayName,
          group: groupInput.querySelector('input').value.trim(),
          school: schoolInput.querySelector('input').value.trim(),
          direction: directionInput.querySelector('input').value.trim(),
          bio: bioInput.value.trim(),
          avatarEmoji: selectedAvatar
        });
        onSave();
      } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
        saveBtn.textContent = 'Сохранить';
        saveBtn.disabled = false;
      }
    };

    root.appendChild(el('div', { class: 'screen', style: 'max-width: 500px; margin: 40px auto; background: var(--surface); padding: 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); color: var(--ink);' }, [
      el('h2', { text: 'Редактировать профиль', style: 'text-align: center; margin-bottom: 24px; color: var(--ink);' }),
      nameInput, groupInput, schoolInput, directionInput,
      bioLabel, bioInput,
      el('p', { text: 'Выберите аватар', style: 'font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 8px;' }),
      avatarGrid,
      saveBtn,
      el('div', { style: 'margin-top: 12px;' }, [
        App.components.button('Отмена', { variant: 'ghost', block: true, onClick: onSave })
      ])
    ]));
  }

  App.editProfile = { renderEditProfile };
})(window.App = window.App || {});