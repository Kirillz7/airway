import { db } from './firebase.js';
import {
  doc, getDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const REAL_CASE_IDS = [
  'adult', 'child', 'infant', 'pregnant',
  'self', 'burn', 'bleeding', 'fracture'
];

export const ACHIEVEMENTS = {
  first_case: { icon: '🎯', title: 'Первый шаг', desc: 'Пройден первый кейс' },
  all_cases: { icon: '🏆', title: 'Спасатель', desc: `Пройдены все ${REAL_CASE_IDS.length} кейсов` },
  perfect: { icon: '⭐', title: 'Идеально', desc: 'Кейс пройден без ошибок' },
  fast: { icon: '⚡', title: 'Скорость', desc: 'Кейс пройден быстрее 30 секунд' },
  expert: { icon: '🎓', title: 'Эксперт', desc: 'Набрано 500 XP' }
};

export async function saveResult(userId, caseId, score, time) {
  const isChallenge = caseId === 'challenge';

  await addDoc(collection(db, "results"), {
    userId, caseId, score, time, date: new Date().toISOString()
  });

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return { newAchievements: [], xpGain: 0 };

  const userData = userSnap.data();
  const xpGain = Math.max(5, Math.floor(score / 10));
  const newXp = (userData.xp || 0) + xpGain;
  const newLevel = Math.floor(newXp / 100) + 1;

  const currentAchievements = userData.achievements || [];
  const completedCases = (userData.completedCases || [])
    .filter(id => REAL_CASE_IDS.includes(id));

  if (!isChallenge && REAL_CASE_IDS.includes(caseId) && !completedCases.includes(caseId)) {
    completedCases.push(caseId);
  }

  const newAchievements = [];
  const tryAdd = (id) => {
    if (!currentAchievements.includes(id)) {
      currentAchievements.push(id);
      newAchievements.push({ id, ...ACHIEVEMENTS[id] });
    }
  };

  if (completedCases.length >= 1) tryAdd('first_case');
  if (completedCases.length >= REAL_CASE_IDS.length) tryAdd('all_cases');
  if (!isChallenge && score >= 100) tryAdd('perfect');
  if (!isChallenge && time <= 30) tryAdd('fast');
  if (newXp >= 500) tryAdd('expert');

  await updateDoc(userRef, {
    xp: newXp,
    level: newLevel,
    achievements: currentAchievements,
    completedCases
  });

  return { newAchievements, xpGain, newLevel };
}

export async function getLeaderboard(limitCount = 20) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("xp", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  const leaders = [];
  snap.forEach((d) => leaders.push({ id: d.id, ...d.data() }));
  return leaders;
}

/**
 * Начисляет XP напрямую (например, за ежедневный вход).
 * Возвращает массив новых достижений, чтобы UI мог показать тост.
 */
export async function addDirectXP(userId, amount) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return { newAchievements: [] };

  const data = userSnap.data();
  const currentXp = data.xp || 0;
  const newXp = currentXp + amount;
  const newLevel = Math.floor(newXp / 100) + 1;

  const achievements = data.achievements || [];
  const newAchievements = [];
  const tryAdd = (id) => {
    if (!achievements.includes(id)) {
      achievements.push(id);
      newAchievements.push({ id, ...ACHIEVEMENTS[id] });
    }
  };

  // Проверка expert после любого прироста XP
  if (newXp >= 500) tryAdd('expert');
  // Если XP уже было >= 500, но достижения не было — тоже выдаём
  if (currentXp >= 500) tryAdd('expert');

  await updateDoc(userRef, { xp: newXp, level: newLevel, achievements });

  return { newAchievements, xp: newXp, level: newLevel };
}