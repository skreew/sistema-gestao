import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUser(currentUser);
                    const data = userDocSnap.data();
                    setUserRole(data.role);
                    setUserProfile(data);
                } else {
                    // Se o doc não existe no Firestore, desloga para segurança
                    await signOut(auth);
                }
            } else {
                setUser(null);
                setUserRole(null);
                setUserProfile(null);
            }
            setLoadingAuth(false);
        });
        return unsubscribe;
    }, []);

    const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const registerUser = async (email, password, role) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const onboardingComplete = role === 'gestor' ? false : true;
        await setDoc(doc(db, "users", newUser.uid), {
            uid: newUser.uid,
            email: newUser.email,
            role: role,
            criadoEm: new Date(),
            onboardingComplete: onboardingComplete
        });
        return userCredential;
    };

    const updateOnboardingStatus = async (uid, status) => {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, { onboardingComplete: status });
        setUserProfile(prev => ({ ...prev, onboardingComplete: status }));
    };

    const logout = () => signOut(auth);

    const value = { user, userRole, userProfile, loadingAuth, loginUser, registerUser, logout, updateOnboardingStatus };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);