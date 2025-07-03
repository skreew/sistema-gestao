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
  const [produtosDeCompra, setProdutosDeCompra] = useState([]); // Isso irá conter os dados enriquecidos
  const [produtosDeCompraBase, setProdutosDeCompraBase] = useState([]); // Estado temporário para produtos sem histórico
  const [produtos, setProdutos] = useState([]);
  const [allPedidos, setAllPedidos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [faturamentos, setFaturamentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [, startTransition] = useTransition();

  const loadedCollections = useRef(new Set());
  // Total de coleções para rastrear o carregamento inicial
  const totalCollections = 7; // fornecedores, produtosFinais, pedidosRealizados, vendas, faturamentos, despesas, produtosDeCompra (enriquecidos)

  const checkAllLoaded = () => {
    if (loadedCollections.current.size >= totalCollections) {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const unsubscribers = [];

    if (!user) {
      // Redefine todos os estados quando o usuário faz logout
      startTransition(() => {
        setFornecedores([]);
        setProdutosDeCompra([]);
        setProdutosDeCompraBase([]);
        setProdutos([]);
        setAllPedidos([]);
        setVendas([]);
        setFaturamentos([]);
        setDespesas([]);
        setLoadingData(false); // Define como false, pois não há dados para carregar
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

    // Listeners padrão para outras coleções
    createSnapshotListener('fornecedores', setFornecedores, 'nome', 'asc');
    createSnapshotListener('produtosFinais', setProdutos, 'nome', 'asc');
    createSnapshotListener(
      'pedidosRealizados',
      setAllPedidos,
      'criadoEm',
      'desc',
    );
    createSnapshotListener('vendas', setVendas, 'dataVenda', 'desc');
    createSnapshotListener('faturamentos', setFaturamentos, 'data', 'desc');
    createSnapshotListener('despesas', setDespesas, 'data', 'desc');

    // Listener para dados base de produtosDeCompra (ainda sem histórico)
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
      (error) => {
        console.error('Erro ao escutar a coleção produtosDeCompra:', error);
      },
    );
    unsubscribers.push(unsubscribeProdutosDeCompraBase);

    const initialLoadTimeout = setTimeout(() => {
      if (loadingData) {
        setLoadingData(false);
        console.warn(
          'O carregamento de dados expirou. Alguns dados podem não ter sido totalmente carregados.',
        );
      }
    }, 15000);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      clearTimeout(initialLoadTimeout);
    };
  }, [user]); // Efeito depende apenas do usuário para reexecutar

  // Novo useEffect para buscar historicoPrecos uma vez que produtosDeCompraBase é carregado
  useEffect(() => {
    // Prossiga apenas se houver um usuário logado
    if (!user) return;

    // Condição para iniciar o enriquecimento de dados
    if (
      produtosDeCompraBase.length > 0 ||
      (!loadedCollections.current.has('produtosDeCompra') &&
        loadedCollections.current.has('fornecedores'))
    ) {
      const fetchAndEnrichProducts = async () => {
        const itemsWithPricesPromises = produtosDeCompraBase.map(
          async (item) => {
            const historicoRef = collection(
              db,
              'produtosDeCompra',
              item.id,
              'historicoPrecos',
            );
            const historicoSnapshot = await getDocs(
              query(historicoRef, orderBy('dataCompra', 'desc')),
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
          },
        );

        const resolvedItems = await Promise.all(itemsWithPricesPromises);
        startTransition(() => {
          setProdutosDeCompra(resolvedItems);
        });

        if (!loadedCollections.current.has('produtosDeCompra')) {
          loadedCollections.current.add('produtosDeCompra');
          checkAllLoaded();
        }
      };

      // *** CORREÇÃO: Chamando a função para que ela seja executada ***
      fetchAndEnrichProducts();
    } else if (
      produtosDeCompraBase.length === 0 &&
      !loadedCollections.current.has('produtosDeCompra') &&
      loadedCollections.current.has('fornecedores')
    ) {
      startTransition(() => {
        setProdutosDeCompra([]);
      });
      if (!loadedCollections.current.has('produtosDeCompra')) {
        loadedCollections.current.add('produtosDeCompra');
        checkAllLoaded();
      }
    }
  }, [produtosDeCompraBase, user]); // Depende de produtosDeCompraBase e user

  const value = {
    fornecedores,
    produtosDeCompra,
    produtos,
    allPedidos,
    vendas,
    faturamentos,
    despesas,
    loadingData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
