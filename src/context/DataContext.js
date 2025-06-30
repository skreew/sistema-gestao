import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Importação corrigida
import { useAuth } from './Auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [fornecedores, setFornecedores] = useState([]);
    const [produtosDeCompra, setProdutosDeCompra] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [allPedidos, setAllPedidos] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) {
            // Limpa os dados ao deslogar
            setFornecedores([]);
            setProdutosDeCompra([]);
            setProdutos([]);
            setAllPedidos([]);
            setLoadingData(false);
            return;
        }

        setLoadingData(true);

        const unsubscribers = [];

        // Fornecedores
        const qFornecedores = query(collection(db, "fornecedores"), orderBy("nome"));
        unsubscribers.push(onSnapshot(qFornecedores, (snapshot) => {
            setFornecedores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }));

        // Produtos de Compra (Insumos) com seu histórico de preços
        const qProdutosCompra = query(collection(db, "produtosDeCompra"), orderBy("nome"));
        unsubscribers.push(onSnapshot(qProdutosCompra, async (snapshot) => {
            const itemsWithPrices = await Promise.all(snapshot.docs.map(async (doc) => {
                const item = { id: doc.id, ...doc.data() };
                const historicoRef = collection(db, "produtosDeCompra", doc.id, "historicoPrecos");
                const historicoSnapshot = await getDocs(query(historicoRef, orderBy("dataCompra", "desc")));

                item.historicoPrecos = historicoSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                if (item.historicoPrecos.length > 0) {
                    const bestPriceRecord = [...item.historicoPrecos].sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise)[0];
                    item.bestPrice = bestPriceRecord.precoPorUnidadeAnalise;
                    item.bestPriceFornecedorId = bestPriceRecord.fornecedorId;
                } else {
                    item.bestPrice = null;
                    item.bestPriceFornecedorId = null;
                }
                return item;
            }));
            setProdutosDeCompra(itemsWithPrices);
        }));

        // Produtos Finais (Fichas Técnicas)
        const qProdutosFinais = query(collection(db, "produtosFinais"), orderBy("nome"));
        unsubscribers.push(onSnapshot(qProdutosFinais, (snapshot) => {
            setProdutos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }));

        // Pedidos Realizados
        const qPedidos = query(collection(db, "pedidosRealizados"), orderBy("criadoEm", "desc"));
        unsubscribers.push(onSnapshot(qPedidos, (snapshot) => {
            setAllPedidos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }));

        setLoadingData(false);

        // Cleanup
        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    const value = { fornecedores, produtosDeCompra, produtos, allPedidos, loadingData };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
export const useData = () => useContext(DataContext);