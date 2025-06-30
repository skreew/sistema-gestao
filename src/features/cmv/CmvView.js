import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { setDocument, incrementField, addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
import { IconeCmv, IconeFichaTecnica, IconeEditar, IconeLixeira, IconeSalvar } from '../../utils/icons';
import { formatarValor, formatarValorPreciso } from '../../utils/formatters';

const RegistrarCompra = () => {
    const { produtosDeCompra, allPedidos } = useData();
    const { showModal } = useUI();
    const [selectedProdutoId, setSelectedProdutoId] = useState('');
    const [valorNota, setValorNota] = useState('');
    const [pedidoVinculadoId, setPedidoVinculadoId] = useState('');

    const handleUpdateInsumoCost = async (e) => {
        e.preventDefault();
        const produtoSelecionado = produtosDeCompra.find(p => p.id === selectedProdutoId);
        const valor = parseFloat(String(valorNota).replace(',', '.'));

        if (!produtoSelecionado || isNaN(valor) || valor <= 0) {
            showModal("Selecione um produto e insira um valor de nota válido.");
            return;
        }

        const { medidaPadrao } = produtoSelecionado;
        if (!medidaPadrao || !medidaPadrao.valor) {
            showModal("O produto selecionado não tem uma medida padrão calculada. Verifique o cadastro.");
            return;
        }

        const precoFinal = valor / medidaPadrao.valor;

        const insumoData = {
            nome: produtoSelecionado.nome,
            fornecedorId: produtoSelecionado.fornecedorId,
            preco_por_unidade_padrao: precoFinal,
            unidade_padrao: medidaPadrao.unidade,
            ultima_compra_desc: `Nota de R$ ${valor.toFixed(2)} para ${medidaPadrao.valor}${medidaPadrao.unidade}`,
        };

        try {
            await setDocument("insumos", produtoSelecionado.id, insumoData);
            await incrementField("insumos", produtoSelecionado.id, "estoqueAtual", medidaPadrao.valor);

            if (pedidoVinculadoId) {
                await updateDocument("pedidosRealizados", pedidoVinculadoId, {
                    valorTotal: valor,
                    status: 'finalizado'
                });
            }

            showModal(`Custo atualizado e estoque incrementado! Novo custo: ${formatarValorPreciso(precoFinal)}/${medidaPadrao.unidade}.`);
            setSelectedProdutoId('');
            setValorNota('');
            setPedidoVinculadoId('');
        } catch (error) {
            showModal("Erro ao atualizar custo: " + error.message);
        }
    };

    const pedidosPendentes = useMemo(() => allPedidos.filter(p => p.status === 'enviado'), [allPedidos]);

    return (
        <div className="card">
            <h2><IconeSalvar /> Registrar Compra e Fechar Ciclo</h2>
            <form onSubmit={handleUpdateInsumoCost}>
                <div className="form-group">
                    <label>1. Selecione o item do Catálogo</label>
                    <select value={selectedProdutoId} onChange={e => setSelectedProdutoId(e.target.value)} required>
                        <option value="">Selecione um produto...</option>
                        {produtosDeCompra.map(p => (
                            <option key={p.id} value={p.id}>{p.nome} ({p.detalheCompra.unidadeCompra})</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>2. Valor Total da Nota Fiscal (R$)</label>
                    <input type="text" value={valorNota} onChange={e => setValorNota(e.target.value)} placeholder="Ex: 150,25" required />
                </div>
                <div className="form-group">
                    <label>3. Vincular a um Pedido Enviado (Opcional)</label>
                     <select value={pedidoVinculadoId} onChange={e => setPedidoVinculadoId(e.target.value)}>
                        <option value="">Não vincular</option>
                        {pedidosPendentes.map(p => (
                            <option key={p.id} value={p.id}>
                                Pedido para {p.fornecedorNome} em {new Date(p.criadoEm.seconds * 1000).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="button-primary">Calcular Custo e Adicionar ao Estoque</button>
            </form>
        </div>
    );
};

const GerenciarProdutosFinais = () => {
    const { insumos, produtos } = useData();
    const { showModal, showConfirmationModal } = useUI();

    const initialState = {
        nome: '',
        categoria: '',
        variantes: [{ nomeVariante: 'Padrão', custoEmbalagem: '', custoOperacional: '', fichaTecnica: [] }]
    };

    const [editingProduto, setEditingProduto] = useState(null);
    const [formState, setFormState] = useState(initialState);
    const [varianteAtiva, setVarianteAtiva] = useState(0);
    const [insumoFicha, setInsumoFicha] = useState('');
    const [qtdInsumoFicha, setQtdInsumoFicha] = useState('');
    const [margemLucro, setMargemLucro] = useState(200);

    const resetForm = () => {
        setEditingProduto(null);
        setFormState(initialState);
        setVarianteAtiva(0);
    };

    const handleSalvarProdutoFinal = async (e) => {
        e.preventDefault();
        if (!formState.nome) {
            showModal("O nome do produto é obrigatório.");
            return;
        }

        try {
            const variantesCalculadas = formState.variantes.map(variante => {
                let custoTotalInsumos = 0;
                const fichaTecnicaCalculada = variante.fichaTecnica.map(item => {
                    const insumoDetalhe = insumos.find(i => i.id === item.insumoId);
                    if (!insumoDetalhe) throw new Error(`Insumo "${item.nome}" não encontrado.`);
                    const custoItem = item.quantidade * insumoDetalhe.preco_por_unidade_padrao;
                    custoTotalInsumos += custoItem;
                    return { ...item, custo: custoItem };
                });

                const custoEmbalagem = parseFloat(String(variante.custoEmbalagem || '0').replace(',', '.'));
                const custoOperacional = parseFloat(String(variante.custoOperacional || '0').replace(',', '.'));
                const cmvCalculado = custoTotalInsumos + custoEmbalagem + custoOperacional;

                return { ...variante, fichaTecnica: fichaTecnicaCalculada, cmvCalculado };
            });

            const produtoData = {
                nome: formState.nome,
                categoria: formState.categoria || 'Sem Categoria',
                variantes: variantesCalculadas
            };

            if (editingProduto) {
                await updateDocument("produtosFinais", editingProduto.id, produtoData);
                showModal("Produto atualizado com sucesso!");
            } else {
                await addDocument("produtosFinais", produtoData);
                showModal("Produto final salvo com sucesso!");
            }
            resetForm();
        } catch (error) {
            showModal("Erro ao salvar produto: " + error.message);
        }
    };

    const handleAdicionarItemFicha = () => {
        const insumo = insumos.find(i => i.id === insumoFicha);
        const quantidade = parseFloat(String(qtdInsumoFicha).replace(',', '.'));
        if (!insumo || isNaN(quantidade) || quantidade <= 0) {
            showModal("Selecione um insumo e quantidade válida.");
            return;
        }

        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva].fichaTecnica.push({
            insumoId: insumo.id,
            nome: insumo.nome,
            quantidade: quantidade,
            unidade: insumo.unidade_padrao
        });
        setFormState({...formState, variantes: novasVariantes });
        setInsumoFicha('');
        setQtdInsumoFicha('');
    };

    const handleRemoverItemFicha = (itemIndex) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva].fichaTecnica.splice(itemIndex, 1);
        setFormState({ ...formState, variantes: novasVariantes });
    };

    const handleUpdateVariante = (index, campo, valor) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[index][campo] = valor;
        setFormState({ ...formState, variantes: novasVariantes });
    };

    const handleAdicionarVariante = () => {
        const novasVariantes = [...formState.variantes, { nomeVariante: `Variante ${formState.variantes.length + 1}`, custoEmbalagem: '', custoOperacional: '', fichaTecnica: [] }];
        setFormState({ ...formState, variantes: novasVariantes });
    };

    const handleRemoverVariante = (index) => {
        if (formState.variantes.length <= 1) {
            showModal("O produto deve ter pelo menos uma variante.");
            return;
        }
        const novasVariantes = [...formState.variantes];
        novasVariantes.splice(index, 1);
        setFormState({ ...formState, variantes: novasVariantes });
        if (varianteAtiva >= index && varianteAtiva > 0) {
            setVarianteAtiva(varianteAtiva - 1);
        }
    };

    const handleEditarProduto = (produto) => {
        setEditingProduto(produto);
        setFormState(produto);
        setVarianteAtiva(0);
    };

    const handleDeleteProduto = (id) => {
        showConfirmationModal("Excluir este produto e todas as suas fichas técnicas?", async () => {
            try {
                await deleteDocument("produtosFinais", id);
                showModal("Produto excluído.");
            } catch (error) {
                showModal("Erro ao excluir: " + error.message);
            }
        });
    };

    return (
        <div className="card">
            <h2><IconeFichaTecnica /> Gerenciar Produtos Finais (Ficha Técnica)</h2>
            <form onSubmit={handleSalvarProdutoFinal}>
                <div className="form-group-inline">
                    <div className="form-group"><label>Nome do Produto</label><input type="text" value={formState.nome} onChange={e => setFormState({...formState, nome: e.target.value})} placeholder="Ex: Pizza" required/></div>
                    <div className="form-group"><label>Categoria</label><input type="text" value={formState.categoria} onChange={e => setFormState({...formState, categoria: e.target.value})} placeholder="Ex: Pizzas Salgadas"/></div>
                </div>

                <div className="variantes-manager">
                    <h4>Variantes (Tamanhos/Sabores)</h4>
                    <div className="variantes-tabs">
                        {formState.variantes.map((v, index) => (
                            <button type="button" key={index} onClick={() => setVarianteAtiva(index)} className={varianteAtiva === index ? 'active' : ''}>
                                {v.nomeVariante || `Variante ${index+1}`}
                            </button>
                        ))}
                        <button type="button" onClick={handleAdicionarVariante} className="button-add-variant">+</button>
                    </div>
                    <div className="variante-content">
                        <div className="form-group-inline">
                            <div className="form-group"><label>Nome da Variante</label><input type="text" value={formState.variantes[varianteAtiva].nomeVariante} onChange={e => handleUpdateVariante(varianteAtiva, 'nomeVariante', e.target.value)} placeholder="Ex: Grande, Calabresa"/></div>
                            <div className="form-group"><label>Custo Embalagem (R$)</label><input type="text" value={formState.variantes[varianteAtiva].custoEmbalagem} onChange={e => handleUpdateVariante(varianteAtiva, 'custoEmbalagem', e.target.value)} placeholder="1.50"/></div>
                            <div className="form-group"><label>Outros Custos (Gás, M.O.)</label><input type="text" value={formState.variantes[varianteAtiva].custoOperacional} onChange={e => handleUpdateVariante(varianteAtiva, 'custoOperacional', e.target.value)} placeholder="3.00"/></div>
                            {formState.variantes.length > 1 && <button type="button" onClick={() => handleRemoverVariante(varianteAtiva)} className="button-icon"><IconeLixeira/></button>}
                        </div>
                        <h5>Ficha Técnica da Variante</h5>
                        <div className="form-group-inline">
                            <div className="form-group" style={{flex: 3}}><label>Insumo</label><select value={insumoFicha} onChange={e => setInsumoFicha(e.target.value)}><option value="">Selecione...</option>{insumos.map(i => <option key={i.id} value={i.id}>{`${i.nome} (${i.unidade_padrao})`}</option>)}</select></div>
                            <div className="form-group"><label>Qtd</label><input type="text" value={qtdInsumoFicha} onChange={e => setQtdInsumoFicha(e.target.value)} placeholder="Ex: 150"/></div>
                            <button type="button" onClick={handleAdicionarItemFicha} className="button-secondary" disabled={!insumoFicha || !qtdInsumoFicha}>+</button>
                        </div>
                        <div className="list-container" style={{maxHeight: '150px'}}>
                            {formState.variantes[varianteAtiva].fichaTecnica.map((item, index) => (
                                <div key={index} className="list-item">
                                    <span>{item.nome} - {item.quantidade} {item.unidade}</span>
                                    <button type='button' className='button-icon' onClick={() => handleRemoverItemFicha(index)}><IconeLixeira/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="divider-soft" />
                <button type="submit" className="button-primary">{editingProduto ? 'Atualizar Produto' : 'Salvar Novo Produto'}</button>
                {editingProduto && <button type="button" onClick={resetForm} className="button-link">Cancelar Edição</button>}
            </form>

            <div className="divider" />
            <h3><IconeFichaTecnica /> Produtos Finais Cadastrados</h3>
            <div className="form-group"><label>Margem de Lucro para Preço Sugerido (%)</label><input type="number" value={margemLucro} onChange={e => setMargemLucro(Number(e.target.value))} /></div>
            <div className="list-container">
                {produtos.map(p => (
                    <div key={p.id} className="card" style={{marginBottom: '1rem'}}>
                        <div className="list-item" style={{borderBottom: 'none', padding: 0}}>
                            <h4>{p.nome} - <span className="sub-text">{p.categoria}</span></h4>
                            <div className="list-item-actions">
                                <button className="button-icon" onClick={() => handleEditarProduto(p)}><IconeEditar/></button>
                                <button className="button-icon" onClick={() => handleDeleteProduto(p.id)}><IconeLixeira/></button>
                            </div>
                        </div>
                        <div className="divider-soft" />
                        {p.variantes.map((v, index) => (
                            <div key={index} className="list-item">
                                <strong>{v.nomeVariante}</strong>
                                <div>
                                    <p>CMV: <strong>{formatarValor(v.cmvCalculado)}</strong></p>
                                    <p className="sub-text">Preço Sugerido: {formatarValor(v.cmvCalculado * (1 + margemLucro / 100))}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CmvView = () => {
    return (
        <div className="grid-responsive">
            <RegistrarCompra />
            <GerenciarProdutosFinais />
        </div>
    );
};

export default CmvView;