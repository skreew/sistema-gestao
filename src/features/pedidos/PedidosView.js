import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { addDocument } from '../../services/firestoreService';
import { formatarWhatsappParaLink } from '../../utils/formatters';
import { IconeCarrinho, IconeLixeira } from '../../utils/icons';

const PedidosView = () => {
    const { fornecedores, produtosDeCompra } = useData();
    const { showModal } = useUI();
    const { user } = useAuth();

    const [carrinho, setCarrinho] = useState({});
    const [itemPedido, setItemPedido] = useState({ produtoId: '', qtd: 1, fornecedorId: '', observacao: '' });

    const handleAddItemAoCarrinho = (e) => {
        e.preventDefault();
        const { produtoId, qtd, fornecedorId, observacao } = itemPedido;
        const produtoInfo = produtosDeCompra.find(p => p.id === produtoId);
        if (!produtoInfo || qtd <= 0) {
            showModal("Selecione um produto e quantidade válidos.");
            return;
        }
        const novoCarrinho = { ...carrinho };
        if (!novoCarrinho[fornecedorId]) {
            novoCarrinho[fornecedorId] = [];
        }
        novoCarrinho[fornecedorId].push({ id: produtoId, nome: produtoInfo.nome, qtd: Number(qtd), observacao: observacao, unidade: produtoInfo.detalheCompra.unidadeCompra });
        setCarrinho(novoCarrinho);
        setItemPedido({ produtoId: '', qtd: 1, fornecedorId: itemPedido.fornecedorId, observacao: '' });
    };

    const handleEnviarPedidoWhatsApp = async (fornecedorId) => {
        const fornecedor = fornecedores.find(f => f.id === fornecedorId);
        const itensDoPedido = carrinho[fornecedorId];
        if (!fornecedor || !itensDoPedido || itensDoPedido.length === 0) {
            showModal("Não há itens no pedido para este fornecedor.");
            return;
        }

        let mensagem = `Olá, *${fornecedor.nome}*!\nGostaria de fazer o seguinte pedido:\n\n`;
        itensDoPedido.forEach(item => {
            mensagem += `- ${item.qtd}x ${item.nome} (${item.unidade})`;
            if (item.observacao) {
                mensagem += ` (Obs: ${item.observacao})`;
            }
            mensagem += `\n`;
        });

        const link = `https://wa.me/${formatarWhatsappParaLink(fornecedor.whatsapp)}?text=${encodeURIComponent(mensagem)}`;
        window.open(link, '_blank');

        try {
            await addDocument("pedidosRealizados", {
                fornecedorId: fornecedor.id,
                fornecedorNome: fornecedor.nome,
                itens: itensDoPedido,
                solicitanteEmail: user.isAnonymous ? 'Colaborador Anônimo' : user.email,
                status: 'enviado',
                valorTotal: 0 // Valor inicial
            });
        } catch (error) {
            showModal("Erro ao salvar pedido no histórico: " + error.message);
        }

        const novoCarrinho = { ...carrinho };
        delete novoCarrinho[fornecedorId];
        setCarrinho(novoCarrinho);
    };

    return (
        <div className="card">
            <h2><IconeCarrinho /> Fazer um Pedido</h2>
            <form onSubmit={handleAddItemAoCarrinho}>
                <div className="form-group">
                    <label>1. Fornecedor</label>
                    <select value={itemPedido.fornecedorId} onChange={(e) => setItemPedido({ ...itemPedido, fornecedorId: e.target.value, produtoId: '' })} required>
                        <option value="">Selecione...</option>
                        {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                </div>
                {itemPedido.fornecedorId && (
                    <>
                        <div className="form-group">
                            <label>2. Produto do Catálogo</label>
                            <select value={itemPedido.produtoId} onChange={(e) => setItemPedido({ ...itemPedido, produtoId: e.target.value })} required>
                                <option value="">Selecione...</option>
                                {produtosDeCompra.filter(p => p.fornecedorId === itemPedido.fornecedorId).map(p => (
                                    <option key={p.id} value={p.id}>{p.nome} ({p.detalheCompra.unidadeCompra})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label>3. Quantidade</label>
                                <input type="number" value={itemPedido.qtd} onChange={(e) => setItemPedido({ ...itemPedido, qtd: e.target.value })} min="1" required />
                            </div>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Observação (Opcional)</label>
                                <input type="text" value={itemPedido.observacao} onChange={e => setItemPedido({ ...itemPedido, observacao: e.target.value })} placeholder="Ex: Sem cebola" />
                            </div>
                        </div>
                        <button type="submit" className="button-secondary">Adicionar ao Carrinho</button>
                    </>
                )}
            </form>
            <div className="divider" />
            <h3>Itens no Carrinho</h3>
            <div className="list-container">
                {Object.keys(carrinho).length > 0 ? Object.keys(carrinho).map(fornecedorId => {
                    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
                    return (
                        <div key={fornecedorId} className="pedido-fornecedor">
                            <h4>Pedido para: {fornecedor?.nome || '...'}</h4>
                            {carrinho[fornecedorId].map((item, index) => (
                                <div key={index} className="pedido-item">
                                    <span>{item.qtd}x {item.nome} {item.observacao && <em className="sub-text">({item.observacao})</em>}</span>
                                    <button className="button-icon" onClick={() => {
                                        const novoCarrinho = { ...carrinho };
                                        novoCarrinho[fornecedorId].splice(index, 1);
                                        if (novoCarrinho[fornecedorId].length === 0) {
                                            delete novoCarrinho[fornecedorId];
                                        }
                                        setCarrinho(novoCarrinho);
                                    }}><IconeLixeira /></button>
                                </div>
                            ))}
                            <button onClick={() => handleEnviarPedidoWhatsApp(fornecedorId)} className="button-primary">Enviar Pedido</button>
                        </div>
                    )
                }) : <p className="sub-text">Seu carrinho está vazio.</p>}
            </div>
        </div>
    );
};

export default PedidosView;