import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// ATENÇÃO: Substitua pelas suas credenciais do Firebase
// É altamente recomendável usar variáveis de ambiente (.env) para armazenar essas chaves.
const firebaseConfig = {
  apiKey: "AIzaSyDrROaFFo6xjrkn4FhKWdY1c4Z0Jyy6SNw",
  authDomain: "sistema-gestao-1a0cd.firebaseapp.com",
  projectId: "sistema-gestao-1a0cd",
  storageBucket: "sistema-gestao-1a0cd.appspot.com",
  messagingSenderId: "715681926217",
  appId: "1:715681926217:web:7b4ed090a6c2aa2afec398",
  measurementId: "G-Z2KJC3GMNE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics };