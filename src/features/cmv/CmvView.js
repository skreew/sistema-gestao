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
  IconeCirculo, // Used for progress indicator
  IconeOlho, // Used for view
} from '../../utils/icons';
import { formatarValor } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';
import Modal from '../../components/ui/Modal'; // Assuming this Modal component exists

// Import for Recharts (for the graph)
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

// Helper function to safely get a numeric string, handling commas and non-numeric values
const getSafeNumericString = (val) => {
  if (typeof val === 'string') {
    return val.replace(',', '.');
  }
  if (typeof val === 'number') {
    return String(val);
  }
  return '0'; // Default for null, undefined, etc.
};

// Sub-componente para gerenciar as categorias
const GerenciarCategorias = () => {
  const { showToast, showConfirmationModal } = useUI();
  const [categorias, setCategorias] = useState([]);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorCategoria, setErrorCategoria] = useState('');

  useEffect(() => {
    // Listener para categorias, ordenando por nome
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

  // Lida com o salvamento de uma nova categoria ou atualização de uma existente
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

  // Lida com a exclusão de uma categoria
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
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Gerenciar Categorias de Produtos
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Crie as categorias para organizar seus produtos, como "Pizzas",
        "Bebidas" ou "Sobremesas".
      </p>
      <form
        onSubmit={handleSaveCategoria}
        className="flex flex-col sm:flex-row gap-4 mb-6 items-end"
      >
        <div className="flex-grow">
          <InputField
            label={
              editingCategoria
                ? `Editando "${editingCategoria.nome}"`
                : 'Nome da Nova Categoria'
            }
            value={nomeCategoria}
            onChange={(e) => setNomeCategoria(e.target.value)}
            placeholder="Ex: Lanches"
            required
            error={errorCategoria}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
            disabled={isSaving}
          >
            {isSaving
              ? 'Salvando...'
              : editingCategoria
                ? 'Atualizar'
                : 'Adicionar'}
          </button>
          {editingCategoria && (
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
              onClick={() => {
                setEditingCategoria(null);
                setNomeCategoria('');
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
        {categorias.length > 0 ? (
          categorias.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0"
            >
              <span className="text-gray-700 text-base">{cat.nome}</span>
              <div className="flex gap-2">
                <button
                  className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition duration-200 ease-in-out"
                  onClick={() => {
                    setEditingCategoria(cat);
                    setNomeCategoria(cat.nome);
                  }}
                  aria-label={`Editar ${cat.nome}`}
                  title={`Editar ${cat.nome}`}
                >
                  <IconeEditar size={20} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-200 ease-in-out"
                  onClick={() => handleDeleteCategoria(cat.id)}
                  aria-label={`Apagar ${cat.nome}`}
                  title={`Apagar ${cat.nome}`}
                >
                  <IconeLixeira size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 p-6">
            Nenhuma categoria criada.
          </p>
        )}
      </div>
    </div>
  );
};

// Sub-componente para gerenciar os produtos finais (com wizard)
const GerenciarProdutosFinais = ({ isDisabled }) => {
  const { produtosDeCompra, produtos } = useData();
  const { showConfirmationModal, showToast } = useUI();
  const [categorias, setCategorias] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const steps = [
    'Informações Gerais',
    'Gestão de Variantes',
    'Ingredientes e Custos',
    'Revisão e Resumo',
  ];

  // Using useCallback for initialState to ensure a fresh object reference
  const initialState = useCallback(
    () => ({
      nome: '',
      categoriaId: '',
      variantes: [
        {
          nomeVariante: 'Padrão',
          custoEmbalagem: '0',
          custoOperacional: '0',
          fichaTecnica: [], // Array de objetos { itemDeCompraId, nome, quantidade, unidade, custo }
        },
      ],
    }),
    [],
  );

  const [formState, setFormState] = useState(initialState());
  const [editing, setEditing] = useState(null);
  const [varianteAtiva, setVarianteAtiva] = useState(0); // Index of the active variant
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [qtdInsumo, setQtdInsumo] = useState('');
  const [margemLucroPercentual, setMargemLucroPercentual] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState(null);

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

  const produtosAgrupados = useMemo(() => {
    return categorias
      .map((categoria) => ({
        ...categoria,
        produtos: produtos.filter((p) => p.categoriaId === categoria.id),
      }))
      .filter((categoria) => categoria.produtos.length > 0);
  }, [produtos, categorias]);

  const activeVariante = formState.variantes[varianteAtiva];

  const handleVarianteFieldChange = useCallback(
    (field, value) => {
      setFormState((prevFormState) => {
        const novasVariantes = prevFormState.variantes.map((variant, idx) => {
          if (idx === varianteAtiva) {
            return { ...variant, [field]: value };
          }
          return variant;
        });
        return { ...prevFormState, variantes: novasVariantes };
      });
      if (
        formErrors[`varianteNome${varianteAtiva}`] &&
        field === 'nomeVariante'
      ) {
        setFormErrors((prev) => ({
          ...prev,
          [`varianteNome${varianteAtiva}`]: '',
        }));
      }
    },
    [varianteAtiva, formErrors],
  );

  const selectedInsumo = useMemo(
    () => produtosDeCompra.find((p) => p.id === selectedInsumoId),
    [selectedInsumoId, produtosDeCompra],
  );

  const resetForm = useCallback(() => {
    setEditing(null);
    setFormState(initialState());
    setVarianteAtiva(0);
    setFormErrors({});
    setMargemLucroPercentual(100);
    setIsFormVisible(false);
    setCurrentStep(1);
  }, [initialState]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (currentStep === 1) {
      if (!formState.nome.trim())
        errors.nome = 'O nome do produto é obrigatório.';
      if (!formState.categoriaId)
        errors.categoriaId = 'Selecione uma categoria.';
    }
    if (currentStep === 2) {
      if (formState.variantes.length === 0) {
        errors.variantes = 'Adicione pelo menos uma variante.';
      }
    }
    if (currentStep === 3) {
      if (!activeVariante.nomeVariante.trim()) {
        errors[`varianteNome${varianteAtiva}`] =
          'O nome da variante é obrigatório.';
      }
      if (activeVariante.fichaTecnica.length === 0) {
        errors.fichaTecnica = 'Adicione pelo menos um insumo à ficha técnica.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState, activeVariante, currentStep, varianteAtiva]);

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep((prev) => prev + 1);
    } else {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const allErrors = {};
    if (!formState.nome.trim())
      allErrors.nome = 'O nome do produto é obrigatório.';
    if (!formState.categoriaId)
      allErrors.categoriaId = 'Selecione uma categoria.';
    formState.variantes.forEach((variante, index) => {
      if (!variante.nomeVariante.trim()) {
        allErrors[`varianteNome${index}`] = 'O nome da variante é obrigatório.';
      }
      if (variante.fichaTecnica.length === 0) {
        allErrors[`fichaTecnica${index}`] =
          `Adicione insumos para a variante "${variante.nomeVariante}".`;
      }
    });

    setFormErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      showToast(
        'Por favor, preencha todos os campos obrigatórios e adicione insumos a todas as variantes.',
        'error',
      );
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const categoriaNome =
        categorias.find((c) => c.id === formState.categoriaId)?.nome || '';
      const produtoData = {
        ...formState,
        categoriaNome,
        variantes: formState.variantes.map((v) => {
          const custoEmbalagem = parseFloat(
            getSafeNumericString(v.custoEmbalagem),
          );
          const custoOperacional = parseFloat(
            getSafeNumericString(v.custoOperacional),
          );

          const custoTotalItens = v.fichaTecnica.reduce((acc, item) => {
            const itemCusto = parseFloat(getSafeNumericString(item.custo)) || 0;
            return acc + itemCusto;
          }, 0);

          const cmvCalculado =
            custoTotalItens + custoEmbalagem + custoOperacional;
          const precoSugeridoVariante =
            cmvCalculado * (1 + margemLucroPercentual / 100);

          return {
            ...v,
            custoEmbalagem,
            custoOperacional,
            cmvCalculado,
            precoSugerido: precoSugeridoVariante,
          };
        }),
      };

      if (editing) {
        await updateDocument('produtosFinais', editing.id, produtoData);
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        await addDocument('produtosFinais', produtoData);
        showToast('Produto salvo com sucesso!', 'success');
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      showToast('Erro ao salvar produto: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedInsumoId || !qtdInsumo) {
      showToast('Selecione o insumo e informe a quantidade primeiro.', 'error');
      return;
    }
    const insumo = produtosDeCompra.find((p) => p.id === selectedInsumoId);
    const qtd = parseFloat(getSafeNumericString(qtdInsumo)); // Use safe numeric string here
    if (!insumo || isNaN(qtd) || qtd <= 0 || !insumo.bestPrice) {
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
      custo: parseFloat(
        ((qtd / conversionFactor) * insumo.bestPrice).toFixed(5),
      ), // Ensure custo is a number
    };

    setFormState((prevFormState) => {
      const updatedVariantes = prevFormState.variantes.map((variant, idx) => {
        if (idx === varianteAtiva) {
          return {
            ...variant,
            fichaTecnica: [...variant.fichaTecnica, novoItem],
          };
        }
        return variant;
      });

      return { ...prevFormState, variantes: updatedVariantes };
    });

    setSelectedInsumoId('');
    setQtdInsumo('');
    setFormErrors((prev) => ({ ...prev, fichaTecnica: '' }));
  };

  const handleRemoveItem = useCallback(
    (indexToRemove) => {
      setFormState((prevFormState) => {
        const updatedVariantes = prevFormState.variantes.map((variant, idx) => {
          if (idx === varianteAtiva) {
            const newFichaTecnica = variant.fichaTecnica.filter(
              (_, i) => i !== indexToRemove,
            );
            return {
              ...variant,
              fichaTecnica: newFichaTecnica,
            };
          }
          return variant;
        });

        return { ...prevFormState, variantes: updatedVariantes };
      });
    },
    [varianteAtiva],
  );

  const handleEdit = useCallback((p) => {
    setEditing(p.id);
    // Deep copy and normalize data for editing
    const normalizedProduct = {
      ...p,
      nome: p.nome || '', // Ensure product name is a string
      categoriaId: p.categoriaId || '', // Ensure categoryId is a string
      variantes: Array.isArray(p.variantes)
        ? p.variantes.map((v) => {
            const normalizedVariant = {
              nomeVariante: v.nomeVariante || 'Padrão',
              // Ensure these are always strings, even if they come as null/undefined/number
              custoEmbalagem: String(v.custoEmbalagem || '0'),
              custoOperacional: String(v.custoOperacional || '0'),
              fichaTecnica: Array.isArray(v.fichaTecnica)
                ? v.fichaTecnica.map((item) => ({
                    ...item,
                    // Ensure item.custo is a string, and also other relevant fields
                    custo: String(item.custo || '0'),
                    nome: item.nome || 'Insumo Desconhecido',
                    unidade: item.unidade || 'un',
                    quantidade: String(item.quantidade || '0'),
                  }))
                : [],
            };
            return normalizedVariant;
          })
        : [], // Ensure p.variantes is an array
    };
    setFormState(normalizedProduct);
    setVarianteAtiva(0);
    setFormErrors({});
    setIsFormVisible(true);
    setCurrentStep(1);
  }, []);

  const handleDelete = useCallback(
    (id) =>
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
      ),
    [showConfirmationModal, showToast],
  );

  const handleAddVariante = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      variantes: [
        ...prev.variantes,
        {
          nomeVariante: `Nova Variante ${prev.variantes.length + 1}`,
          custoEmbalagem: '0',
          custoOperacional: '0',
          fichaTecnica: [],
        },
      ],
    }));
    setVarianteAtiva(formState.variantes.length);
  }, [formState.variantes.length]);

  const handleRemoveVariante = useCallback(
    (index) => {
      if (formState.variantes.length === 1) {
        showToast('É necessário ter pelo menos uma variante.', 'error');
        return;
      }
      showConfirmationModal('Apagar esta variante?', () => {
        setFormState((prev) => {
          const novasVariantes = [...prev.variantes];
          novasVariantes.splice(index, 1);
          return { ...prev, variantes: novasVariantes };
        });
        setVarianteAtiva(0);
        showToast('Variante removida com sucesso.');
      });
    },
    [formState.variantes.length, showConfirmationModal, showToast],
  );

  const currentCmv = useMemo(() => {
    if (!activeVariante) return 0;
    const custoItens = activeVariante.fichaTecnica.reduce((acc, item) => {
      const itemCusto = parseFloat(getSafeNumericString(item.custo)) || 0;
      return acc + itemCusto;
    }, 0);
    const custoEmb = parseFloat(
      getSafeNumericString(activeVariante.custoEmbalagem),
    );
    const custoOp = parseFloat(
      getSafeNumericString(activeVariante.custoOperacional),
    );
    return custoItens + custoEmb + custoOp;
  }, [activeVariante]);

  const precoSugerido = useMemo(() => {
    return currentCmv * (1 + margemLucroPercentual / 100);
  }, [currentCmv, margemLucroPercentual]);

  const chartData = useMemo(() => {
    return formState.variantes.map((v) => {
      const custoTotalItens = v.fichaTecnica.reduce((acc, item) => {
        const itemCusto = parseFloat(getSafeNumericString(item.custo)) || 0;
        return acc + itemCusto;
      }, 0);
      const custoEmbalagem = parseFloat(getSafeNumericString(v.custoEmbalagem));
      const custoOperacional = parseFloat(
        getSafeNumericString(v.custoOperacional),
      );
      const cmvCalculado = custoTotalItens + custoEmbalagem + custoOperacional;
      const precoSugeridoVariante =
        cmvCalculado * (1 + margemLucroPercentual / 100);

      return {
        name: v.nomeVariante || 'Variante Sem Nome',
        CMV: parseFloat(cmvCalculado.toFixed(2)),
        'Preço Sugerido': parseFloat(precoSugeridoVariante.toFixed(2)),
      };
    });
  }, [formState.variantes, margemLucroPercentual]);

  const SaleDetailModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
      <Modal
        title={`Detalhes do Produto: ${product.nome}`}
        onConfirm={onClose}
        showCancel={false}
        confirmText="Fechar"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong>Categoria:</strong> {product.categoriaNome}
          </p>
          <h4 className="text-lg font-semibold text-gray-800">Variantes:</h4>
          {product.variantes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.variantes.map((v, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <h5 className="font-semibold text-gray-800 mb-2">
                    {v.nomeVariante}
                  </h5>
                  <p className="text-sm text-gray-600">
                    CMV:{' '}
                    <strong className="text-blue-600">
                      {formatarValor(v.cmvCalculado)}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Preço Sugerido:{' '}
                    <strong className="text-green-600">
                      {formatarValor(v.precoSugerido)}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Custo Embalagem: {formatarValor(v.custoEmbalagem)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Outros Custos: {formatarValor(v.custoOperacional)}
                  </p>
                  <h6 className="font-medium text-gray-700 mt-3 mb-1">
                    Ficha Técnica:
                  </h6>
                  {v.fichaTecnica.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {v.fichaTecnica.map((item, i) => (
                        <li key={i}>
                          {item.nome} - {item.quantidade}
                          {item.unidade} ({formatarValor(item.custo)})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nenhum insumo nesta variante.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Nenhuma variante registrada para este produto.
            </p>
          )}
        </div>
      </Modal>
    );
  };

  if (isFormVisible) {
    return (
      <div
        className={`bg-white shadow-md rounded-lg p-6 mb-6 ${isDisabled ? 'relative opacity-70' : ''}`}
      >
        {isDisabled && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <p className="text-center text-lg font-semibold text-gray-700 p-4 bg-white rounded-lg shadow-lg">
              <IconeAlerta
                size={32}
                className="inline-block mr-2 text-yellow-500"
              />
              Registre insumos com preço em 'Catálogo' para criar fichas
              técnicas.
            </p>
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {editing
            ? `Editando Produto: ${formState.nome}`
            : 'Cadastrar Novo Produto Final'}
        </h3>

        {/* Wizard Progress Indicator */}
        <div className="flex justify-between items-center mb-6 text-sm text-gray-600 relative">
          {/* Background line for all steps */}
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-gray-300 z-0"></div>
          {/* Dynamic green fill for the progress line */}
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-green-500 z-0 transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          ></div>

          {steps.map((stepName, index) => (
            <div key={index} className="flex flex-col items-center flex-1 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                ${currentStep === index + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}
                ${currentStep > index + 1 ? 'bg-green-500 text-white' : ''}`}
              >
                {currentStep > index + 1 ? <IconeCheck size={16} /> : index + 1}
              </div>
              <span
                className={`mt-2 text-center ${currentStep === index + 1 ? 'font-semibold text-blue-700' : 'text-gray-600'}`}
              >
                {stepName}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-6">
          {/* Step 1: Informações gerais do produto */}
          {currentStep === 1 && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                1. Informações Gerais do Produto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          )}

          {/* Step 2: Gestão de variantes (Simplified) */}
          {currentStep === 2 && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                2. Gestão de Variantes
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Renomeie a variante principal se necessário. Você gerenciará as
                demais variantes e seus ingredientes na próxima etapa.
              </p>
              {activeVariante && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="text-md font-semibold text-gray-700 mb-3">
                    Detalhes da Variante Principal:{' '}
                    {activeVariante.nomeVariante}
                  </h5>
                  <InputField
                    label="Nome da Variante Principal"
                    value={activeVariante.nomeVariante}
                    onChange={(e) =>
                      handleVarianteFieldChange('nomeVariante', e.target.value)
                    }
                    required
                    error={formErrors[`varianteNome${varianteAtiva}`]}
                    placeholder="Ex: Padrão ou Tamanho Família"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Ingredientes e custos (with Variant Tabs) */}
          {currentStep === 3 && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                3. Ingredientes e Custos
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Use as abas abaixo para alternar entre as variantes e
                adicionar/remover seus ingredientes.
              </p>

              {/* Variant Tabs - Now in Step 3 */}
              <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
                {formState.variantes.map((v, index) => (
                  <div key={index} className="flex items-center group">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                        ${
                          varianteAtiva === index
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      onClick={() => setVarianteAtiva(index)}
                      aria-label={`Selecionar variante ${v.nomeVariante}`}
                    >
                      {v.nomeVariante}
                    </button>
                    {formState.variantes.length > 1 && (
                      <button
                        type="button"
                        className="ml-1 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-200 ease-in-out"
                        onClick={() => handleRemoveVariante(index)}
                        aria-label={`Remover variante ${v.nomeVariante}`}
                        title="Remover Variante"
                      >
                        <IconeRemover size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition duration-200 ease-in-out flex items-center justify-center"
                  onClick={handleAddVariante}
                  title="Adicionar Nova Variante"
                  aria-label="Adicionar Nova Variante"
                >
                  <IconeMais size={20} />
                </button>
              </div>

              {/* Active Variant Details and Ingredient Management */}
              {activeVariante && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="text-md font-semibold text-gray-700 mb-3">
                    Ficha Técnica da{' '}
                    {activeVariante?.nomeVariante || 'Variante Atual'}
                  </h5>
                  <InputField
                    label="Nome da Variante"
                    value={activeVariante.nomeVariante}
                    onChange={(e) =>
                      handleVarianteFieldChange('nomeVariante', e.target.value)
                    }
                    required
                    error={formErrors[`varianteNome${varianteAtiva}`]}
                    placeholder="Ex: Tamanho Família"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InputField
                      label="Custo Embalagem (R$)"
                      type="number"
                      step="0.01"
                      value={activeVariante.custoEmbalagem}
                      onChange={(e) =>
                        handleVarianteFieldChange(
                          'custoEmbalagem',
                          e.target.value,
                        )
                      }
                      placeholder="Ex: 2.50"
                    />
                    <InputField
                      label="Outros Custos (R$)"
                      type="number"
                      step="0.01"
                      value={activeVariante.custoOperacional}
                      onChange={(e) =>
                        handleVarianteFieldChange(
                          'custoOperacional',
                          e.target.value,
                        )
                      }
                      placeholder="Ex: 1.00"
                    />
                  </div>

                  <div className="divider-soft" />
                  <p className="small-tip text-sm text-gray-600 mb-4">
                    Adicione os ingredientes e quantidades usados para produzir
                    este item.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4 items-end">
                    <div className="flex-grow">
                      <SelectField
                        label="Adicionar Insumo"
                        value={selectedInsumoId}
                        onChange={(e) => setSelectedInsumoId(e.target.value)}
                        options={[
                          { value: '', label: 'Selecione...', disabled: true },
                          ...produtosDeCompra
                            .filter((p) => p.bestPrice)
                            .map((p) => ({
                              value: p.id || '',
                              label: p.nome || 'Nome Indefinido',
                            })),
                        ]}
                        aria-label="Selecionar Insumo para adicionar à receita"
                      />
                    </div>
                    <InputField
                      label={`Qtd (${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un') : 'un'})`}
                      type="text"
                      value={qtdInsumo}
                      onChange={(e) => setQtdInsumo(e.target.value)}
                      placeholder="Ex: 150"
                      className="w-32"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                      aria-label="Adicionar Insumo"
                    >
                      <IconeMais size={20} /> Adicionar
                    </button>
                  </div>

                  {formErrors.fichaTecnica && (
                    <p className="text-red-500 text-sm mb-4">
                      {formErrors.fichaTecnica}
                    </p>
                  )}

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-h-60 overflow-y-auto">
                    {activeVariante?.fichaTecnica?.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Insumo
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Qtd.
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Custo
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeVariante.fichaTecnica.map((item, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                {item.nome}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                {item.quantidade}
                                {item.unidade}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                {formatarValor(item.custo)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-200 ease-in-out"
                                  onClick={() => handleRemoveItem(i)}
                                  aria-label={`Remover ${item.nome}`}
                                  title="Remover Insumo"
                                >
                                  <IconeLixeira size={20} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                        <IconeAlerta
                          size={32}
                          className="mb-2 text-yellow-500"
                        />
                        <p>Nenhum insumo adicionado a esta variante.</p>
                      </div>
                    )}
                  </div>
                  <p className="text-right font-bold text-lg text-gray-800 mt-4">
                    CMV Total da Variante:{' '}
                    <span className="text-blue-600">
                      {formatarValor(currentCmv)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Revisão e Resumo */}
          {currentStep === 4 && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                4. Revisão e Resumo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Informações do Produto
                  </h5>
                  <p>
                    <strong>Nome:</strong> {formState.nome}
                  </p>
                  <p>
                    <strong>Categoria:</strong>{' '}
                    {
                      categorias.find((c) => c.id === formState.categoriaId)
                        ?.nome
                    }
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Margem de Lucro
                  </h5>
                  <label
                    htmlFor="margemLucroPercentual"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Margem de Lucro Desejada:{' '}
                    <strong className="text-blue-600">
                      {Math.round(margemLucroPercentual)}%
                    </strong>
                  </label>
                  <input
                    type="range"
                    id="margemLucroPercentual"
                    min="0"
                    max="500"
                    value={margemLucroPercentual}
                    onChange={(e) =>
                      setMargemLucroPercentual(parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-right text-sm text-gray-600 mt-2">
                    Preço de Venda Sugerido (Variante{' '}
                    {activeVariante?.nomeVariante || 'Variante Atual'}):{' '}
                    <strong className="text-green-600 text-lg">
                      {formatarValor(precoSugerido)}
                    </strong>
                  </p>
                </div>
              </div>

              <h5 className="font-semibold text-gray-800 mb-3">
                Comparativo CMV vs Preço Sugerido por Variante
              </h5>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$ ${value.toFixed(2).replace('.', ',')}`
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        `R$ ${value.toFixed(2).replace('.', ',')}`
                      }
                    />
                    <Legend />
                    <Bar dataKey="CMV" fill="#8884d8" name="CMV" />
                    <Bar
                      dataKey="Preço Sugerido"
                      fill="#82ca9d"
                      name="Preço Sugerido"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
              >
                Voltar
              </button>
            )}
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                disabled={isSaving}
              >
                <IconeCheck size={20} className="inline-block mr-2" />
                {isSaving
                  ? editing
                    ? 'Atualizando...'
                    : 'Salvando...'
                  : editing
                    ? 'Atualizar Produto Final'
                    : 'Salvar Produto Final'}
              </button>
            )}
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out"
              onClick={resetForm}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <IconeFichaTecnica size={24} className="mr-2 text-blue-600" /> Produtos
        Finais Registrados
      </h3>
      <div className="mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out flex items-center"
          onClick={() => setIsFormVisible(true)}
          aria-label="Cadastrar Novo Produto"
        >
          <IconeMais size={20} className="mr-2" /> Cadastrar Novo Produto
        </button>
      </div>
      <div className="space-y-4">
        {produtos.length > 0 ? (
          produtosAgrupados.map((categoria) => (
            <details
              key={categoria.id}
              className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              open
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <h4 className="text-lg font-semibold text-gray-800">
                  {categoria.nome}
                </h4>
                <IconeCirculo size={20} className="text-gray-500" />{' '}
                {/* Placeholder for expand/collapse icon */}
              </summary>
              <div className="divide-y divide-gray-200">
                {categoria.produtos.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-base font-semibold text-gray-800">
                        {p.nome}
                      </h5>
                      <div className="flex gap-2">
                        <button
                          className="text-gray-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition duration-200 ease-in-out"
                          onClick={() => {
                            setSelectedProductForDetail(p);
                            setShowSaleDetailModal(true);
                          }}
                          aria-label={`Ver detalhes de ${p.nome}`}
                          title="Ver Detalhes"
                        >
                          <IconeOlho size={20} />
                        </button>
                        <button
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition duration-200 ease-in-out"
                          onClick={() => handleEdit(p)}
                          aria-label={`Editar ${p.nome}`}
                          title="Editar Produto"
                        >
                          <IconeEditar size={20} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-200 ease-in-out"
                          onClick={() => handleDelete(p.id)}
                          aria-label={`Apagar ${p.nome}`}
                          title="Apagar Produto"
                        >
                          <IconeLixeira size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {p.variantes.map((v, i) => (
                        <div
                          key={i}
                          className="bg-gray-100 p-3 rounded-md border border-gray-200 text-sm"
                        >
                          <p className="font-medium text-gray-700">
                            {v.nomeVariante}
                          </p>
                          <p className="text-gray-600">
                            CMV:{' '}
                            <strong className="text-blue-600">
                              {formatarValor(v.cmvCalculado)}
                            </strong>
                          </p>
                          <p className="text-gray-600">
                            Preço Sugerido:{' '}
                            <strong className="text-green-600">
                              {formatarValor(v.precoSugerido)}
                            </strong>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-gray-500">
            <IconeFichaTecnica size={48} className="mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum Produto Final Registrado
            </h3>
            <p className="text-center">
              Clique em "Cadastrar Novo Produto" para começar. É simples e
              rápido!
            </p>
          </div>
        )}
      </div>
      {showSaleDetailModal && (
        <SaleDetailModal
          product={selectedProductForDetail}
          onClose={() => setShowSaleDetailModal(false)}
        />
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (VIEW) ---
const CmvView = () => {
  const [activeTab, setActiveTab] = useState('produtos');
  const { produtosDeCompra } = useData();
  // Determine if product creation/editing should be disabled (no insumos with price)
  const isDisabled = useMemo(
    () => !produtosDeCompra.some((item) => item.bestPrice),
    [produtosDeCompra],
  );

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <IconeFichaTecnica size={28} className="mr-3 text-blue-700" /> Fichas
          Técnicas e Produtos
        </h2>
        <p className="text-gray-600">
          Aqui você organiza seus produtos em categorias e cria as receitas
          (fichas técnicas) para calcular o custo exato de cada item.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 text-center text-lg font-medium transition-colors duration-200
            ${
              activeTab === 'produtos'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          onClick={() => setActiveTab('produtos')}
          aria-controls="panel-gerenciar-produtos"
          id="tab-gerenciar-produtos"
          role="tab"
          aria-selected={activeTab === 'produtos'}
        >
          Gerenciar Produtos e Receitas
        </button>
        <button
          className={`py-3 px-6 text-center text-lg font-medium transition-colors duration-200
            ${
              activeTab === 'categorias'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          onClick={() => setActiveTab('categorias')}
          aria-controls="panel-gerenciar-categorias"
          id="tab-gerenciar-categorias"
          role="tab"
          aria-selected={activeTab === 'categorias'}
        >
          Gerenciar Categorias
        </button>
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id="panel-gerenciar-produtos"
        aria-labelledby="tab-gerenciar-produtos"
        hidden={activeTab !== 'produtos'}
      >
        {activeTab === 'produtos' && (
          <GerenciarProdutosFinais isDisabled={isDisabled} />
        )}
      </div>
      <div
        role="tabpanel"
        id="panel-gerenciar-categorias"
        aria-labelledby="tab-gerenciar-categorias"
        hidden={activeTab !== 'categorias'}
      >
        {activeTab === 'categorias' && <GerenciarCategorias />}
      </div>
    </div>
  );
};

export default CmvView;
