import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
import { IconeFichaTecnica, IconeEditar, IconeLixeira } from '../../utils/icons';
import { formatarValor, formatarValorPreciso } from '../../utils/formatters';

const GerenciarProdutosFinais = ({ isDisabled }) => {
    const { produtosDeCompra, produtos } = useData();
    const { showModal, showConfirmationModal } = useUI();
    const initialState = { nome: '', categoria: '', variantes: [{ nomeVariante: 'Padrão', custoEmbalagem: '', custoOperacional: '', fichaTecnica: [] }] };
    const [formState, setFormState] = useState(initialState);
    const [editing, setEditing] = useState(null);
    const [varianteAtiva, setVarianteAtiva] = useState(0);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [qtdInsumo, setQtdInsumo] = useState('');
    const [margemLucro, setMargemLucro] = useState(200);

    // Obter o insumo selecionado para acessar suas propriedades
    const selectedInsumo = useMemo(() => {
        return produtosDeCompra.find(p => p.id === selectedInsumoId);
    }, [selectedInsumoId, produtosDeCompra]);

    const resetForm = () => { setEditing(null); setFormState(initialState); setVarianteAtiva(0); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formState.nome) { showModal("O nome do produto é obrigatório."); return; }
        try {
            const produtoData = {
                ...formState,
                variantes: formState.variantes.map(v => {
                    const custoTotalItens = v.fichaTecnica.reduce((acc, item) => acc + item.custo, 0);
                    const custoEmbalagem = parseFloat(String(v.custoEmbalagem || '0').replace(',', '.'));
                    const custoOperacional = parseFloat(String(v.custoOperacional || '0').replace(',', '.'));
                    const cmvCalculado = custoTotalItens + custoEmbalagem + custoOperacional;
                    return { ...v, cmvCalculado };
                })
            };
            if (editing) {
                await updateDocument("produtosFinais", editing.id, produtoData);
                showModal("Produto atualizado!");
            } else {
                await addDocument("produtosFinais", produtoData);
                showModal("Produto salvo!");
            }
            resetForm();
        } catch (error) { showModal("Erro ao salvar: " + error.message); }
    };

    const handleAddItem = () => {
        const insumo = produtosDeCompra.find(p => p.id === selectedInsumoId);
        const qtd = parseFloat(String(qtdInsumo).replace(',', '.'));
        if (!insumo || isNaN(qtd) || qtd <= 0 || !insumo.bestPrice) {
            showModal("Selecione um insumo com preço e quantidade válidos."); return;
        }

        // Determina a unidade de exibição e o fator de conversão
        let displayUnit = insumo.unidadeAnalise;
        let conversionFactor = 1;

        if (insumo.unidadeAnalise === 'kg') {
            displayUnit = 'g';
            conversionFactor = 1000; // 1 kg = 1000 g
        } else if (insumo.unidadeAnalise === 'L') {
            displayUnit = 'ml';
            conversionFactor = 1000; // 1 L = 1000 ml
        }
        // A quantidade de entrada (qtd) é na unidade de exibição (g, ml, un)
        // O custo do insumo é por unidade de análise (R$/kg, R$/L, R$/un)
        // Portanto, para calcular o custo, convertemos a quantidade de volta para a unidade de análise
        const quantidadeEmUnidadeAnalise = qtd / conversionFactor;

        const novoItem = {
            itemDeCompraId: insumo.id,
            nome: insumo.nome,
            quantidade: qtd, // Quantidade na unidade de exibição (g, ml, un)
            unidade: displayUnit, // Unidade para exibição na ficha (g, ml, un)
            custo: quantidadeEmUnidadeAnalise * insumo.bestPrice, // Custo calculado
        };
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva].fichaTecnica.push(novoItem);
        setFormState({...formState, variantes: novasVariantes });
        setSelectedInsumoId(''); setQtdInsumo('');
    };

    const handleRemoveItem = (index) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva].fichaTecnica.splice(index, 1);
        setFormState({ ...formState, variantes: novasVariantes });
    };

    const handleEdit = (p) => { setEditing(p); setFormState(p); setVarianteAtiva(0); };
    const handleDelete = (id) => showConfirmationModal("Excluir este produto?", async () => {
        try { await deleteDocument("produtosFinais", id); showModal("Produto excluído."); }
        catch(error) { showModal("Erro ao excluir: " + error.message); }
    });

    const handleVarianteFieldChange = (field, value) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva][field] = value;
        setFormState({ ...formState, variantes: novasVariantes });
    };

    const currentCmv = useMemo(() => {
        if (!formState.variantes[varianteAtiva]) return 0;
        const v = formState.variantes[varianteAtiva];
        const custoItens = v.fichaTecnica.reduce((acc, item) => acc + item.custo, 0);
        const custoEmb = parseFloat(String(v.custoEmbalagem || '0').replace(',', '.'));
        const custoOp = parseFloat(String(v.custoOperacional || '0').replace(',', '.'));
        return custoItens + custoEmb + custoOp;
    }, [formState, varianteAtiva]);


    return (
        <div className={`card ${isDisabled ? 'disabled-card' : ''}`} data-cy="card-gerenciar-produtos-finais">
            {isDisabled && <div className="overlay-message"><p>Cadastre insumos com preço em "Catálogo" para criar fichas técnicas.</p></div>}

            <form onSubmit={handleSave}>
                <div className="form-group-inline">
                    <div className="form-group"><label>Nome do Produto</label><input type="text" value={formState.nome} onChange={e => setFormState({...formState, nome: e.target.value})} placeholder="Ex: Pizza" required/></div>
                    <div className="form-group"><label>Categoria</label><input type="text" value={formState.categoria} onChange={e => setFormState({...formState, categoria: e.target.value})} placeholder="Ex: Pizzas Salgadas"/></div>
                </div>

                <div className="variantes-manager">
                    <h4>Variante: {formState.variantes[varianteAtiva].nomeVariante}</h4>
                    <div className="form-group-inline">
                        <div className="form-group"><label>Nome da Variante</label><input type="text" value={formState.variantes[varianteAtiva].nomeVariante} onChange={e => handleVarianteFieldChange('nomeVariante', e.target.value)} placeholder="Ex: Grande"/></div>
                        <div className="form-group"><label>Custo Embalagem (R$)</label><input type="text" value={formState.variantes[varianteAtiva].custoEmbalagem} onChange={e => handleVarianteFieldChange('custoEmbalagem', e.target.value)} placeholder="1.50"/></div>
                        <div className="form-group"><label>Outros Custos (R$)</label><input type="text" value={formState.variantes[varianteAtiva].custoOperacional} onChange={e => handleVarianteFieldChange('custoOperacional', e.target.value)} placeholder="3.00"/></div>
                    </div>

                    <h5>Ficha Técnica da Variante</h5>
                    <div className="form-group-inline">
                        <div className="form-group" style={{flex: 3}}>
                            <label>Insumo</label>
                            <select value={selectedInsumoId} onChange={e => setSelectedInsumoId(e.target.value)} aria-label="Selecione um item de compra">
                                <option value="">Selecione...</option>
                                {produtosDeCompra.filter(p => p.bestPrice).map(p => <option key={p.id} value={p.id}>{`${p.nome} - ${formatarValorPreciso(p.bestPrice)}/${p.unidadeAnalise}`}</option>)}
                            </select>
                            {produtosDeCompra.filter(p => p.bestPrice).length === 0 && (
                                <p className="sub-text">Nenhum insumo com preço para adicionar.</p>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Qtd ({selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : (selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un')) : 'un'})</label>
                            <input
                                type="text"
                                value={qtdInsumo}
                                onChange={e => setQtdInsumo(e.target.value)}
                                placeholder={`Ex: 150 ${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : (selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un')) : ''}`}
                                aria-label="Quantidade do item de compra"
                            />
                        </div>
                        <button type="button" onClick={handleAddItem} className="button-secondary" disabled={!selectedInsumoId || !qtdInsumo} aria-label="Adicionar item à ficha técnica">+</button>
                    </div>

                    <div className="list-container" style={{maxHeight: '150px', borderTop: 'none', marginTop: 0}}>
                        {formState.variantes[varianteAtiva].fichaTecnica.map((item, i) => (
                            <div key={i} className="list-item"><p>{item.nome} - {item.quantidade} {item.unidade} ({formatarValor(item.custo)})</p><button type='button' className='button-icon' onClick={() => handleRemoveItem(i)}><IconeLixeira/></button></div>
                        ))}
                        {formState.variantes[varianteAtiva].fichaTecnica.length === 0 && (
                            <p className="sub-text">Nenhum insumo adicionado a esta ficha técnica.</p>
                        )}
                    </div>
                    <p style={{textAlign:'right', fontWeight: 'bold', fontSize: '1.2rem'}}>CMV Total da Variante: {formatarValor(currentCmv)}</p>
                </div>

                <button type="submit" className="button-primary" style={{marginTop: '1rem'}}>{editing ? 'Atualizar Produto' : 'Salvar Novo Produto'}</button>
                {editing && <button type="button" onClick={resetForm} className="button-link">Cancelar</button>}
            </form>

            <div className="divider" />
            <h3><IconeFichaTecnica /> Produtos Finais Cadastrados</h3>
            <div className="list-container">
                {produtos.map(p => (
                    <div key={p.id} className="card" style={{marginBottom: '1rem'}}>
                        <div className="list-item" style={{paddingBottom: 0}}>
                            <h4>{p.nome} <span className="sub-text">{p.categoria}</span></h4>
                            <div><button className="button-icon" onClick={() => handleEdit(p)}><IconeEditar/></button><button className="button-icon" onClick={() => handleDelete(p.id)}><IconeLixeira/></button></div>
                        </div>
                        {p.variantes.map((v, i) => (
                            <div key={i} className="list-item">
                                <strong>{v.nomeVariante}</strong>
                                <div>
                                    <p>CMV: <strong>{formatarValor(v.cmvCalculado)}</strong></p>
                                    <p className="sub-text">Preço Sugerido (Lucro {margemLucro}%): {formatarValor(v.cmvCalculado * (1 + margemLucro / 100))}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                {produtos.length === 0 && <p className="sub-text">Nenhum produto final cadastrado ainda.</p>}
            </div>
        </div>
    );
};

const CmvView = () => {
    const { produtosDeCompra } = useData();
    const isDisabled = !produtosDeCompra.some(item => item.bestPrice); 

    return (
        <div>
             <div className="card">
                <h2><IconeFichaTecnica /> Gerenciar Produtos Finais (Fichas Técnicas)</h2>
                <p>Crie e gerencie as receitas dos seus produtos vendidos. O sistema usará o <strong>melhor preço</strong> cadastrado de cada insumo para calcular o Custo de Mercadoria Vendida (CMV) de forma automática.</p>
            </div>
            <GerenciarProdutosFinais isDisabled={isDisabled} />
        </div>
    );
};

export default CmvView;