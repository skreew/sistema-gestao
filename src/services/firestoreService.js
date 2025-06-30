import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

export const addDocument = (collectionName, data) => addDoc(collection(db, collectionName), { ...data, criadoEm: serverTimestamp() });
export const updateDocument = (collectionName, docId, data) => updateDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() });
export const deleteDocument = (collectionName, docId) => deleteDoc(doc(db, collectionName, docId));
export const setDocument = (collectionName, docId, data) => setDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() }, { merge: true });
export const addDocumentToSubcollection = (parent, parentId, sub, data) => addDoc(collection(db, parent, parentId, sub), { ...data, criadoEm: serverTimestamp() });