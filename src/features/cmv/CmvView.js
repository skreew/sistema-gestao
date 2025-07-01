import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
import { IconeFichaTecnica, IconeEditar, IconeLixeira, IconeMais, IconeRemover } from '../../utils/icons';
import { formatarValor, formatarValorPreciso } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const GerenciarProdutosFinais = ({ isDisabled }) => {
    const { produtosDeCompra, produtos } = useData();
    const { showConfirmationModal, showToast } = useUI();
    const initialState = { nome: '', categoria: '', variantes: [{ nomeVariante: 'Padrão', custoEmbalagem: '0', custoOperacional: '0', fichaTecnica: [] }] };
    const [formState, setFormState] = useState(initialState);
    const [editing, setEditing] = useState(null);
    const [varianteAtiva, setVarianteAtiva] = useState(0);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [qtdInsumo, setQtdInsumo] = useState('');
    const [margemLucroPercentual, setMargemLucroPercentual] = useState(100); // Estado para %
    const [margemLucroMonetaria, setMargemLucroMonetaria] = useState(0); // Estado para R$
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const selectedInsumo = useMemo(() => {
        return produtosDeCompra.find(p => p.id === selectedInsumoId);
    }, [selectedInsumoId, produtosDeCompra]);

    const resetForm = () => { 
        setEditing(null); 
        setFormState(initialState); 
        setVarianteAtiva(0); 
        setFormErrors({});
        setMargemLucroPercentual(100);
        setMargemLucroMonetaria(0);
    };

    const validateForm = () => {
        const errors = {};
        if (!formState.nome.trim()) errors.nome = "O nome do produto é obrigatório.";

        formState.variantes.forEach((variante, index) => {
            if (!variante.nomeVariante.trim()) {
                errors[`varianteNome${index}`] = "O nome da variante é obrigatório.";
            }
            if (isNaN(parseFloat(String(variante.custoEmbalagem).replace(',', '.')))) {
                errors[`custoEmbalagem${index}`] = "Custo de embalagem inválido.";
            }
            if (isNaN(parseFloat(String(variante.custoOperacional).replace(',', '.')))) {
                errors[`custoOperacional${index}`] = "Outros custos inválidos.";
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
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
                showToast("Produto atualizado!");
            } else {
                await addDocument("produtosFinais", produtoData);
                showToast("Produto salvo!");
            }
            resetForm();
        } catch (error) { showToast("Erro ao salvar: " + error.message, 'error'); }
        finally { setIsSaving(false); }
    };

    const handleAddItem = () => {
        const insumo = produtosDeCompra.find(p => p.id === selectedInsumoId);
        const qtd = parseFloat(String(qtdInsumo).replace(',', '.'));
        if (!insumo || isNaN(qtd) || qtd <= 0 || !insumo.bestPrice) {
            showToast("Selecione um insumo com preço e quantidade válidos.", 'error'); return;
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
        setFormState({...formState, variantes: novasVariantes });
        setSelectedInsumoId(''); setQtdInsumo('');
    };

    const handleRemoveItem = (index) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva].fichaTecnica.splice(index, 1);
        setFormState({ ...formState, variantes: novasVariantes });
    };

    const handleEdit = (p) => { setEditing(p); setFormState(p); setVarianteAtiva(0); setFormErrors({}); };
    const handleDelete = (id) => showConfirmationModal("Apagar este produto?", async () => {
        try { await deleteDocument("produtosFinais", id); showToast("Produto apagado."); }
        catch(error) { showToast("Erro ao apagar: " + error.message, 'error'); }
    });

    const handleVarianteFieldChange = (field, value) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva][field] = value;
        setFormState({ ...formState, variantes: novasVariantes });
        setFormErrors(prev => ({ ...prev, [`${field}${varianteAtiva}`]: '' }));
    };

    const handleAddVariante = () => {
        setFormState(prev => ({
            ...prev,
            variantes: [...prev.variantes, { nomeVariante: `Nova Variante ${prev.variantes.length + 1}`, custoEmbalagem: '0', custoOperacional: '0', fichaTecnica: [] }]
        }));
        setVarianteAtiva(formState.variantes.length);
    };

    const handleRemoveVariante = (index) => {
        if (formState.variantes.length === 1) {
            showToast("É necessário ter pelo menos uma variante.", 'error');
            return;
        }
        showConfirmationModal("Apagar esta variante?", () => {
            const novasVariantes = [...formState.variantes];
            novasVariantes.splice(index, 1);
            setFormState(prev => ({ ...prev, variantes: novasVariantes }));
            setVarianteAtiva(0);
            showToast("Variante removida.");
        });
    };


    const currentCmv = useMemo(() => {
        if (!formState.variantes[varianteAtiva]) return 0;
        const v = formState.variantes[varianteAtiva];
        const custoItens = v.fichaTecnica.reduce((acc, item) => acc + item.custo, 0);
        const custoEmb = parseFloat(String(v.custoEmbalagem || '0').replace(',', '.'));
        const custoOp = parseFloat(String(v.custoOperacional || '0').replace(',', '.'));
        return custoItens + custoEmb + custoOp;
    }, [formState, varianteAtiva]);

    // Recalcula margem monetária quando percentual ou CMV muda
    useEffect(() => {
        if (currentCmv > 0) {
            setMargemLucroMonetaria(currentCmv * (margemLucroPercentual / 100));
        } else {
            setMargemLucroMonetaria(0);
        }
    }, [margemLucroPercentual, currentCmv]);

    // Recalcula margem percentual quando monetária ou CMV muda
    useEffect(() => {
        if (currentCmv > 0 && margemLucroMonetaria >= 0) {
            setMargemLucroPercentual((margemLucroMonetaria / currentCmv) * 100);
        } else if (currentCmv === 0 && margemLucroMonetaria > 0) {
            setMargemLucroPercentual(Infinity); // Lucro infinito se CMV for zero e houver lucro monetário
        } else {
            setMargemLucroPercentual(0);
        }
    }, [margemLucroMonetaria, currentCmv]);


    return (
        <div className={`card ${isDisabled ? 'disabled-card' : ''}`} data-cy="card-gerenciar-produtos-finais">
            {isDisabled && <div className="overlay-message"><p>Registe insumos com preço em "Catálogo" para criar fichas técnicas.</p></div>}

            <form onSubmit={handleSave}>
                <div className="form-group-inline">
                    <InputField
                        label="Nome do Produto"
                        type="text"
                        value={formState.nome}
                        onChange={e => { setFormState({...formState, nome: e.target.value}); setFormErrors(prev => ({ ...prev, nome: '' })); }}
                        placeholder="Ex: Pizza"
                        required
                        error={formErrors.nome}
                    />
                    <InputField
                        label="Categoria"
                        type="text"
                        value={formState.categoria}
                        onChange={e => setFormState({...formState, categoria: e.target.value})}
                        placeholder="Ex: Pizzas Salgadas"
                    />
                </div>

                <div className="variantes-tabs" style={{marginTop: '1.5rem', borderBottom: 'none', paddingBottom: 0}}>
                    {formState.variantes.map((v, index) => (
                        <div key={index} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <button
                                type="button"
                                className={varianteAtiva === index ? 'active' : ''}
                                onClick={() => setVarianteAtiva(index)}
                            >
                                {v.nomeVariante}
                            </button>
                            {formState.variantes.length > 1 && (
                                <button type="button" className="button-icon small" onClick={() => handleRemoveVariante(index)} aria-label="Remover Variante">
                                    <IconeRemover />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="button-secondary" onClick={handleAddVariante}><IconeMais /> Adicionar Variante</button>
                </div>

                <div className="variantes-manager">
                    <h4>Detalhes da Variante: {formState.variantes[varianteAtiva].nomeVariante}</h4>
                    <div className="form-group-inline">
                        <InputField
                            label="Nome da Variante"
                            type="text"
                            value={formState.variantes[varianteAtiva].nomeVariante}
                            onChange={e => handleVarianteFieldChange('nomeVariante', e.target.value)}
                            placeholder="Ex: Grande"
                            error={formErrors[`varianteNome${varianteAtiva}`]}
                        />
                        <InputField
                            label="Custo Embalagem (R$)"
                            type="text"
                            value={formState.variantes[varianteAtiva].custoEmbalagem}
                            onChange={e => handleVarianteFieldChange('custoEmbalagem', e.target.value)}
                            placeholder="1.50"
                            error={formErrors[`custoEmbalagem${varianteAtiva}`]}
                        />
                        <InputField
                            label="Outros Custos (R$)"
                            type="text"
                            value={formState.variantes[varianteAtiva].custoOperacional}
                            onChange={e => handleVarianteFieldChange('custoOperacional', e.target.value)}
                            placeholder="3.00"
                            error={formErrors[`custoOperacional${varianteAtiva}`]}
                        />
                    </div>

                    <h5>Ficha Técnica da Variante</h5>
                    <div className="form-group-inline">
                        <SelectField
                            label="Insumo"
                            value={selectedInsumoId}
                            onChange={e => setSelectedInsumoId(e.target.value)}
                            options={[
                                { value: '', label: 'Selecione...', disabled: true },
                                ...produtosDeCompra.filter(p => p.bestPrice).map(p => ({ value: p.id, label: `${p.nome} - ${formatarValorPreciso(p.bestPrice)}/${p.unidadeAnalise}` }))
                            ]}
                            aria-label="Selecione um item de compra"
                        />
                        <InputField
                            label={`Qtd (${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : (selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un')) : 'un'})`}
                            type="text"
                            value={qtdInsumo}
                            onChange={e => setQtdInsumo(e.target.value)}
                            placeholder={`Ex: 150 ${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : (selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un')) : ''}`}
                            aria-label="Quantidade do item de compra"
                        />
                        <button type="button" onClick={handleAddItem} className="button-secondary" disabled={!selectedInsumoId || !qtdInsumo} aria-label="Adicionar item à ficha técnica">+</button>
                    </div>

                    <div className="list-container" style={{maxHeight: '150px', borderTop: 'none', marginTop: 0}}>
                        {formState.variantes[varianteAtiva].fichaTecnica.length > 0 ? formState.variantes[varianteAtiva].fichaTecnica.map((item, i) => (
                            <div key={i} className="list-item"><p>{item.nome} - {item.quantidade} {item.unidade} ({formatarValor(item.custo)})</p><button type='button' className='button-icon' onClick={() => handleRemoveItem(i)}><IconeLixeira/></button></div>
                        )) : (
                            <div className="empty-state" style={{border: 'none', padding: '1rem', marginTop: '0.5rem'}}>
                                <p className="sub-text">Adicione insumos à ficha técnica desta variante.</p>
                            </div>
                        )}
                    </div>
                    <p style={{textAlign:'right', fontWeight: 'bold', fontSize: '1.2rem'}}>CMV Total da Variante: {formatarValor(currentCmv)}</p>

                    {/* Destaque para Preço de Venda Sugerido */}
                    <div style={{ 
                        backgroundColor: 'var(--cor-secundaria)', 
                        color: 'var(--cor-primaria)', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        marginTop: '1.5rem'
                    }}>
                        <label htmlFor="margemLucroPercentual">Margem de Lucro Desejada:</label>
                        <input 
                            type="range" 
                            id="margemLucroPercentual" 
                            min="0" 
                            max="500" 
                            value={margemLucroPercentual} 
                            onChange={e => setMargemLucroPercentual(parseFloat(e.target.value))} 
                        />
                        <span> {margemLucroPercentual.toFixed(0)}%</span>

                        <InputField
                            label="Margem de Lucro (R$)"
                            type="number"
                            value={margemLucroMonetaria.toFixed(2)}
                            onChange={e => setMargemLucroMonetaria(parseFloat(e.target.value) || 0)}
                            step="0.01"
                            placeholder="0.00"
                        />

                        <h4 style={{marginTop: '1rem', marginBottom: '0.5rem'}}>Preço de Venda Sugerido:</h4>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                            {formatarValor(currentCmv + margemLucroMonetaria)}
                        </p>
                    </div>
                </div>

                <button type="submit" className="button-primary" style={{marginTop: '1rem'}} disabled={isSaving}>
                    {isSaving ? (editing ? 'A atualizar...' : 'A salvar...') : (editing ? 'Atualizar Produto' : 'Salvar Novo Produto')}
                </button>
                {editing && <button type="button" onClick={resetForm} className="button-link">Cancelar</button>}
            </form>

            <div className="divider" />
            <h3><IconeFichaTecnica /> Produtos Finais Registados</h3>
            <div className="list-container">
                {produtos.length > 0 ? produtos.map(p => (
                    <div key={p.id} className="card" style={{marginBottom: '1rem'}}>
                        <div className="list-item" style={{paddingBottom: 0}}>
                            <h4 className="truncate-text">{p.nome} <span className="sub-text">{p.categoria}</span></h4>
                            <div><button className="button-icon" onClick={() => handleEdit(p)}><IconeEditar/></button><button className="button-icon" onClick={() => handleDelete(p.id)}><IconeLixeira/></button></div>
                        </div>
                        {p.variantes.map((v, i) => (
                            <div key={i} className="list-item">
                                <strong>{v.nomeVariante}</strong>
                                <div>
                                    <p>CMV: <strong>{formatarValor(v.cmvCalculado)}</strong></p>
                                    {/* Exibe o preço sugerido usando a margem percentual padrão de 100% para a lista */}
                                    <p className="sub-text">Preço Sugerido (Lucro 100%): {formatarValor(v.cmvCalculado * 2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeFichaTecnica />
                        <h3>Nenhum Produto Final Registado</h3>
                        <p className="sub-text">Crie a sua primeira ficha técnica acima.</p>
                    </div>
                )}
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
                <p>Crie e gerencie as receitas dos seus produtos vendidos. O sistema usará o <strong>melhor preço</strong> registado de cada insumo para calcular o Custo de Mercadoria Vendida (CMV) de forma automática.</p>
            </div>
            <GerenciarProdutosFinais isDisabled={isDisabled} />
        </div>
    );
};

export default CmvView;