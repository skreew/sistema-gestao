import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { addDocument, updateDocument, deleteDocument } from '../../../services/firestoreService';
import { IconeCaixa, IconeBusca, IconeEditar, IconeLixeira } from '../../../utils/icons';
import { formatarValorPreciso } from '../../../utils/formatters';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

const GerenciarInsumosTab = ({ setActiveTab }) => {
    const { showConfirmationModal, showToast } = useUI();
    const { produtosDeCompra, fornecedores } = useData();
    const [insumoForm, setInsumoForm] = useState({ id: null, nome: '', unidadeAnalise: 'kg' });
    const [editingInsumo, setEditingInsumo] = useState(null);
    const [buscaInsumo, setBuscaInsumo] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const filteredItensDeCompra = useMemo(() => {
        const products = Array.isArray(produtosDeCompra) ? produtosDeCompra : [];
        return products.filter(p => p.nome.toLowerCase().includes(buscaInsumo.toLowerCase())).map(p => ({
            ...p,
            bestPriceFornecedorNome: p.bestPriceFornecedorId ? (fornecedores.find(f => f.id === p.bestPriceFornecedorId)?.nome || 'N/A') : null
        }));
    }, [produtosDeCompra, buscaInsumo, fornecedores]);

    const validateForm = () => {
        const errors = {};
        if (!insumoForm.nome.trim()) errors.nome = "O nome do insumo é obrigatório.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveInsumo = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        try {
            if (editingInsumo) {
                await updateDocument("produtosDeCompra", editingInsumo, { nome: insumoForm.nome, unidadeAnalise: insumoForm.unidadeAnalise });
                showToast("Insumo atualizado!");
            } else {
                await addDocument("produtosDeCompra", { nome: insumoForm.nome, unidadeAnalise: insumoForm.unidadeAnalise });
                showToast("Insumo registado!");
            }
            resetInsumoForm();
        } catch (error) {
            showToast("Erro ao salvar insumo: " + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    const handleDeleteInsumo = (id) => {
        showConfirmationModal("Tem certeza que deseja apagar este insumo e todo o seu histórico de preços?", async () => {
            try {
                await deleteDocument("produtosDeCompra", id);
                showToast("Insumo apagado.");
            } catch (error) {
                showToast("Erro ao apagar: " + error.message, 'error');
            }
        });
    };

    const resetInsumoForm = () => {
        setInsumoForm({ id: null, nome: '', unidadeAnalise: 'kg' });
        setEditingInsumo(null);
        setFormErrors({});
    };

    const handleEdit = (insumo) => {
        setInsumoForm({ id: insumo.id, nome: insumo.nome, unidadeAnalise: insumo.unidadeAnalise });
        setEditingInsumo(insumo.id);
        setFormErrors({});
    };

    return (
        <div className="card">
            <h3><IconeCaixa /> Gerenciar Insumos</h3>
            <form onSubmit={handleSaveInsumo}>
                <InputField
                    label="Nome do Insumo"
                    type="text"
                    value={insumoForm.nome}
                    onChange={e => { setInsumoForm({...insumoForm, nome: e.target.value}); setFormErrors(prev => ({ ...prev, nome: '' })); }}
                    placeholder="Ex: Farinha de Trigo"
                    required
                    error={formErrors.nome}
                />
                <SelectField
                    label="Unidade para Análise de Custo"
                    value={insumoForm.unidadeAnalise}
                    onChange={e => setInsumoForm({...insumoForm, unidadeAnalise: e.target.value})}
                    options={[
                        { value: 'kg', label: 'Quilograma (kg)' },
                        { value: 'L', label: 'Litro (L)' },
                        { value: 'un', label: 'Unidade (un)' }
                    ]}
                    required
                />
                <button type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? (editingInsumo ? 'A atualizar...' : 'A registar...') : (editingInsumo ? 'Atualizar Insumo' : 'Registar Novo Insumo')}
                </button>
                {editingInsumo && <button type="button" onClick={resetInsumoForm} className="button-link">Cancelar Edição</button>}
            </form>
            <div className="divider" />
            <div className="form-group">
                <InputField
                    label="Procurar insumo"
                    type="text"
                    value={buscaInsumo}
                    onChange={e => setBuscaInsumo(e.target.value)}
                    placeholder="Procurar insumo..."
                    icon={IconeBusca}
                />
            </div>
            <div className="list-container">
                {filteredItensDeCompra.length > 0 ? filteredItensDeCompra.map(p => (
                    <div key={p.id} className="list-item">
                        <div className="list-item-info">
                            <p><strong>{p.nome}</strong> (Análise p/ {p.unidadeAnalise})</p>
                            {p.bestPrice ? (
                                <p className="sub-text" style={{color: 'var(--cor-sucesso)'}}>Melhor Preço: <strong>{formatarValorPreciso(p.bestPrice)}/{p.unidadeAnalise}</strong> ({p.bestPriceFornecedorNome})</p>
                            ) : <p className="sub-text">Nenhum custo registado.</p>}
                        </div>
                        <div className="list-item-actions">
                            <button className="button-icon" onClick={() => handleEdit(p)} aria-label={`Editar ${p.nome}`}><IconeEditar /></button>
                            <button className="button-icon" onClick={() => handleDeleteInsumo(p.id)} aria-label={`Apagar item ${p.nome}`}><IconeLixeira /></button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeCaixa />
                        <h3>Nenhum Insumo Registado</h3>
                        <p className="sub-text">Registe o seu primeiro insumo acima para poder registar compras.</p>
                        <button className="button-primary" onClick={() => setActiveTab('registrarCompra')}>
                            Ir para Registar Compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default GerenciarInsumosTab;