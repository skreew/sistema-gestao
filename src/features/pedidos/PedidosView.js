import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { addDocument } from '../../services/firestoreService';
import { formatarWhatsappParaLink, formatarValorPreciso } from '../../utils/formatters';
import { IconeCarrinho, IconeLixeira, IconeBusca } from '../../utils/icons';
import ComparativePricesModal from '../ComparativePricesModal/ComparativePricesModal';

const PedidosView = () => {
    const { fornecedores, produtosDeCompra } = useData();
    const { showModal } = useUI();
    const { user } = useAuth();

    const [carrinho, setCarrinho] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemData, setItemData] = useState({ qtd: 1, observacao: '', fornecedorId: '' });
    const [showPricesModal, setShowPricesModal] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return produtosDeCompra
            .filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(p => ({
                ...p,
                bestPriceFornecedorName: p.bestPriceFornecedorId 
                    ? (fornecedores.find(f => f.id === p.bestPriceFornecedorId)?.nome || 'N/A') 
                    : 'N/A'
            }));
    }, [produtosDeCompra, searchTerm, fornecedores]);

    const handleAddItem = (e) => {
        e.preventDefault();
        const fornecedor = fornecedores.find(f => f.id === itemData.fornecedorId);
        if (!selectedItem || !fornecedor || itemData.qtd <= 0) {
            showModal("Selecione um item e um fornecedor válidos.");
            return;
        }

        const novoCarrinho = { ...carrinho };
        if (!novoCarrinho[fornecedor.id]) {
            novoCarrinho[fornecedor.id] = [];
        }
        novoCarrinho[fornecedor.id].push({
            id: selectedItem.id, nome: selectedItem.nome, qtd: Number(itemData.qtd),
            observacao: itemData.observacao, unidade: selectedItem.unidadeAnalise,
        });
        setCarrinho(novoCarrinho);
        resetItemSelection();
    };

    const handleSendOrder = async (fornecedorId) => {
        const fornecedor = fornecedores.find(f => f.id === fornecedorId);
        const itens = carrinho[fornecedorId];
        if (!fornecedor || !itens || itens.length === 0) return;

        let mensagem = `Olá, *${fornecedor.nome}*!%0AGostaria de fazer o seguinte pedido:%0A%0A`;
        itens.forEach(item => {
            mensagem += `- ${item.qtd}x ${item.nome} (${item.unidade})`;
            if (item.observacao) mensagem += ` (Obs: ${item.observacao})`;
            mensagem += `%0A`;
        });

        window.open(`https://wa.me/${formatarWhatsappParaLink(fornecedor.whatsapp)}?text=${mensagem}`, '_blank');

        try {
            await addDocument("pedidosRealizados", {
                fornecedorId, fornecedorNome: fornecedor.nome, itens,
                solicitanteEmail: user.email, status: 'enviado', valorTotal: 0,
            });
        } catch (error) {
            showModal("Erro ao salvar pedido no histórico: " + error.message);
        }

        const novoCarrinho = { ...carrinho };
        delete novoCarrinho[fornecedorId];
        setCarrinho(novoCarrinho);
    };

    const handleProductClick = (product) => {
        setSelectedItem(product);
        setItemData(prev => ({ ...prev, fornecedorId: product.bestPriceFornecedorId || '' }));
        if (product.historicoPrecos && product.historicoPrecos.length > 1) {
            setShowPricesModal(true);
        }
        setSearchTerm('');
    };

    const handlePriceSelected = (priceRecord) => {
        setItemData(prev => ({ ...prev, fornecedorId: priceRecord.fornecedorId }));
        setShowPricesModal(false);
    };

    const resetItemSelection = () => {
        setSelectedItem(null);
        setSearchTerm('');
        setItemData({ qtd: 1, observacao: '', fornecedorId: '' });
    };

    return (
        <div className="card">
            <h2><IconeCarrinho /> Fazer um Pedido</h2>

            {!selectedItem && (
                <div className="form-group">
                    <label htmlFor="product-search-input">Buscar Item de Compra</label>
                    <div className="input-with-icon">
                        <span className="icon"><IconeBusca /></span>
                        <input id="product-search-input" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Digite para buscar..."/>
                    </div>
                    {searchTerm && (
                        <div className="list-container" style={{maxHeight: '200px', border: '1px solid var(--cor-borda)', borderRadius: '4px', marginTop: '0.5rem'}}>
                            {filteredProducts.map(p => (
                                <div key={p.id} className="list-item" style={{cursor: 'pointer'}} onClick={() => handleProductClick(p)}>
                                    <p><strong>{p.nome}</strong></p>
                                    <button type="button" className="button-primary small">Selecionar</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showPricesModal && selectedItem && (
                <ComparativePricesModal item={selectedItem} onSelectPrice={handlePriceSelected} onClose={() => setShowPricesModal(false)} />
            )}

            {selectedItem && (
                <form onSubmit={handleAddItem}>
                    <div style={{padding: '1rem', border: '1px solid var(--cor-borda)', borderRadius: '8px'}}>
                        <h4>Item: {selectedItem.nome}</h4>
                        <p className="sub-text">Fornecedor: <strong>{fornecedores.find(f => f.id === itemData.fornecedorId)?.nome || 'Nenhum'}</strong></p>

                        <div className="form-group-inline">
                            <div className="form-group"><label>Quantidade</label><input type="number" value={itemData.qtd} onChange={e => setItemData({ ...itemData, qtd: e.target.value })} min="1" required /></div>
                            <div className="form-group" style={{ flex: 2 }}><label>Observação</label><input type="text" value={itemData.observacao} onChange={e => setItemData({ ...itemData, observacao: e.target.value })} placeholder="Opcional" /></div>
                        </div>
                        <button type="button" onClick={() => setShowPricesModal(true)} className="button-secondary">Comparar Preços</button>
                        <button type="submit" className="button-primary" style={{marginLeft: '1rem'}} disabled={!itemData.fornecedorId}>Adicionar ao Carrinho</button>
                        <button type="button" onClick={resetItemSelection} className="button-link">Cancelar</button>
                    </div>
                </form>
            )}

            <div className="divider" />
            <h3>Itens no Carrinho</h3>
            <div className="list-container">
                {Object.keys(carrinho).length > 0 ? Object.keys(carrinho).map(fornecedorId => {
                    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
                    return (
                        <div key={fornecedorId} style={{border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1rem'}}>
                            <h4>Pedido para: {fornecedor?.nome}</h4>
                            {carrinho[fornecedorId].map((item, index) => (
                                <div key={index} className="list-item">
                                    <span>{item.qtd}x {item.nome} {item.observacao && <em className="sub-text">({item.observacao})</em>}</span>
                                    <button className="button-icon" onClick={() => {
                                        const newCart = { ...carrinho };
                                        newCart[fornecedorId].splice(index, 1);
                                        if (newCart[fornecedorId].length === 0) delete newCart[fornecedorId];
                                        setCarrinho(newCart);
                                    }}><IconeLixeira /></button>
                                </div>
                            ))}
                            <button onClick={() => handleSendOrder(fornecedorId)} className="button-primary" style={{marginTop: '1rem'}}>Enviar Pedido via WhatsApp</button>
                        </div>
                    )
                }) : <p className="sub-text">Seu carrinho está vazio.</p>}
            </div>
        </div>
    );
};
export default PedidosView;