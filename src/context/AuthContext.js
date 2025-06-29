import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
                if (userDocSnap.exists()) {
                    setUserRole(userDocSnap.data().role);
                } else {
                    // Se o documento não existe, pode ser um novo usuário
                    // A role será definida durante o cadastro
                    setUserRole(null);
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoadingAuth(false);
        });
        return unsubscribe;
    }, []);

    const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const registerUser = async (email, password, role = 'colaborador') => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Cria um documento para o usuário com sua role
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            role: role,
            criadoEm: new Date()
        });
        return userCredential;
    };

    const logout = () => signOut(auth);

    const value = { user, userRole, loadingAuth, loginUser, registerUser, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);