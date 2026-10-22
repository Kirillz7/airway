import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgILLGEq7bHtLgFebwt_mqKWRwWEmM_zg",
  authDomain: "airway-simulator.firebaseapp.com",
  projectId: "airway-simulator",
  storageBucket: "airway-simulator.firebasestorage.app",
  messagingSenderId: "595475247133",
  appId: "1:595475247133:web:86a01c6ea41d8efbe456f4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Провайдеры
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');