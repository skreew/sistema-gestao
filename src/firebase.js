import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrROaFFo6xjrkn4FhKWdY1c4Z0Jyy6SNw", // Substitua com sua chave API real
  authDomain: "sistema-gestao-1a0cd.firebaseapp.com", // Substitua com seu domínio de autenticação real
  projectId: "sistema-gestao-1a0cd", // Substitua com seu ID de projeto real
  storageBucket: "sistema-gestao-1a0cd.appspot.com",
  messagingSenderId: "715681926217",
  appId: "1:715681926217:web:7b4ed090a6c2aa2afec398",
  measurementId: "G-Z2KJC3GMNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);