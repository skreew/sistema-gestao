import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user, userRole } = useAuth();
    const [fornecedores, setFornecedores] = useState([]);
    const [produtosDeCompra, setProdutosDeCompra] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [allPedidos, setAllPedidos] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) {
            setFornecedores([]);
            setProdutosDeCompra([]);
            setInsumos([]);
            setProdutos([]);
            setAllPedidos([]);
            return;
        }

        const collectionsToFetch = [
            { name: "fornecedores", setter: setFornecedores, orderByField: "nome" },
            { name: "produtosDeCompra", setter: setProdutosDeCompra, orderByField: "nome" },
            { name: "pedidosRealizados", setter: setAllPedidos, orderByField: "criadoEm", orderDirection: "desc" }
        ];

        if (userRole === 'gestor') {
            collectionsToFetch.push({ name: "insumos", setter: setInsumos, orderByField: "nome" });
            collectionsToFetch.push({ name: "produtosFinais", setter: setProdutos, orderByField: "nome" });
        }

        setLoadingData(true);
        const unsubscribers = collectionsToFetch.map(coll => {
            const q = query(collection(db, coll.name), orderBy(coll.orderByField, coll.orderDirection || 'asc'));
            return onSnapshot(q, 
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    coll.setter(data);
                },
                (error) => {
                    console.error("Erro ao buscar coleção: ", coll.name, error);
                }
            );
        });
        setLoadingData(false);

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, userRole]);

    const value = { fornecedores, produtosDeCompra, insumos, produtos, allPedidos, loadingData };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);