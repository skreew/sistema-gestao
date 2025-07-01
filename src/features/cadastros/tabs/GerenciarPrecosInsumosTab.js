import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { addDocumentToSubcollection } from '../../../services/firestoreService';
import { IconeCaixa, IconeBusca, IconeMais } from '../../../utils/icons';
import { formatarValorPreciso, formatarData } from '../../../utils/formatters';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

const GerenciarPrecosInsumosTab = () => {
    const { showToast } = useUI();
    const { produtosDeCompra, fornecedores } = useData();
    const [formState, setFormState] = useState({
        insumoId: '',
        fornecedorId: '',
        dataOferta: new Date().toISOString().split('T')[0],
        precoPorUnidadeAnalise: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [buscaPreco, setBuscaPreco] = useState('');

    const filteredInsumos = useMemo(() => {
        return produtosDeCompra.filter(p => p.nome.toLowerCase().includes(buscaPreco.toLowerCase()));
    }, [produtosDeCompra, buscaPreco]);

    const validateForm = () => {
        const errors = {};
        if (!formState.insumoId) errors.insumoId = "Selecione um insumo.";
        if (!formState.fornecedorId) errors.fornecedorId = "Selecione um fornecedor.";
        if (isNaN(parseFloat(String(formState.precoPorUnidadeAnalise).replace(',', '.'))) || parseFloat(String(formState.precoPorUnidadeAnalise).replace(',', '.')) <= 0) errors.precoPorUnidadeAnalise = "Preço inválido.";
        if (!formState.dataOferta) errors.dataOferta = "Data da oferta é obrigatória.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSavePreco = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const { insumoId, fornecedorId, dataOferta, precoPorUnidadeAnalise } = formState;
        const preco = parseFloat(String(precoPorUnidadeAnalise).replace(',', '.'));

        try {
            const offerRecord = {
                tipo: "oferta", // Adiciona o tipo de registro
                fornecedorId,
                dataOferta: new Date(dataOferta),
                precoPorUnidadeAnalise: preco,
            };
            await addDocumentToSubcollection("produtosDeCompra", insumoId, "historicoPrecos", offerRecord);
            showToast(`Preço de oferta registado para ${produtosDeCompra.find(p => p.id === insumoId)?.nome}!`);
            resetForm();
        } catch (error) {
            showToast("Erro ao registar preço de oferta: " + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    const resetForm = () => {
        setFormState({
            insumoId: '',
            fornecedorId: '',
            dataOferta: new Date().toISOString().split('T')[0],
            precoPorUnidadeAnalise: ''
        });
        setFormErrors({});
    };

    return (
        <div className="card">
            <h3><IconeMais /> Registar Preço de Insumo (Oferta)</h3>
            <form onSubmit={handleSavePreco}>
                <SelectField
                    label="Insumo"
                    name="insumoId"
                    value={formState.insumoId}
                    onChange={handleFormChange}
                    options={[
                        { value: '', label: 'Selecione um insumo...', disabled: true },
                        ...produtosDeCompra.map(p => ({ value: p.id, label: `${p.nome} (${p.unidadeAnalise})` }))
                    ]}
                    required
                    error={formErrors.insumoId}
                />
                <SelectField
                    label="Fornecedor"
                    name="fornecedorId"
                    value={formState.fornecedorId}
                    onChange={handleFormChange}
                    options={[
                        { value: '', label: 'Selecione um fornecedor...', disabled: true },
                        ...fornecedores.map(f => ({ value: f.id, label: f.nome }))
                    ]}
                    required
                    error={formErrors.fornecedorId}
                />
                <InputField
                    label="Data da Oferta"
                    name="dataOferta"
                    type="date"
                    value={formState.dataOferta}
                    onChange={handleFormChange}
                    required
                    error={formErrors.dataOferta}
                />
                <InputField
                    label="Preço por Unidade de Análise (R$)"
                    name="precoPorUnidadeAnalise"
                    type="text"
                    value={formState.precoPorUnidadeAnalise}
                    onChange={handleFormChange}
                    placeholder="Ex: 2.50"
                    required
                    error={formErrors.precoPorUnidadeAnalise}
                />
                <button type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? 'A registar...' : 'Registar Preço'}
                </button>
                <button type="button" onClick={resetForm} className="button-link">Limpar Formulário</button>
            </form>

            <div className="divider" />

            <h3><IconeBusca /> Histórico de Preços de Insumos</h3>
            <div className="form-group">
                <InputField
                    label="Procurar Insumo no Histórico"
                    type="text"
                    value={buscaPreco}
                    onChange={e => setBuscaPreco(e.target.value)}
                    placeholder="Procurar insumo..."
                    icon={IconeBusca}
                />
            </div>
            <div className="list-container">
                {filteredInsumos.length > 0 ? filteredInsumos.map(insumo => (
                    <div key={insumo.id} className="card" style={{marginBottom: '1rem'}}>
                        <h4>{insumo.nome} ({insumo.unidadeAnalise})</h4>
                        {insumo.historicoPrecos && insumo.historicoPrecos.length > 0 ? (
                            insumo.historicoPrecos.map((precoRec, idx) => (
                                <div key={idx} className="list-item">
                                    <div className="list-item-info">
                                        <p>Fornecedor: <strong>{fornecedores.find(f => f.id === precoRec.fornecedorId)?.nome || 'Desconhecido'}</strong></p>
                                        <p className="sub-text">Tipo: {precoRec.tipo === 'compra' ? 'Compra' : 'Oferta'}</p>
                                        <p className="sub-text">Data: {formatarData(precoRec.dataCompra || precoRec.dataOferta)}</p>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p><strong>{formatarValorPreciso(precoRec.precoPorUnidadeAnalise)}/{insumo.unidadeAnalise}</strong></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state" style={{border: 'none', padding: '1rem', marginTop: '0.5rem'}}>
                                <p className="sub-text">Nenhum preço registado para este insumo.</p>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeCaixa />
                        <h3>Nenhum Insumo com Preços Registados</h3>
                        <p className="sub-text">Registe novos preços de oferta ou compras para ver o histórico aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GerenciarPrecosInsumosTab;