import { auth, db, googleProvider } from '../firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function (App) {
  'use strict';
  const { el } = App.dom;
  const t = (k) => (App.i18n && typeof App.i18n.t === 'function') ? App.i18n.t(k) : k;

  async function handleProviderLogin(provider) {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          displayName: user.displayName || 'Пользователь',
          email: user.email, role: "student", xp: 0, level: 1,
          achievements: [], completedCases: [], createdAt: new Date().toISOString()
        });
      }
      localStorage.removeItem('airway_guest');
      App.isGuest = false;
      App.router.go('home');
    } catch (error) { alert('Ошибка входа: ' + error.message); }
  }

  function renderAuthScreen() {
    const root = document.getElementById('app');
    root.innerHTML = '';
    let isLogin = true;

    const formTitle = el('h2', { text: t('login_title'), style: 'text-align: center; margin-bottom: 8px; color: var(--ink);' });
    const formSub = el('p', { text: t('login_sub'), style: 'text-align: center; margin-bottom: 24px; color: var(--muted); font-size: 13px;' });

    const nameInput = el('input', { type: 'text', placeholder: t('name'), style: 'display: none; margin-bottom: 12px; width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; background: var(--surface); color: var(--ink);' });
    const emailInput = el('input', { type: 'email', placeholder: t('email'), style: 'margin-bottom: 12px; width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; background: var(--surface); color: var(--ink);' });
    const passInput = el('input', { type: 'password', placeholder: t('password'), style: 'margin-bottom: 24px; width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; background: var(--surface); color: var(--ink);' });

    const submitBtn = App.components.button(t('btn_login'), { variant: 'primary', block: true });
    const toggleBtn = el('button', { class: 'btn ghost', style: 'margin-top: 12px; width: 100%;', text: t('no_acc') });

    const skipBtn = el('button', { style: 'margin-top: 20px; width: 100%; background: none; border: none; color: var(--muted); font-size: 13px; text-decoration: underline; cursor: pointer; padding: 8px;', text: t('btn_guest') });

    const googleBtn = el('button', {
      class: 'btn ghost', style: 'width: 100%; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;',
      onclick: () => handleProviderLogin(googleProvider)
    }, ['🌐 ' + t('btn_google')]);

    toggleBtn.onclick = () => {
      isLogin = !isLogin;
      if (isLogin) {
        formTitle.textContent = t('login_title'); nameInput.style.display = 'none';
        submitBtn.textContent = t('btn_login'); toggleBtn.textContent = t('no_acc');
      } else {
        formTitle.textContent = t('btn_reg'); nameInput.style.display = 'block';
        submitBtn.textContent = t('btn_reg'); toggleBtn.textContent = t('have_acc');
      }
    };

    skipBtn.onclick = () => {
      localStorage.setItem('airway_guest', 'true');
      App.isGuest = true;
      App.currentUser = null;
      App.router.go('home');
    };

    submitBtn.onclick = async () => {
      const email = emailInput.value.trim(); const pass = passInput.value.trim(); const name = nameInput.value.trim();
      if (!email || !pass) return alert('Заполните email и пароль');
      if (!isLogin && !name) return alert('Введите ваше имя');
      submitBtn.textContent = 'Загрузка...'; submitBtn.disabled = true;

      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, pass);
          localStorage.removeItem('airway_guest'); App.isGuest = false; App.router.go('home');
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
          const user = userCredential.user; await updateProfile(user, { displayName: name });
          await setDoc(doc(db, "users", user.uid), {
            displayName: name, email: email, role: "student", xp: 0, level: 1, achievements: [], completedCases: [], createdAt: new Date().toISOString()
          });
          localStorage.removeItem('airway_guest'); App.isGuest = false; App.router.go('home');
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') alert('Эта почта уже зарегистрирована.');
        else if (error.code === 'auth/weak-password') alert('Пароль слишком короткий.');
        else if (error.code === 'auth/invalid-credential') alert('Неверный email или пароль.');
        else alert('Ошибка: ' + error.message);
      } finally {
        submitBtn.textContent = isLogin ? t('btn_login') : t('btn_reg'); submitBtn.disabled = false;
      }
    };

    const authContainer = el('div', { class: 'screen', style: 'max-width: 400px; margin: 40px auto; background: var(--surface); padding: 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); color: var(--ink);' }, [
      formTitle, formSub, nameInput, emailInput, passInput, submitBtn,
      el('div', { style: 'display: flex; align-items: center; gap: 10px; margin: 20px 0;' }, [
        el('div', { style: 'flex: 1; height: 1px; background: #eee;' }),
        el('span', { text: 'или', style: 'color: var(--muted); font-size: 12px;' }),
        el('div', { style: 'flex: 1; height: 1px; background: #eee;' })
      ]),
      googleBtn, toggleBtn, skipBtn
    ]);
    root.appendChild(authContainer);
  }

  App.auth = { renderAuthScreen };
})(window.App = window.App || {});