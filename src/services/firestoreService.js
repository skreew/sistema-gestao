import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const addDocument = (collectionName, data) => addDoc(collection(db, collectionName), { ...data, criadoEm: serverTimestamp() });
export const updateDocument = (collectionName, docId, data) => updateDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() });
export const deleteDocument = (collectionName, docId) => deleteDoc(doc(db, collectionName, docId));
export const setDocument = (collectionName, docId, data) => setDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() }, { merge: true });
export const addDocumentToSubcollection = (parent, parentId, sub, data) => addDoc(collection(db, parent, parentId, sub), { ...data, criadoEm: serverTimestamp() });

/*
*** NOTA SOBRE CLOUD FUNCTIONS PARA AUTOMAÇÃO ***

Para uma aplicação de produção robusta, as seguintes automações devem ser implementadas
usando Firebase Cloud Functions:

1.  `onSaleFinalized`: Disparada quando uma venda é criada em `vendasPDV`.
    -   **Ação 1:** Debitar a quantidade de insumos correspondentes do `estoque`.
    -   **Ação 2:** Criar um novo documento de `faturamento` no Fluxo de Caixa.

2.  `onPurchaseOrOfferRegistered`: Disparada quando uma compra ou oferta é registada em `produtosDeCompra/{insumoId}/historicoPrecos`.
    -   **Ação 1 (para tipo 'compra'):** Incrementar a quantidade do insumo no `estoque`.
    -   **Ação 2 (para tipo 'compra', Opcional):** Criar um novo documento de `despesa` no Fluxo de Caixa.
    -   **Ação 3 (para ambos os tipos):** Recalcular e atualizar o campo `bestPrice` e `bestPriceFornecedorId` no documento pai `produtosDeCompra/{insumoId}`.
    -   **Ação 4:** Recalcular e atualizar o campo `cmvCalculado` em todos os `produtosFinais` que utilizam esse insumo.

Estas funções garantem a integridade dos dados e automatizam processos cruciais,
reduzindo a carga no frontend e a possibilidade de erro humano.
*/