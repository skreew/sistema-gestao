import React, { useState, useMemo, useEffect } from 'react';
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
} from '../../utils/icons';
import { formatarValor } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

// Sub-componente para gerenciar as categorias
const GerenciarCategorias = () => {
  const { showToast, showConfirmationModal } = useUI();
  const [categorias, setCategorias] = useState([]);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'categorias'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategorias(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return () => unsubscribe();
  }, []);

  const handleSaveCategoria = async (e) => {
    e.preventDefault();
    if (!nomeCategoria.trim() || isSaving) return;
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
        showToast('Categoria atualizada!');
      } else {
        await addDocument('categorias', { nome: nomeCategoria.trim() });
        showToast('Categoria criada!');
      }
      setNomeCategoria('');
      setEditingCategoria(null);
    } catch (error) {
      showToast(`Erro: ${error.message}`, 'error');
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
          showToast('Categoria apagada.');
        } catch (error) {
          showToast(`Erro: ${error.message}`, 'error');
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
          onChange={(e) => setNomeCategoria(e.target.value)}
          placeholder="Ex: Lanches"
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

// Sub-componente para gerenciar os produtos
const GerenciarProdutosFinais = ({ isDisabled }) => {
  const { produtosDeCompra, produtos } = useData();
  const { showConfirmationModal, showToast } = useUI();
  const [categorias, setCategorias] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const initialState = {
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
  };

  const [formState, setFormState] = useState(initialState);
  const [editing, setEditing] = useState(null);
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

  const produtosAgrupados = useMemo(() => {
    return categorias
      .map((categoria) => ({
        ...categoria,
        produtos: produtos.filter((p) => p.categoriaId === categoria.id),
      }))
      .filter((categoria) => categoria.produtos.length > 0);
  }, [produtos, categorias]);

  const activeVariante = formState.variantes[varianteAtiva];

  const handleVarianteFieldChange = (field, value) => {
    const novasVariantes = [...formState.variantes];
    novasVariantes[varianteAtiva][field] = value;
    setFormState({ ...formState, variantes: novasVariantes });
    if (formErrors[`varianteNome${varianteAtiva}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`varianteNome${varianteAtiva}`]: '',
      }));
    }
  };

  const selectedInsumo = useMemo(
    () => produtosDeCompra.find((p) => p.id === selectedInsumoId),
    [selectedInsumoId, produtosDeCompra],
  );

  const resetForm = () => {
    setEditing(null);
    setFormState(initialState);
    setVarianteAtiva(0);
    setFormErrors({});
    setMargemLucroPercentual(100);
    setIsFormVisible(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formState.nome.trim())
      errors.nome = 'O nome do produto é obrigatório.';
    if (!formState.categoriaId) errors.categoriaId = 'Selecione uma categoria.';
    formState.variantes.forEach((variante, index) => {
      if (!variante.nomeVariante.trim()) {
        errors[`varianteNome${index}`] = 'O nome da variante é obrigatório.';
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
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
          const custoTotalItens = v.fichaTecnica.reduce(
            (acc, item) => acc + item.custo,
            0,
          );
          const custoEmbalagem = parseFloat(
            String(v.custoEmbalagem || '0').replace(',', '.'),
          );
          const custoOperacional = parseFloat(
            String(v.custoOperacional || '0').replace(',', '.'),
          );
          const cmvCalculado =
            custoTotalItens + custoEmbalagem + custoOperacional;
          return { ...v, custoEmbalagem, custoOperacional, cmvCalculado };
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
      showToast('Erro ao salvar: ' + error.message, 'error');
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
    const qtd = parseFloat(String(qtdInsumo).replace(',', '.'));
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

    const quantidadeEmUnidadeAnalise = qtd / conversionFactor;
    const novoItem = {
      itemDeCompraId: insumo.id,
      nome: insumo.nome,
      quantidade: qtd,
      unidade: displayUnit,
      custo: quantidadeEmUnidadeAnalise * insumo.bestPrice,
    };
    const novasVariantes = [...formState.variantes];
    novasVariantes[varianteAtiva].fichaTecnica.push(novoItem);
    setFormState({ ...formState, variantes: novasVariantes });
    setSelectedInsumoId('');
    setQtdInsumo('');
  };

  const handleRemoveItem = (index) => {
    const novasVariantes = [...formState.variantes];
    novasVariantes[varianteAtiva].fichaTecnica.splice(index, 1);
    setFormState({ ...formState, variantes: novasVariantes });
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setFormState(JSON.parse(JSON.stringify(p)));
    setVarianteAtiva(0);
    setFormErrors({});
    setIsFormVisible(true);
  };

  const handleDelete = (id) =>
    showConfirmationModal(
      'Apagar este produto e todas as suas variantes?',
      async () => {
        try {
          await deleteDocument('produtosFinais', id);
          showToast('Produto apagado.');
        } catch (error) {
          showToast(`Erro ao apagar: ${error.message}`, 'error');
        }
      },
    );

  const handleAddVariante = () => {
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
  };

  const handleRemoveVariante = (index) => {
    if (formState.variantes.length === 1) {
      showToast('É necessário ter pelo menos uma variante.', 'error');
      return;
    }
    showConfirmationModal('Apagar esta variante?', () => {
      const novasVariantes = [...formState.variantes];
      novasVariantes.splice(index, 1);
      setFormState((prev) => ({ ...prev, variantes: novasVariantes }));
      setVarianteAtiva(0);
      showToast('Variante removida.');
    });
  };

  const currentCmv = useMemo(() => {
    if (!activeVariante) return 0;
    const custoItens = activeVariante.fichaTecnica.reduce(
      (acc, item) => acc + item.custo,
      0,
    );
    const custoEmb = parseFloat(
      String(activeVariante.custoEmbalagem || '0').replace(',', '.'),
    );
    const custoOp = parseFloat(
      String(activeVariante.custoOperacional || '0').replace(',', '.'),
    );
    return custoItens + custoEmb + custoOp;
  }, [activeVariante]);

  const precoSugerido = useMemo(() => {
    return currentCmv * (1 + margemLucroPercentual / 100);
  }, [currentCmv, margemLucroPercentual]);

  if (isFormVisible) {
    return (
      <div className={`card ${isDisabled ? 'disabled-card' : ''}`}>
        {isDisabled && (
          <div className="overlay-message">
            <p>
              Registre insumos com preço em 'Catálogo' para criar fichas
              técnicas.
            </p>
          </div>
        )}
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

          <div className="variantes-tabs">
            {formState.variantes.map((v, index) => (
              <div
                key={index}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <button
                  type="button"
                  className={varianteAtiva === index ? 'active' : ''}
                  onClick={() => setVarianteAtiva(index)}
                >
                  {v.nomeVariante}
                </button>
                {formState.variantes.length > 1 && (
                  <button
                    type="button"
                    className="button-icon small danger"
                    onClick={() => handleRemoveVariante(index)}
                    aria-label="Remover Variante"
                  >
                    <IconeRemover />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="button-icon-add-variant"
              onClick={handleAddVariante}
              title="Adicionar Nova Variante"
            >
              <IconeMais />
            </button>
          </div>

          {activeVariante && (
            <div className="variantes-manager">
              <fieldset>
                <legend>Etapa 2: Receita da Variante</legend>
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
                <div className="form-grid-2-cols">
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
                <p className="small-tip">
                  Adicione os ingredientes e quantidades usados para produzir
                  este item.
                </p>
                <div className="form-group-inline">
                  <SelectField
                    label="Adicionar Insumo"
                    value={selectedInsumoId}
                    onChange={(e) => setSelectedInsumoId(e.target.value)}
                    options={[
                      { value: '', label: 'Selecione...', disabled: true },
                      ...produtosDeCompra
                        .filter((p) => p.bestPrice)
                        .map((p) => ({ value: p.id, label: p.nome })),
                    ]}
                    aria-label="Selecionar Insumo para adicionar à receita"
                  />
                  <InputField
                    label={`Qtd (${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un') : 'un'})`}
                    type="text"
                    value={qtdInsumo}
                    onChange={(e) => setQtdInsumo(e.target.value)}
                    placeholder="Ex: 150"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="button-secondary"
                    style={{ alignSelf: 'flex-end' }}
                  >
                    +
                  </button>
                </div>

                <div className="list-container" style={{ maxHeight: '150px' }}>
                  {activeVariante.fichaTecnica.length > 0 ? (
                    activeVariante.fichaTecnica.map((item, i) => (
                      <div key={i} className="list-item">
                        <p>
                          {item.nome} - {item.quantidade}
                          {item.unidade} ({formatarValor(item.custo)})
                        </p>
                        <button
                          type="button"
                          className="button-icon danger"
                          onClick={() => handleRemoveItem(i)}
                          aria-label={`Remover ${item.nome}`}
                        >
                          <IconeLixeira />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-inner">
                      <p>
                        <IconeAlerta /> Nenhum insumo adicionado a esta
                        variante.
                      </p>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    marginTop: '1rem',
                  }}
                >
                  CMV Total da Variante: {formatarValor(currentCmv)}
                </p>
              </fieldset>
            </div>
          )}

          <fieldset className="card-calculadora-preco">
            <legend>Etapa 3: Preço de Venda</legend>
            <p className="small-tip">
              Defina a margem de lucro desejada. O sistema sugere o preço final
              automaticamente.
            </p>
            <label htmlFor="margemLucroPercentual">
              Margem de Lucro:{' '}
              <strong>{Math.round(margemLucroPercentual)}%</strong>
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
            />
            <h4>Preço de Venda Sugerido:</h4>
            <p className="preco-sugerido">{formatarValor(precoSugerido)}</p>
          </fieldset>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <button
              type="button"
              className="button-secondary"
              onClick={resetForm}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSaving}
            >
              <IconeCheck />{' '}
              {isSaving
                ? editing
                  ? 'Atualizando...'
                  : 'Salvando...'
                : editing
                  ? 'Atualizar Produto Final'
                  : 'Salvar Produto Final'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>
        <IconeFichaTecnica /> Produtos Finais Registrados
      </h3>
      <div style={{ marginBottom: '1rem' }}>
        <button
          className="button-primary"
          onClick={() => setIsFormVisible(true)}
        >
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
                    <div>
                      <button
                        className="button-icon"
                        onClick={() => handleEdit(p)}
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
                  <div className="product-variant-list">
                    {p.variantes.map((v, i) => (
                      <div key={i} className="list-item">
                        <span>{v.nomeVariante}</span>
                        <span>
                          CMV: <strong>{formatarValor(v.cmvCalculado)}</strong>
                        </span>
                      </div>
                    ))}
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
              Clique em "Cadastrar Novo Produto" para começar. É simples e
              rápido!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (VIEW) ---
const CmvView = () => {
  const [activeTab, setActiveTab] = useState('produtos');
  const { produtosDeCompra } = useData();
  const isDisabled = !produtosDeCompra.some((item) => item.bestPrice);

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
          Gerenciar Produtos e Receitas
        </button>
        <button
          className={activeTab === 'categorias' ? 'active' : ''}
          onClick={() => setActiveTab('categorias')}
        >
          Gerenciar Categorias
        </button>
      </div>

      {activeTab === 'produtos' && (
        <GerenciarProdutosFinais isDisabled={isDisabled} />
      )}
      {activeTab === 'categorias' && <GerenciarCategorias />}
    </div>
  );
};

export default CmvView;
