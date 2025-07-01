import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { setDocument, deleteDocument } from '../../services/firestoreService';
import { IconeEstoque, IconeBusca, IconeEditar, IconeLixeira } from '../../utils/icons';
import { formatarData } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const EstoqueView = () => {
    const { produtosDeCompra, estoque, loadingData } = useData();
    const { showToast, showConfirmationModal } = useUI();

    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [editingEstoque, setEditingEstoque] = useState(null);
    const [buscaEstoque, setBuscaEstoque] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const filteredEstoque = useMemo(() => {
        const items = Array.isArray(estoque) ? estoque : [];
        return items.filter(item =>
            item.nome.toLowerCase().includes(buscaEstoque.toLowerCase())
        );
    }, [estoque, buscaEstoque]);

    const insumosDisponiveis = useMemo(() => {
        return produtosDeCompra.filter(insumo =>
            !estoque.some(item => item.insumoId === insumo.id) || (editingEstoque && editingEstoque.insumoId === insumo.id)
        );
    }, [produtosDeCompra, estoque, editingEstoque]);

    const validateForm = () => {
        const errors = {};
        if (!selectedInsumoId) errors.selectedInsumoId = "Selecione um insumo.";
        if (isNaN(parseFloat(String(quantidade).replace(',', '.'))) || parseFloat(String(quantidade).replace(',', '.')) < 0) errors.quantidade = "Quantidade inválida.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveEstoque = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const insumo = produtosDeCompra.find(p => p.id === selectedInsumoId);
        if (!insumo) {
            showToast("Insumo não encontrado. Por favor, selecione um insumo válido.", 'error');
            setIsSaving(false);
            return;
        }

        // Garante que unidadeAnalise não é undefined
        const unidadeAnaliseValue = insumo.unidadeAnalise || 'un'; 

        const data = {
            insumoId: insumo.id,
            nome: insumo.nome,
            unidadeAnalise: unidadeAnaliseValue, // Usa o valor garantido
            quantidade: parseFloat(String(quantidade).replace(',', '.')),
        };

        try {
            // Usamos o ID do insumo como ID do documento no estoque para garantir unicidade
            await setDocument("estoque", insumo.id, data);
            showToast(editingEstoque ? "Estoque atualizado!" : "Estoque registado!");
            resetForm();
        } catch (error) {
            showToast("Erro ao salvar estoque: " + error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditEstoque = (item) => {
        setEditingEstoque(item);
        setSelectedInsumoId(item.insumoId);
        setQuantidade(item.quantidade);
        setFormErrors({});
    };

    const handleDeleteEstoque = (id) => {
        showConfirmationModal("Tem certeza que deseja apagar este item do estoque?", async () => {
            try {
                await deleteDocument("estoque", id);
                showToast("Item de estoque apagado.");
            } catch (error) {
                showToast("Erro ao apagar: " + error.message, 'error');
            }
        });
    };

    const resetForm = () => {
        setEditingEstoque(null);
        setSelectedInsumoId('');
        setQuantidade('');
        setFormErrors({});
    };


    if (loadingData) return <div className="card"><h3>A carregar Estoque...</h3></div>;

    return (
        <div>
            <div className="card">
                <h2><IconeEstoque /> Gestão de Estoque</h2>
                <p>Controle as quantidades dos seus insumos em estoque. Mantenha os registos atualizados para uma gestão eficiente.</p>
            </div>

            <div className="card">
                <h3>{editingEstoque ? 'Atualizar Item no Estoque' : 'Adicionar Item ao Estoque'}</h3>
                <form onSubmit={handleSaveEstoque}>
                    <SelectField
                        label="Insumo"
                        value={selectedInsumoId}
                        onChange={e => { setSelectedInsumoId(e.target.value); setFormErrors(prev => ({ ...prev, selectedInsumoId: '' })); }}
                        options={[
                            { value: '', label: 'Selecione um insumo...', disabled: true },
                            ...insumosDisponiveis.map(insumo => ({ value: insumo.id, label: `${insumo.nome} (${insumo.unidadeAnalise || 'un'})` }))
                        ]}
                        required
                        error={formErrors.selectedInsumoId}
                        disabled={editingEstoque !== null}
                    />
                    <InputField
                        label={`Quantidade em Estoque (${produtosDeCompra.find(p => p.id === selectedInsumoId)?.unidadeAnalise || 'un'})`}
                        type="text"
                        value={quantidade}
                        onChange={e => { setQuantidade(e.target.value); setFormErrors(prev => ({ ...prev, quantidade: '' })); }}
                        placeholder="Ex: 50"
                        required
                        error={formErrors.quantidade}
                    />
                    <button type="submit" className="button-primary" disabled={isSaving}>
                        {isSaving ? (editingEstoque ? 'A atualizar...' : 'A registar...') : (editingEstoque ? 'Atualizar Estoque' : 'Registar Estoque')}
                    </button>
                    {editingEstoque && <button type="button" onClick={resetForm} className="button-link">Cancelar Edição</button>}
                </form>
            </div>

            <div className="card">
                <h3>Itens em Estoque</h3>
                <div className="form-group">
                    <InputField
                        label="Procurar item no estoque"
                        type="text"
                        value={buscaEstoque}
                        onChange={e => setBuscaEstoque(e.target.value)}
                        placeholder="Procurar insumo no estoque..."
                        icon={IconeBusca}
                    />
                </div>
                <div className="list-container">
                    {filteredEstoque.length > 0 ? filteredEstoque.map(item => (
                        <div key={item.id} className="list-item">
                            <div className="list-item-info">
                                <p><strong>{item.nome}</strong></p>
                                <p className="sub-text">Quantidade: {item.quantidade} {item.unidadeAnalise}</p>
                                {item.ultimaAtualizacao && <p className="sub-text">Última atualização: {formatarData(item.ultimaAtualizacao)}</p>}
                            </div>
                            <div className="list-item-actions">
                                <button className="button-icon" onClick={() => handleEditEstoque(item)} aria-label={`Editar ${item.nome}`}><IconeEditar /></button>
                                <button className="button-icon" onClick={() => handleDeleteEstoque(item.id)} aria-label={`Apagar ${item.nome}`}><IconeLixeira /></button>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">
                            <IconeEstoque />
                            <h3>Nenhum Item em Estoque</h3>
                            <p className="sub-text">Registe o seu primeiro item de estoque acima.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default EstoqueView;