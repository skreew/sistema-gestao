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
  limit,
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

// --- FUNÇÃO ADICIONADA AQUI ---
// Adiciona um documento a uma subcoleção
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
  try {
    const q = query(
      collection(db, collectionName),
      where(field, '==', value),
      limit(1),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    const foundDocId = querySnapshot.docs[0].id;
    if (excludeId && foundDocId === excludeId) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar existência do documento:', error);
    return true;
  }
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
