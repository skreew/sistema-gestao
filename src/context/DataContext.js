import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useTransition,
} from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './Auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [produtosDeCompra, setProdutosDeCompra] = useState([]);
  const [produtosDeCompraBase, setProdutosDeCompraBase] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [allPedidos, setAllPedidos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [, startTransition] = useTransition();

  const loadedCollections = useRef(new Set());
  // CORREÇÃO: Total de coleções reduzido para 5
  const totalCollections = 5;

  const checkAllLoaded = () => {
    if (loadedCollections.current.size >= totalCollections) {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const unsubscribers = [];

    if (!user) {
      startTransition(() => {
        setFornecedores([]);
        setProdutosDeCompra([]);
        setProdutosDeCompraBase([]);
        setProdutos([]);
        setAllPedidos([]);
        setVendas([]);
        setLoadingData(false);
      });
      loadedCollections.current.clear();
      return;
    }

    setLoadingData(true);
    loadedCollections.current.clear();

    const createSnapshotListener = (
      collectionName,
      setStateFunc,
      orderField = 'nome',
      orderDirection = 'asc',
    ) => {
      const q = query(
        collection(db, collectionName),
        orderBy(orderField, orderDirection),
      );
      const unsubscribe = onSnapshot(
        q,
        (s) => {
          startTransition(() => {
            setStateFunc(s.docs.map((d) => ({ ...d.data(), id: d.id })));
          });
          if (!loadedCollections.current.has(collectionName)) {
            loadedCollections.current.add(collectionName);
            checkAllLoaded();
          }
        },
        (error) => {
          console.error(`Erro ao escutar a coleção ${collectionName}:`, error);
        },
      );
      unsubscribers.push(unsubscribe);
    };

    // CORREÇÃO: Listeners de 'faturamentos' e 'despesas' foram removidos daqui
    createSnapshotListener('fornecedores', setFornecedores, 'nome', 'asc');
    createSnapshotListener('produtosFinais', setProdutos, 'nome', 'asc');
    createSnapshotListener(
      'pedidosRealizados',
      setAllPedidos,
      'criadoEm',
      'desc',
    );
    createSnapshotListener('vendas', setVendas, 'dataVenda', 'desc');

    const qProdutosCompraBase = query(
      collection(db, 'produtosDeCompra'),
      orderBy('nome'),
    );
    const unsubscribeProdutosDeCompraBase = onSnapshot(
      qProdutosCompraBase,
      (snapshot) => {
        startTransition(() => {
          setProdutosDeCompraBase(
            snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
          );
        });
      },
    );
    unsubscribers.push(unsubscribeProdutosDeCompraBase);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchAndEnrichProducts = async () => {
      if (
        produtosDeCompraBase.length === 0 &&
        loadedCollections.current.size < totalCollections - 1
      )
        return;

      const itemsWithPricesPromises = produtosDeCompraBase.map(async (item) => {
        const historicoRef = collection(
          db,
          'produtosDeCompra',
          item.id,
          'historicoPrecos',
        );
        const historicoSnapshot = await getDocs(
          query(historicoRef, orderBy('data', 'desc')),
        );
        const allPriceRecords = historicoSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        if (allPriceRecords.length > 0) {
          const bestPriceRecord = [...allPriceRecords].sort(
            (a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise,
          )[0];
          item.bestPrice = bestPriceRecord.precoPorUnidadeAnalise;
          item.bestPriceFornecedorId = bestPriceRecord.fornecedorId;
        } else {
          item.bestPrice = null;
          item.bestPriceFornecedorId = null;
        }
        item.historicoPrecos = allPriceRecords;
        return item;
      });

      const resolvedItems = await Promise.all(itemsWithPricesPromises);
      startTransition(() => {
        setProdutosDeCompra(resolvedItems);
      });

      if (!loadedCollections.current.has('produtosDeCompra')) {
        loadedCollections.current.add('produtosDeCompra');
        checkAllLoaded();
      }
    };

    fetchAndEnrichProducts();
  }, [produtosDeCompraBase, user]);

  const value = {
    fornecedores,
    produtosDeCompra,
    produtos,
    allPedidos,
    vendas,
    loadingData, // Faturamentos e Despesas foram removidos
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
