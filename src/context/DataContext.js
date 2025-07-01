import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './Auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [fornecedores, setFornecedores] = useState([]);
    const [produtosDeCompra, setProdutosDeCompra] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [allPedidos, setAllPedidos] = useState([]);
    const [faturamentos, setFaturamentos] = useState([]);
    const [despesas, setDespesas] = useState([]);
    const [estoque, setEstoque] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) {
            setFornecedores([]);
            setProdutosDeCompra([]);
            setProdutos([]);
            setAllPedidos([]);
            setFaturamentos([]);
            setDespesas([]);
            setEstoque([]);
            setLoadingData(false);
            return;
        }

        setLoadingData(true);
        const unsubscribers = [];

        // Fornecedores
        unsubscribers.push(onSnapshot(query(collection(db, "fornecedores"), orderBy("nome")), (s) => setFornecedores(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Produtos Finais
        unsubscribers.push(onSnapshot(query(collection(db, "produtosFinais"), orderBy("nome")), (s) => setProdutos(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Pedidos
        unsubscribers.push(onSnapshot(query(collection(db, "pedidosRealizados"), orderBy("criadoEm", "desc")), (s) => setAllPedidos(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Financeiro
        unsubscribers.push(onSnapshot(query(collection(db, "faturamento"), orderBy("data", "desc")), (s) => setFaturamentos(s.docs.map(d => ({...d.data(), id: d.id})))));
        unsubscribers.push(onSnapshot(query(collection(db, "despesas"), orderBy("data", "desc")), (s) => setDespesas(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Estoque
        unsubscribers.push(onSnapshot(query(collection(db, "estoque"), orderBy("nome")), (s) => setEstoque(s.docs.map(d => ({...d.data(), id: d.id})))));

        // Insumos com subcoleção de preços
        const qProdutosCompra = query(collection(db, "produtosDeCompra"), orderBy("nome"));
        unsubscribers.push(onSnapshot(qProdutosCompra, async (snapshot) => {
            const itemsWithPrices = await Promise.all(snapshot.docs.map(async (doc) => {
                const item = { id: doc.id, ...doc.data() };
                const historicoRef = collection(db, "produtosDeCompra", doc.id, "historicoPrecos");
                // NOTA: orderBy e limit podem ser usados aqui, mas para simplificar, estamos pegando tudo
                const historicoSnapshot = await getDocs(query(historicoRef, orderBy("dataCompra", "desc")));

                // Filtra apenas os registros de 'compra' para o bestPrice inicial, mas considera 'oferta' também
                const allPriceRecords = historicoSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                if (allPriceRecords.length > 0) {
                    // Encontra o melhor preço (menor precoPorUnidadeAnalise) entre compras e ofertas
                    const bestPriceRecord = [...allPriceRecords].sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise)[0];
                    item.bestPrice = bestPriceRecord.precoPorUnidadeAnalise;
                    item.bestPriceFornecedorId = bestPriceRecord.fornecedorId;
                } else {
                    item.bestPrice = null;
                    item.bestPriceFornecedorId = null;
                }
                item.historicoPrecos = allPriceRecords; // Armazena todos os registros (compras e ofertas)
                return item;
            }));
            setProdutosDeCompra(itemsWithPrices);
            setLoadingData(false);
        }));

        const initialLoadTimeout = setTimeout(() => {
            setLoadingData(false); // Fallback para garantir que o loading termine mesmo sem dados
        }, 10000); // 10 segundos de timeout

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(initialLoadTimeout);
        };
    }, [user]);

    const value = { fornecedores, produtosDeCompra, produtos, allPedidos, faturamentos, despesas, estoque, loadingData };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
export const useData = () => useContext(DataContext);