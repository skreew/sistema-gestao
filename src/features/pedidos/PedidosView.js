import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/Auth';
import { addDocument } from '../../services/firestoreService';
import { formatarWhatsappParaLink, formatarValorPreciso } from '../../utils/formatters';
import { IconeCarrinho, IconeLixeira, IconeBusca } from '../../utils/icons';
import ComparativePricesModal from '../../features/ComparativePricesModal/ComparativePricesModal';

const PedidosView = () => {
    const { fornecedores, produtosDeCompra } = useData();
    const { showModal } = useUI();
    const { user } = useAuth();

    const [carrinho, setCarrinho] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null); // O item de compra selecionado para adicionar ao carrinho
    const [itemData, setItemData] = useState({ qtd: 1, observacao: '', fornecedorId: '' }); // Dados do item no form
    const [showPricesModal, setShowPricesModal] = useState(false); // Controla a visibilidade do modal de preços

    // Filtra produtos de compra com base no termo de busca e inclui o nome do melhor fornecedor
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

    // Adiciona o item selecionado ao carrinho
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
            id: selectedItem.id,
            nome: selectedItem.nome,
            qtd: Number(itemData.qtd),
            observacao: itemData.observacao,
            unidade: selectedItem.unidadeAnalise,
            fornecedorItem: fornecedor.nome // Armazena o fornecedor escolhido para este item no carrinho
        });
        setCarrinho(novoCarrinho);
        resetItemSelection(); // Limpa a seleção e o formulário
    };

    // Envia o pedido via WhatsApp
    const handleSendOrder = async (fornecedorId) => {
        const fornecedor = fornecedores.find(f => f.id === fornecedorId);
        const itens = carrinho[fornecedorId];
        if (!fornecedor || !itens || itens.length === 0) {
            showModal("Não há itens no pedido para este fornecedor.");
            return;
        }

        let mensagem = `Olá, *${fornecedor.nome}*!%0AGostaria de fazer o seguinte pedido:%0A%0A`;
        itens.forEach(item => {
            mensagem += `- ${item.qtd}x ${item.nome} (${item.unidade})`;
            if (item.observacao) {
                mensagem += ` (Obs: ${item.observacao})`;
            }
            mensagem += `%0A`;
        });

        // Usar window.open para o link do WhatsApp
        window.open(`https://wa.me/${formatarWhatsappParaLink(fornecedor.whatsapp)}?text=${mensagem}`, '_blank');

        // Salvar o pedido no Firestore
        try {
            await addDocument("pedidosRealizados", {
                fornecedorId,
                fornecedorNome: fornecedor.nome,
                itens,
                solicitanteEmail: user.email,
                status: 'enviado',
                valorTotal: 0 // O valor total será atualizado na etapa de CMV quando a nota fiscal chegar
            });
        } catch (error) {
            showModal("Erro ao salvar pedido no histórico: " + error.message);
        }

        // Remover os itens do carrinho após o envio
        const novoCarrinho = { ...carrinho };
        delete novoCarrinho[fornecedorId];
        setCarrinho(novoCarrinho);
    };

    // Manipula o clique em um produto da lista de busca
    const handleProductClick = (product) => {
        setSelectedItem(product);
        // Define o fornecedor padrão como o de melhor preço, se existir
        setItemData(prev => ({ ...prev, fornecedorId: product.bestPriceFornecedorId || '' }));
        setShowPricesModal(true); // Abre o modal de comparação de preços
        setSearchTerm(''); // Limpa o termo de busca
    };

    // Manipula a seleção de um preço no modal de comparação
    const handlePriceSelected = (priceRecord) => {
        setItemData(prev => ({ ...prev, fornecedorId: priceRecord.fornecedorId }));
        setShowPricesModal(false); // Fecha o modal
    };

    // Reseta o estado do formulário e da seleção de item
    const resetItemSelection = () => {
        setSelectedItem(null);
        setSearchTerm('');
        setItemData({ qtd: 1, observacao: '', fornecedorId: '' });
    };

    return (
        <div className="card">
            <h2><IconeCarrinho /> Fazer um Pedido</h2>

            {/* SEÇÃO DE BUSCA E SELEÇÃO DE ITEM */}
            {!selectedItem && (
                <div className="form-group">
                    <label htmlFor="product-search-input">Buscar Item de Compra</label>
                    <div className="input-with-icon">
                        <span className="icon"><IconeBusca /></span>
                        <input
                            id="product-search-input"
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Digite para buscar (ex: Farinha, Queijo)..."
                            aria-label="Buscar item de compra no catálogo"
                        />
                    </div>
                    {searchTerm && filteredProducts.length > 0 && (
                        <div className="list-container" style={{maxHeight: '200px', border: '1px solid var(--cor-borda)', borderRadius: '4px', marginTop: '0.5rem'}}>
                            {filteredProducts.map(p => (
                                <div key={p.id} className="list-item" style={{cursor: 'pointer'}} onClick={() => handleProductClick(p)} aria-label={`Selecionar item ${p.nome}`}>
                                    <div className="list-item-info">
                                        <p><strong>{p.nome}</strong></p>
                                        {p.bestPrice ? (
                                            <p className="sub-text" style={{color: 'var(--cor-sucesso)'}}>
                                                Melhor Preço: {formatarValorPreciso(p.bestPrice)}/{p.unidadeAnalise} (Fornecedor: {p.bestPriceFornecedorName})
                                            </p>
                                        ) : <p className="sub-text">Sem preço registrado.</p>}
                                    </div>
                                    <button type="button" className="button-primary small" onClick={(e) => { e.stopPropagation(); handleProductClick(p); }} aria-label={`Ver preços para ${p.nome}`}>Ver Preços</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {searchTerm && filteredProducts.length === 0 && (
                        <p className="sub-text">Nenhum item de compra encontrado com este nome.</p>
                    )}
                </div>
            )}

            {/* MODAL DE COMPARAÇÃO DE PREÇOS (abre quando um item é clicado) */}
            {showPricesModal && selectedItem && (
                <ComparativePricesModal
                    item={selectedItem}
                    onSelectPrice={handlePriceSelected}
                    onClose={() => setShowPricesModal(false)}
                />
            )}

            {/* SEÇÃO PARA ADICIONAR ITEM SELECIONADO AO CARRINHO */}
            {selectedItem && (
                <form onSubmit={handleAddItem}>
                    <div style={{padding: '1rem', border: '1px solid var(--cor-borda)', borderRadius: '8px'}}>
                        <h4>Item Selecionado: {selectedItem.nome}</h4>
                        <p className="sub-text">Fornecedor escolhido: <strong>{fornecedores.find(f => f.id === itemData.fornecedorId)?.nome || 'Nenhum selecionado'}</strong></p>

                        <div className="form-group-inline">
                            <div className="form-group">
                                <label htmlFor="item-qtd-input">Quantidade</label>
                                <input id="item-qtd-input" type="number" value={itemData.qtd} onChange={e => setItemData({ ...itemData, qtd: e.target.value })} min="1" required aria-label="Quantidade do item de compra" />
                            </div>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label htmlFor="item-obs-input">Observação (Opcional)</label>
                                <input id="item-obs-input" type="text" value={itemData.observacao} onChange={e => setItemData({ ...itemData, observacao: e.target.value })} placeholder="Ex: Sem cebola" aria-label="Observação para o item" />
                            </div>
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
                            <h4>Pedido para: {fornecedor?.nome || 'Fornecedor Desconhecido'}</h4>
                            {carrinho[fornecedorId].map((item, index) => (
                                <div key={index} className="list-item">
                                    <span>{item.qtd}x {item.nome} {item.observacao && <em className="sub-text">({item.observacao})</em>}</span>
                                    <button className="button-icon" onClick={() => {
                                        const newCart = { ...carrinho };
                                        newCart[fornecedorId].splice(index, 1);
                                        if (newCart[fornecedorId].length === 0) {
                                            delete newCart[fornecedorId];
                                        }
                                        setCarrinho(newCart);
                                    }} aria-label={`Remover ${item.nome} do carrinho`}><IconeLixeira /></button>
                                </div>
                            ))}
                            <button onClick={() => handleSendOrder(fornecedorId)} className="button-primary" style={{marginTop: '1rem'}} aria-label={`Enviar pedido para ${fornecedor?.nome}`}>Enviar Pedido via WhatsApp</button>
                        </div>
                    )
                }) : <p className="sub-text">Seu carrinho está vazio. Adicione itens acima!</p>}
            </div>
        </div>
    );
};
export default PedidosView;