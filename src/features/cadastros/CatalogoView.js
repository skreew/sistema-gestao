import React, { useState, useMemo } from 'react';
import { useUI } from '../../context/UIContext';
import { useData } from '../../context/DataContext';
import { addDocument, updateDocument, deleteDocument, addDocumentToSubcollection } from '../../services/firestoreService';
import { IconeCaminhao, IconeBusca, IconeEditar, IconeLixeira, IconeMais, IconeCatalogo } from '../../utils/icons';
import { formatarWhatsappParaLink, formatarWhatsappParaExibicao, formatarValorPreciso } from '../../utils/formatters';
import Modal from '../../components/ui/Modal'; // Para o mini-modal de novo fornecedor

// Componente interno para adicionar/gerenciar um novo fornecedor (mini-modal)
const QuickAddFornecedorModal = ({ onClose, onFornecedorAdded }) => {
    const [nome, setNome] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const { showModal } = useUI();

    const handleSave = async (e) => {
        e.preventDefault();
        const formattedNumber = formatarWhatsappParaLink(whatsapp);
        if (!nome || !formattedNumber) {
            showModal('Preencha o nome e um WhatsApp válido.');
            return;
        }
        try {
            const docRef = await addDocument("fornecedores", { nome, whatsapp: formattedNumber, observacoes: null });
            showModal('Fornecedor salvo!');
            onFornecedorAdded(docRef.id);
            onClose();
        } catch (error) {
            showModal('Erro ao salvar: ' + error.message);
        }
    };

    return (
        <Modal title="Novo Fornecedor" onConfirm={handleSave} showCancel={true} onCancel={onClose} confirmText="Salvar">
            <form onSubmit={handleSave}>
                <div className="form-group"><label>Nome</label><input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da empresa" required /></div>
                <div className="form-group"><label>WhatsApp</label><input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" required /></div>
            </form>
        </Modal>
    );
};


const CatalogoView = () => {
    const { showModal, showConfirmationModal } = useUI();
    const { fornecedores, produtosDeCompra } = useData();
    const [activeTab, setActiveTab] = useState('fornecedores'); // 'fornecedores' ou 'itensDeCompra'

    // Estado para o formulário unificado de Insumos/Compras
    const [insumoForm, setInsumoForm] = useState({
        id: null, // Para edição
        nome: '',
        unidadeAnalise: 'kg',
        fornecedorId: '',
        dataCompra: new Date().toISOString().split('T')[0],
        quantidadeComprada: '',
        precoTotalNota: ''
    });
    const [isNewInsumo, setIsNewInsumo] = useState(false);
    const [buscaInsumo, setBuscaInsumo] = useState('');
    const [showQuickAddFornecedor, setShowQuickAddFornecedor] = useState(false);

    // Fornecedores para a lista
    const [buscaFornecedor, setBuscaFornecedor] = useState('');
    const filteredFornecedores = useMemo(() =>
        fornecedores.filter(f => f.nome.toLowerCase().includes(buscaFornecedor.toLowerCase())),
        [fornecedores, buscaFornecedor]
    );

    // Itens de Compra (Insumos) para a lista
    const filteredItensDeCompra = useMemo(() => {
        const products = Array.isArray(produtosDeCompra) ? produtosDeCompra : [];
        return products.filter(p => p.nome.toLowerCase().includes(buscaInsumo.toLowerCase())).map(p => ({
            ...p,
            bestPriceFornecedorNome: p.bestPriceFornecedorId ? (fornecedores.find(f => f.id === p.bestPriceFornecedorId)?.nome || 'N/A') : null
        }));
    }, [produtosDeCompra, buscaInsumo, fornecedores]);


    // --- Lógica do Super Cadastro (Insumos/Compras) ---
    const handleInsumoFormChange = (e) => {
        const { name, value } = e.target;
        setInsumoForm(prev => ({ ...prev, [name]: value }));
    };

    const handleInsumoNomeBlur = () => {
        const existingInsumo = produtosDeCompra.find(p => p.nome.toLowerCase() === insumoForm.nome.toLowerCase());
        if (existingInsumo) {
            setInsumoForm(prev => ({ ...prev, id: existingInsumo.id, unidadeAnalise: existingInsumo.unidadeAnalise }));
            setIsNewInsumo(false);
        } else {
            setInsumoForm(prev => ({ ...prev, id: null }));
            setIsNewInsumo(true);
        }
    };

    const handleSaveInsumoOrPurchase = async (e) => {
        e.preventDefault();
        const { nome, unidadeAnalise, fornecedorId, dataCompra, quantidadeComprada, precoTotalNota, id } = insumoForm;
        const qtd = parseFloat(String(quantidadeComprada).replace(',', '.'));
        const precoTotal = parseFloat(String(precoTotalNota).replace(',', '.'));

        if (!nome || !unidadeAnalise || !fornecedorId || isNaN(qtd) || qtd <= 0 || isNaN(precoTotal) || precoTotal <= 0) {
            showModal("Preencha todos os campos do insumo e da compra corretamente.");
            return;
        }

        try {
            let currentInsumoId = id;
            if (isNewInsumo || !currentInsumoId) {
                // Crie um novo documento de insumo se for um insumo novo
                const newInsumoRef = await addDocument("produtosDeCompra", { nome, unidadeAnalise });
                currentInsumoId = newInsumoRef.id;
                showModal("Novo insumo cadastrado!");
            }

            // Registrar a compra na subcoleção historicoPrecos
            const precoPorUnidadeAnalise = precoTotal / qtd;
            const purchaseRecord = {
                fornecedorId,
                dataCompra: new Date(dataCompra),
                precoTotalNota: precoTotal,
                quantidadeComprada: qtd,
                unidadeComprada: unidadeAnalise, // Unidade da compra é a unidade de análise
                precoPorUnidadeAnalise,
            };
            await addDocumentToSubcollection("produtosDeCompra", currentInsumoId, "historicoPrecos", purchaseRecord);
            showModal(`Compra registrada para ${nome}! Custo: ${formatarValorPreciso(precoPorUnidadeAnalise)}/${unidadeAnalise}`);

            resetInsumoForm();
        } catch (error) {
            showModal("Erro ao salvar insumo/compra: " + error.message);
        }
    };

    const resetInsumoForm = () => {
        setInsumoForm({
            id: null,
            nome: '',
            unidadeAnalise: 'kg',
            fornecedorId: '',
            dataCompra: new Date().toISOString().split('T')[0],
            quantidadeComprada: '',
            precoTotalNota: ''
        });
        setIsNewInsumo(false);
    };

    const handleEditInsumo = (insumo) => {
        // Preenche o formulário para edição de insumo
        setInsumoForm({
            id: insumo.id,
            nome: insumo.nome,
            unidadeAnalise: insumo.unidadeAnalise,
            fornecedorId: '', // Não preencher dados de compra aqui
            dataCompra: new Date().toISOString().split('T')[0],
            quantidadeComprada: '',
            precoTotalNota: ''
        });
        setIsNewInsumo(false); // É um insumo existente
        setActiveTab('itensDeCompra'); // Ir para a aba do formulário
    };

    const handleDeleteInsumo = (id) => {
        showConfirmationModal("Excluir este item de compra e todo seu histórico de preços?", async () => {
            try {
                await deleteDocument("produtosDeCompra", id);
                showModal("Item de compra excluído.");
            } catch (error) {
                showModal("Erro ao excluir: " + error.message);
            }
        });
    };

    // --- Renderização ---
    return (
        <div>
            <div className="card">
                <h2><IconeCatalogo /> Catálogo de Itens e Fornecedores</h2>
                <p>Gerencie seus fornecedores e todos os insumos que você compra. Para cada insumo, registre as compras para que o sistema saiba o custo por unidade.</p>
            </div>

            {/* Seção de Registro de Nova Compra / Cadastro de Insumo */}
            <div className="card">
                <h3>Registrar Nova Compra / Cadastrar Insumo</h3>
                <form onSubmit={handleSaveInsumoOrPurchase}>
                    <div className="form-group">
                        <label>Nome do Insumo</label>
                        <input
                            name="nome"
                            type="text"
                            value={insumoForm.nome}
                            onChange={handleInsumoFormChange}
                            onBlur={handleInsumoNomeBlur}
                            placeholder="Ex: Farinha de Trigo, Leite"
                            required
                        />
                    </div>

                    {isNewInsumo && (
                        <div className="form-group">
                            <label>Unidade para Análise de Custo</label>
                            <select
                                name="unidadeAnalise"
                                value={insumoForm.unidadeAnalise}
                                onChange={handleInsumoFormChange}
                                required
                            >
                                <option value="kg">Quilograma (kg)</option>
                                <option value="L">Litro (L)</option>
                                <option value="un">Unidade (un)</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Fornecedor
                            <button type="button" className="button-link" onClick={() => setShowQuickAddFornecedor(true)} style={{marginLeft: '0.5rem', fontSize: '0.9rem'}}>
                                + Novo Fornecedor
                            </button>
                        </label>
                        <select
                            name="fornecedorId"
                            value={insumoForm.fornecedorId}
                            onChange={handleInsumoFormChange}
                            required
                        >
                            <option value="">Selecione um fornecedor...</option>
                            {fornecedores.map(f => (
                                <option key={f.id} value={f.id}>{f.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Data da Compra</label>
                        <input
                            name="dataCompra"
                            type="date"
                            value={insumoForm.dataCompra}
                            onChange={handleInsumoFormChange}
                            required
                        />
                    </div>

                    <div className="form-group-inline">
                        <div className="form-group">
                            <label>Quantidade Comprada ({insumoForm.unidadeAnalise})</label>
                            <input
                                name="quantidadeComprada"
                                type="text"
                                value={insumoForm.quantidadeComprada}
                                onChange={handleInsumoFormChange}
                                placeholder={`Ex: 25 (${insumoForm.unidadeAnalise})`}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Preço Total na Nota (R$)</label>
                            <input
                                name="precoTotalNota"
                                type="text"
                                value={insumoForm.precoTotalNota}
                                onChange={handleInsumoFormChange}
                                placeholder="Ex: 120.00"
                                required
                            />
                        </div>
                    </div>

                    {insumoForm.quantidadeComprada && insumoForm.precoTotalNota && !isNaN(parseFloat(insumoForm.quantidadeComprada)) && !isNaN(parseFloat(insumoForm.precoTotalNota)) && (
                        <p style={{textAlign: 'center', fontWeight: 'bold', marginTop: '1rem'}}>
                            Custo por {insumoForm.unidadeAnalise}: {formatarValorPreciso(parseFloat(insumoForm.precoTotalNota) / parseFloat(insumoForm.quantidadeComprada))}
                        </p>
                    )}

                    <button type="submit" className="button-primary">
                        {insumoForm.id ? 'Registrar Nova Compra' : 'Cadastrar Insumo e Registrar Compra'}
                    </button>
                    {insumoForm.id && <button type="button" onClick={resetInsumoForm} className="button-link">Limpar Formulário</button>}
                </form>
            </div>

            {showQuickAddFornecedor && (
                <QuickAddFornecedorModal
                    onClose={() => setShowQuickAddFornecedor(false)}
                    onFornecedorAdded={(id) => setInsumoForm(prev => ({ ...prev, fornecedorId: id }))}
                />
            )}

            <div className="divider" />

            {/* Tabs de visualização */}
            <div className="variantes-tabs"> {/* Reutilizando a classe de tabs */}
                <button className={activeTab === 'fornecedores' ? 'active' : ''} onClick={() => setActiveTab('fornecedores')}>
                    Lista de Fornecedores
                </button>
                <button className={activeTab === 'itensDeCompra' ? 'active' : ''} onClick={() => setActiveTab('itensDeCompra')}>
                    Lista de Insumos
                </button>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === 'fornecedores' && (
                <div className="card">
                    <h3><IconeCaminhao /> Seus Fornecedores</h3>
                    <div className="form-group">
                        <div className="input-with-icon"><span className="icon"><IconeBusca /></span><input type="text" value={buscaFornecedor} onChange={e => setBuscaFornecedor(e.target.value)} placeholder="Buscar fornecedor..." /></div>
                    </div>
                    <div className="list-container">
                        {filteredFornecedores.length > 0 ? filteredFornecedores.map(f => (
                            <div key={f.id} className="list-item">
                                <div className="list-item-info">
                                    <p><strong>{f.nome}</strong></p>
                                    <a href={`https://wa.me/${f.whatsapp}`} target="_blank" rel="noopener noreferrer">{formatarWhatsappParaExibicao(f.whatsapp)}</a>
                                    {f.observacoes && <p className='sub-text'>Obs: {f.observacoes}</p>}
                                </div>
                                <div className="list-item-actions">
                                    <button className="button-icon" onClick={() => { /* Implementar edição de fornecedor direto na lista se necessário */ }} aria-label={`Editar ${f.nome}`}><IconeEditar /></button>
                                    <button className="button-icon" onClick={() => { /* Implementar exclusão de fornecedor direto na lista se necessário */ }} aria-label={`Excluir ${f.nome}`}><IconeLixeira /></button>
                                </div>
                            </div>
                        )) : <p className="sub-text">Nenhum fornecedor cadastrado.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'itensDeCompra' && (
                <div className="card">
                    <h3><IconeCatalogo /> Seus Insumos Cadastrados</h3>
                    <div className="form-group">
                        <div className="input-with-icon"><span className="icon"><IconeBusca /></span><input type="text" value={buscaInsumo} onChange={e => setBuscaInsumo(e.target.value)} placeholder="Buscar insumo..." /></div>
                    </div>
                    <div className="list-container">
                        {filteredItensDeCompra.length > 0 ? filteredItensDeCompra.map(p => (
                            <div key={p.id} className="list-item">
                                <div className="list-item-info">
                                    <p><strong>{p.nome}</strong> (Análise p/ {p.unidadeAnalise})</p>
                                    {p.bestPrice ? (
                                        <p className="sub-text" style={{color: 'var(--cor-sucesso)'}}>Melhor Preço: <strong>{formatarValorPreciso(p.bestPrice)}/{p.unidadeAnalise}</strong> ({p.bestPriceFornecedorNome})</p>
                                    ) : <p className="sub-text">Nenhum custo registrado.</p>}
                                </div>
                                <div className="list-item-actions">
                                    <button className="button-icon" onClick={() => {
                                        // Preencher o formulário principal com o insumo para registrar nova compra
                                        setInsumoForm(prev => ({ 
                                            ...prev, 
                                            id: p.id, 
                                            nome: p.nome, 
                                            unidadeAnalise: p.unidadeAnalise,
                                            fornecedorId: p.bestPriceFornecedorId || '' // Sugere o último fornecedor usado
                                        }));
                                        setIsNewInsumo(false);
                                        // Scroll para o topo para o formulário
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }} aria-label={`Registrar nova compra para ${p.nome}`}><IconeMais/></button>
                                    <button className="button-icon" onClick={() => handleDeleteInsumo(p.id)} aria-label={`Excluir item ${p.nome}`}><IconeLixeira /></button>
                                </div>
                            </div>
                        )) : <p className="sub-text">Nenhum insumo cadastrado.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogoView;