import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, increment } from "firebase/firestore";

export const addDocument = (collectionName, data) => {
    return addDoc(collection(db, collectionName), {
        ...data,
        criadoEm: serverTimestamp()
    });
};

export const updateDocument = (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    return updateDoc(docRef, {
        ...data,
        atualizadoEm: serverTimestamp()
    });
};

export const deleteDocument = (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    return deleteDoc(docRef);
};

export const setDocument = (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    // Use merge:true para criar se não existe, ou atualizar campos sem sobrescrever o documento inteiro.
    // Essencial para manter o 'criadoEm' ao atualizar.
    return setDoc(docRef, {
        ...data,
        atualizadoEm: serverTimestamp()
    }, { merge: true }); 
};

export const incrementField = (collectionName, docId, field, value) => {
    const docRef = doc(db, collectionName, docId);
    return updateDoc(docRef, {
        [field]: increment(value)
    });
};