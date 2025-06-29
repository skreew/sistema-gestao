import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrROaFFo6xjrkn4FhKWdY1c4Z0Jyy6SNw",
  authDomain: "sistema-gestao-1a0cd.firebaseapp.com",
  projectId: "sistema-gestao-1a0cd",
  storageBucket: "sistema-gestao-1a0cd.firebasestorage.app",
  messagingSenderId: "715681926217",
  appId: "1:715681926217:web:7b4ed090a6c2aa2afec398",
  measurementId: "G-Z2KJC3GMNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics };