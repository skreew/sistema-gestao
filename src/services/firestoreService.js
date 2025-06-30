import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from "firebase/firestore";

// O parâmetro 'addTimestamp' controla se o campo 'criadoEm' deve ser adicionado.
// Útil para coleções como fluxo de caixa onde a data é manual.
export const addDocument = (collectionName, data, addTimestamp = true) => {
    const dataToSave = addTimestamp ? { ...data, criadoEm: serverTimestamp() } : data;
    return addDoc(collection(db, collectionName), dataToSave);
};

export const updateDocument = (collectionName, docId, data) => updateDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() });
export const deleteDocument = (collectionName, docId) => deleteDoc(doc(db, collectionName, docId));
export const setDocument = (collectionName, docId, data) => setDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() }, { merge: true });
export const addDocumentToSubcollection = (parent, parentId, sub, data) => addDoc(collection(db, parent, parentId, sub), { ...data, criadoEm: serverTimestamp() });