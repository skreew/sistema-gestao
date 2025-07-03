import { db } from '../firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  query,
  where,
  getDocs,
  runTransaction,
} from 'firebase/firestore';

export const addDocument = (collectionName, data) =>
  addDoc(collection(db, collectionName), {
    ...data,
    criadoEm: serverTimestamp(),
  });
export const updateDocument = (collectionName, docId, data) =>
  updateDoc(doc(db, collectionName, docId), {
    ...data,
    atualizadoEm: serverTimestamp(),
  });
export const deleteDocument = (collectionName, docId) =>
  deleteDoc(doc(db, collectionName, docId));
export const setDocument = (collectionName, docId, data) =>
  setDoc(
    doc(db, collectionName, docId),
    { ...data, atualizadoEm: serverTimestamp() },
    { merge: true },
  );
export const addDocumentToSubcollection = (parent, parentId, sub, data) =>
  addDoc(collection(db, parent, parentId, sub), {
    ...data,
    criadoEm: serverTimestamp(),
  });

export const checkIfDocumentExists = async (
  collectionName,
  field,
  value,
  excludeId = null,
) => {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const querySnapshot = await getDocs(q);
  let exists = false;
  querySnapshot.forEach((doc) => {
    if (doc.id !== excludeId) {
      exists = true;
    }
  });
  return exists;
};

export const addPurchaseTransaction = async (
  insumoId,
  purchaseRecord,
  expenseRecord,
) => {
  const insumoRef = doc(db, 'produtosDeCompra', insumoId);
  const historicoRef = collection(insumoRef, 'historicoPrecos');
  const despesasRef = collection(db, 'despesas');

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(doc(historicoRef), {
        ...purchaseRecord,
        criadoEm: serverTimestamp(),
      });

      transaction.set(doc(despesasRef), {
        ...expenseRecord,
        criadoEm: serverTimestamp(),
      });
    });
    console.log('Transação de compra e despesa concluída com sucesso!');
  } catch (e) {
    console.error('Erro na transação de compra e despesa: ', e);
    throw new Error('Falha na transação de compra e despesa: ' + e.message);
  }
};
