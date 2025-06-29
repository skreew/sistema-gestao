import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signInAnonymously, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoadingAuth(true);
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                const role = currentUser.isAnonymous 
                    ? 'colaborador' 
                    : (userDocSnap.exists() && userDocSnap.data().role === 'gestor' ? 'gestor' : 'colaborador');
                setUserRole(role);
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoadingAuth(false);
        });
        return unsubscribe;
    }, []);

    const loginGestor = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const loginColaborador = () => signInAnonymously(auth);
    const logout = () => signOut(auth);

    const value = { user, userRole, loadingAuth, loginGestor, loginColaborador, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);