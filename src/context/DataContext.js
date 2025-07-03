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
  const [produtosDeCompra, setProdutosDeCompra] = useState([]); // This will hold the enriched data
  const [produtosDeCompraBase, setProdutosDeCompraBase] = useState([]); // Temporary state for products without history
  const [produtos, setProdutos] = useState([]);
  const [allPedidos, setAllPedidos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [faturamentos, setFaturamentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [, startTransition] = useTransition(); // Removed isPending as it's not used in UI

  const loadedCollections = useRef(new Set());
  // Total collections to track for initial loading, including the enriched produtosDeCompra
  const totalCollections = 7; // fornecedores, produtosFinais, pedidosRealizados, vendas, faturamentos, despesas, produtosDeCompra (enriched)

  const checkAllLoaded = () => {
    if (loadedCollections.current.size >= totalCollections) {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const unsubscribers = [];

    if (!user) {
      // Reset all states when user logs out
      startTransition(() => {
        setFornecedores([]);
        setProdutosDeCompra([]);
        setProdutosDeCompraBase([]); // Reset this too
        setProdutos([]);
        setAllPedidos([]);
        setVendas([]);
        setFaturamentos([]);
        setDespesas([]);
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
      const unsubscribe = onSnapshot(q, (s) => {
        startTransition(() => {
          setStateFunc(s.docs.map((d) => ({ ...d.data(), id: d.id })));
        });
        if (!loadedCollections.current.has(collectionName)) {
          loadedCollections.current.add(collectionName);
          // Sempre chame checkAllLoaded após uma coleção ser processada, independentemente do nome.
          // O tratamento especial para 'produtosDeCompra' está em seu useEffect dedicado.
          checkAllLoaded();
        }
      });
      unsubscribers.push(unsubscribe);
    };

    // Standard listeners for other collections
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

    // Listener for base produtosDeCompra data (without history yet)
    // This will populate produtosDeCompraBase, and a separate effect will enrich it
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
        // Não chame checkAllLoaded aqui, pois a busca do histórico é uma etapa separada.
      },
    );
    unsubscribers.push(unsubscribeProdutosDeCompraBase);

    // Set a timeout to eventually stop loading if something goes wrong
    const initialLoadTimeout = setTimeout(() => {
      if (loadingData) {
        setLoadingData(false);
        console.warn(
          'O carregamento de dados expirou. Alguns dados podem não ter sido totalmente carregados.',
        );
      }
    }, 15000); // 15 seconds timeout

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      clearTimeout(initialLoadTimeout);
    };
  }, [user, loadingData]); // Depende do usuário para reexecutar quando a autenticação muda

  // Novo useEffect para buscar historicoPrecos uma vez que produtosDeCompraBase é carregado
  useEffect(() => {
    // Prossiga apenas se produtosDeCompraBase tiver dados ou se estiver vazio, mas precisamos marcá-lo como carregado
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

        // Resolve todas as promessas de busca de subcoleções
        const resolvedItems = await Promise.all(itemsWithPricesPromises);
        startTransition(() => {
          setProdutosDeCompra(resolvedItems); // Atualiza o estado principal de produtosDeCompra com dados enriquecidos
        });

        // Marca produtosDeCompra como carregado somente após seu histórico ser buscado
        if (!loadedCollections.current.has('produtosDeCompra')) {
          loadedCollections.current.add('produtosDeCompra');
          checkAllLoaded();
        }
      };
      fetchAndEnrichProducts();
    } else if (
      produtosDeCompraBase.length === 0 &&
      !loadedCollections.current.has('produtosDeCompra') &&
      loadedCollections.current.has('fornecedores')
    ) {
      // Se produtosDeCompraBase estiver vazio, mas outras coleções estiverem carregadas, e produtosDeCompra não estiver marcado,
      // então marca produtosDeCompra como carregado (com um array vazio).
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
    produtosDeCompra, // Isso agora contém os dados enriquecidos
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
