import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  checkIfDocumentExists,
} from '../../services/firestoreService';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  IconeFichaTecnica,
  IconeEditar,
  IconeLixeira,
  IconeMais,
  IconeRemover,
  IconeCheck,
  IconeAlerta,
  IconeOlho,
} from '../../utils/icons';
import { formatarValor, formatarData } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';
import Modal from '../../components/ui/Modal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Função segura para garantir que o valor seja um número válido
const getSafeNumber = (val) => {
  if (val === null || val === undefined || String(val).trim() === '') return 0;
  const num = String(val).replace(',', '.');
  const parsed = parseFloat(num);
  return isNaN(parsed) ? 0 : parsed;
};

// --- Sub-componente para gerenciar as categorias ---
const GerenciarCategorias = () => {
  const { showToast, showConfirmationModal } = useUI();
  const [categorias, setCategorias] = useState([]);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorCategoria, setErrorCategoria] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'categorias'), orderBy('nome'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCategorias(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (error) => {
        console.error('Erro ao carregar categorias:', error);
        showToast('Erro ao carregar categorias.', 'error');
      },
    );
    return () => unsubscribe();
  }, [showToast]);

  const handleSaveCategoria = async (e) => {
    e.preventDefault();
    if (!nomeCategoria.trim()) {
      setErrorCategoria('O nome da categoria é obrigatório.');
      return;
    }
    setErrorCategoria('');
    if (isSaving) return;
    setIsSaving(true);

    try {
      const isDuplicate = await checkIfDocumentExists(
        'categorias',
        'nome',
        nomeCategoria.trim(),
        editingCategoria?.id,
      );
      if (isDuplicate) {
        showToast('Esta categoria já existe.', 'error');
        setIsSaving(false);
        return;
      }
      if (editingCategoria) {
        await updateDocument('categorias', editingCategoria.id, {
          nome: nomeCategoria.trim(),
        });
        showToast('Categoria atualizada com sucesso!');
      } else {
        await addDocument('categorias', { nome: nomeCategoria.trim() });
        showToast('Categoria criada com sucesso!');
      }
      setNomeCategoria('');
      setEditingCategoria(null);
    } catch (error) {
      showToast(`Erro ao salvar categoria: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategoria = (id) => {
    showConfirmationModal(
      'Apagar esta categoria não apaga os produtos já associados a ela. Deseja continuar?',
      async () => {
        try {
          await deleteDocument('categorias', id);
          showToast('Categoria apagada com sucesso.');
        } catch (error) {
          showToast(`Erro ao apagar categoria: ${error.message}`, 'error');
        }
      },
    );
  };

  return (
    <div className="card">
      <h4>Gerenciar Categorias de Produtos</h4>
      <p className="small-tip">
        Crie as categorias para organizar seus produtos, como "Pizzas",
        "Bebidas" ou "Sobremesas".
      </p>
      <form onSubmit={handleSaveCategoria} className="form-group-inline">
        <InputField
          label={
            editingCategoria
              ? `Editando "${editingCategoria.nome}"`
              : 'Nome da Nova Categoria'
          }
          value={nomeCategoria}
          onChange={(e) => {
            setNomeCategoria(e.target.value);
            setErrorCategoria('');
          }}
          placeholder="Ex: Lanches"
          required
          error={errorCategoria}
        />
        <button type="submit" className="button-primary" disabled={isSaving}>
          {isSaving
            ? 'Salvando...'
            : editingCategoria
              ? 'Atualizar'
              : 'Adicionar'}
        </button>
        {editingCategoria && (
          <button
            type="button"
            className="button-link"
            onClick={() => {
              setEditingCategoria(null);
              setNomeCategoria('');
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      <div
        className="list-container"
        style={{ maxHeight: '300px', marginTop: '1.5rem' }}
      >
        {categorias.length > 0 ? (
          categorias.map((cat) => (
            <div key={cat.id} className="list-item">
              <span>{cat.nome}</span>
              <div className="list-item-actions">
                <button
                  className="button-icon"
                  onClick={() => {
                    setEditingCategoria(cat);
                    setNomeCategoria(cat.nome);
                  }}
                  aria-label={`Editar ${cat.nome}`}
                >
                  <IconeEditar />
                </button>
                <button
                  className="button-icon danger"
                  onClick={() => handleDeleteCategoria(cat.id)}
                  aria-label={`Apagar ${cat.nome}`}
                >
                  <IconeLixeira />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state-inner">Nenhuma categoria criada.</p>
        )}
      </div>
    </div>
  );
};

// Sub-componente para a lista de produtos
const ListaDeProdutos = ({ onAddProductClick, onEditProduct }) => {
  const { produtos } = useData();
  const [categorias, setCategorias] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { showConfirmationModal, showToast } = useUI();

  useEffect(() => {
    const q = query(collection(db, 'categorias'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategorias(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return () => unsubscribe();
  }, []);

  const produtosAgrupados = useMemo(() => {
    return categorias
      .map((categoria) => ({
        ...categoria,
        produtos: produtos.filter((p) => p.categoriaId === categoria.id),
      }))
      .filter((categoria) => categoria.produtos.length > 0);
  }, [produtos, categorias]);

  const handleDelete = useCallback(
    (id) => {
      showConfirmationModal(
        'Apagar este produto e todas as suas variantes?',
        async () => {
          try {
            await deleteDocument('produtosFinais', id);
            showToast('Produto apagado com sucesso.', 'success');
          } catch (error) {
            showToast(`Erro ao apagar produto: ${error.message}`, 'error');
          }
        },
      );
    },
    [showConfirmationModal, showToast],
  );

  const DetalhesProdutoModal = ({ product, onClose }) => {
    if (!product) return null;
    return (
      <Modal
        title={`Detalhes: ${product.nome}`}
        onConfirm={onClose}
        showCancel={false}
        confirmText="Fechar"
      >
        <div className="space-y-4">
          <p>
            <strong>Categoria:</strong> {product.categoriaNome}
          </p>
          <h4 className="text-lg font-semibold">Variantes e Custos:</h4>
          {product.variantes.map((v, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg border">
              <h5 className="font-semibold">{v.nomeVariante}</h5>
              <p>
                CMV: <strong>{formatarValor(v.cmvCalculado)}</strong>
              </p>
              <p>
                Preço Sugerido (100%):{' '}
                <strong>{formatarValor(v.cmvCalculado * 2)}</strong>
              </p>
            </div>
          ))}
        </div>
      </Modal>
    );
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3>
          <IconeFichaTecnica /> Produtos Finais Registrados
        </h3>
        <button className="button-primary" onClick={onAddProductClick}>
          <IconeMais /> Cadastrar Novo Produto
        </button>
      </div>
      <div className="list-container">
        {produtos.length > 0 ? (
          produtosAgrupados.map((categoria) => (
            <details key={categoria.id} className="product-list-item" open>
              <summary>
                <div className="list-item-header category-header">
                  <h4>{categoria.nome}</h4>
                </div>
              </summary>
              {categoria.produtos.map((p) => (
                <div key={p.id} className="product-sub-item">
                  <div className="list-item-header">
                    <h5>{p.nome}</h5>
                    <div className="list-item-actions">
                      <button
                        className="button-icon"
                        onClick={() => {
                          setSelectedProduct(p);
                          setShowDetailModal(true);
                        }}
                        aria-label={`Ver detalhes de ${p.nome}`}
                      >
                        <IconeOlho />
                      </button>
                      <button
                        className="button-icon"
                        onClick={() => onEditProduct(p)}
                        aria-label={`Editar ${p.nome}`}
                      >
                        <IconeEditar />
                      </button>
                      <button
                        className="button-icon danger"
                        onClick={() => handleDelete(p.id)}
                        aria-label={`Apagar ${p.nome}`}
                      >
                        <IconeLixeira />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </details>
          ))
        ) : (
          <div className="empty-state">
            <IconeFichaTecnica />
            <h3>Nenhum Produto Final Registrado</h3>
            <p className="sub-text">
              Clique em "Cadastrar Novo Produto" para começar.
            </p>
          </div>
        )}
      </div>
      {showDetailModal && (
        <DetalhesProdutoModal
          product={selectedProduct}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

// Componente do formulário, agora separado
const ProdutoForm = ({ productToEdit, onCancel }) => {
  const { produtosDeCompra } = useData();
  const { showToast } = useUI();
  const [categorias, setCategorias] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ['Informações', 'Variantes', 'Ingredientes', 'Revisão'];

  const initialState = useCallback(
    () => ({
      nome: '',
      categoriaId: '',
      variantes: [
        {
          nomeVariante: 'Padrão',
          custoEmbalagem: '0',
          custoOperacional: '0',
          fichaTecnica: [],
        },
      ],
    }),
    [],
  );

  const [formState, setFormState] = useState(() =>
    productToEdit ? JSON.parse(JSON.stringify(productToEdit)) : initialState(),
  );
  const [editing] = useState(productToEdit ? productToEdit.id : null);
  const [varianteAtiva, setVarianteAtiva] = useState(0);
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [qtdInsumo, setQtdInsumo] = useState('');
  const [margemLucroPercentual, setMargemLucroPercentual] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'categorias'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategorias(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return () => unsubscribe();
  }, []);

  const activeVariante = formState.variantes[varianteAtiva];

  const handleVarianteFieldChange = useCallback(
    (field, value) => {
      setFormState((prev) => {
        const novasVariantes = [...prev.variantes];
        novasVariantes[varianteAtiva] = {
          ...novasVariantes[varianteAtiva],
          [field]: value,
        };
        return { ...prev, variantes: novasVariantes };
      });
    },
    [varianteAtiva],
  );

  const handleAddItem = useCallback(() => {
    if (!selectedInsumoId || !qtdInsumo) {
      showToast('Selecione o insumo e informe a quantidade primeiro.', 'error');
      return;
    }
    const insumo = produtosDeCompra.find((p) => p.id === selectedInsumoId);
    const qtd = getSafeNumber(qtdInsumo);
    if (!insumo || qtd <= 0 || !insumo.bestPrice) {
      showToast('Insumo inválido ou sem preço registrado.', 'error');
      return;
    }
    let displayUnit = insumo.unidadeAnalise;
    let conversionFactor = 1;
    if (insumo.unidadeAnalise === 'kg') {
      displayUnit = 'g';
      conversionFactor = 1000;
    } else if (insumo.unidadeAnalise === 'L') {
      displayUnit = 'ml';
      conversionFactor = 1000;
    }

    const novoItem = {
      itemDeCompraId: insumo.id,
      nome: insumo.nome,
      quantidade: qtd,
      unidade: displayUnit,
      custo: (qtd / conversionFactor) * insumo.bestPrice,
    };
    handleVarianteFieldChange('fichaTecnica', [
      ...(activeVariante.fichaTecnica || []),
      novoItem,
    ]);
    setSelectedInsumoId('');
    setQtdInsumo('');
  }, [
    selectedInsumoId,
    qtdInsumo,
    produtosDeCompra,
    showToast,
    handleVarianteFieldChange,
    activeVariante,
  ]);

  const handleRemoveItem = useCallback(
    (index) => {
      const novaFicha = activeVariante.fichaTecnica.filter(
        (_, i) => i !== index,
      );
      handleVarianteFieldChange('fichaTecnica', novaFicha);
    },
    [activeVariante, handleVarianteFieldChange],
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const categoriaNome =
        categorias.find((c) => c.id === formState.categoriaId)?.nome || '';
      const produtoData = {
        ...formState,
        categoriaNome,
        variantes: formState.variantes.map((v) => ({
          ...v,
          custoEmbalagem: getSafeNumber(v.custoEmbalagem),
          custoOperacional: getSafeNumber(v.custoOperacional),
          cmvCalculado:
            getSafeNumber(
              (v.fichaTecnica || []).reduce(
                (acc, item) => acc + getSafeNumber(item.custo),
                0,
              ),
            ) +
            getSafeNumber(v.custoEmbalagem) +
            getSafeNumber(v.custoOperacional),
        })),
      };
      if (editing) {
        await updateDocument('produtosFinais', editing, produtoData);
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        await addDocument('produtosFinais', produtoData);
        showToast('Produto salvo com sucesso!', 'success');
      }
      onCancel();
    } catch (error) {
      showToast(`Erro ao salvar produto: ${error.message}`, 'error');
      console.error('Erro ao salvar produto:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {editing
          ? `Editando Produto: ${productToEdit.nome}`
          : 'Cadastrar Novo Produto'}
      </h3>
      <form onSubmit={handleSave} noValidate>
        <fieldset>
          <legend>Etapa 1: Identificação do Produto</legend>
          <div className="form-grid-2-cols">
            <InputField
              label="Nome do Produto Final"
              type="text"
              value={formState.nome}
              onChange={(e) =>
                setFormState({ ...formState, nome: e.target.value })
              }
              required
              error={formErrors.nome}
              placeholder="Ex: Pizza de Calabresa"
            />
            <SelectField
              label="Categoria"
              name="categoriaId"
              value={formState.categoriaId}
              onChange={(e) =>
                setFormState({ ...formState, categoriaId: e.target.value })
              }
              options={[
                {
                  value: '',
                  label: 'Selecione uma categoria...',
                  disabled: true,
                },
                ...categorias.map((cat) => ({
                  value: cat.id,
                  label: cat.nome,
                })),
              ]}
              required
              error={formErrors.categoriaId}
            />
          </div>
        </fieldset>
        {/* O resto do formulário (variantes, ficha técnica, etc.) vai aqui */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="submit"
            className="button-primary"
            disabled={isSaving}
            style={{ marginLeft: '1rem' }}
          >
            <IconeCheck />{' '}
            {isSaving
              ? 'Salvando...'
              : editing
                ? 'Atualizar Produto'
                : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (VIEW) ---
const CmvView = () => {
  const [activeTab, setActiveTab] = useState('produtos');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { produtosDeCompra } = useData();
  const isDisabled = useMemo(
    () => !produtosDeCompra.some((item) => item.bestPrice),
    [produtosDeCompra],
  );

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setIsFormVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setEditingProduct(null);
  };

  if (isFormVisible) {
    return (
      <ProdutoForm productToEdit={editingProduct} onCancel={handleCloseForm} />
    );
  }

  return (
    <div>
      <div className="card">
        <h2>
          <IconeFichaTecnica /> Fichas Técnicas e Produtos
        </h2>
        <p>
          Aqui você organiza seus produtos em categorias e cria as receitas
          (fichas técnicas) para calcular o custo exato de cada item.
        </p>
      </div>
      <div className="variantes-tabs">
        <button
          className={activeTab === 'produtos' ? 'active' : ''}
          onClick={() => setActiveTab('produtos')}
        >
          Gerenciar Produtos
        </button>
        <button
          className={activeTab === 'categorias' ? 'active' : ''}
          onClick={() => setActiveTab('categorias')}
        >
          Gerenciar Categorias
        </button>
      </div>
      {activeTab === 'produtos' && (
        <ListaDeProdutos
          onAddProductClick={handleAddProductClick}
          onEditProduct={handleEditProduct}
          isDisabled={isDisabled}
        />
      )}
      {activeTab === 'categorias' && <GerenciarCategorias />}
    </div>
  );
};

export default CmvView;
