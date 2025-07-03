import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/Auth';
import { addDocument } from '../../services/firestoreService';
import {
  formatarWhatsappParaLink,
  formatarValorPreciso,
  formatarValor,
} from '../../utils/formatters';
import {
  IconeCarrinho,
  IconeLixeira,
  IconeBusca,
  IconeCaixa,
} from '../../utils/icons';
import ComparativePricesModal from '../../components/ComparativePricesModal/ComparativePricesModal';
import InputField from '../../components/ui/forms/InputField';

const PedidosView = () => {
  const { fornecedores, produtosDeCompra } = useData();
  const { showToast } = useUI();
  const { user } = useAuth();

  const [carrinho, setCarrinho] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemData, setItemData] = useState({
    qtd: 1,
    observacao: '',
    fornecedorId: '',
  });
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [itemFormErrors, setItemFormErrors] = useState({});

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return produtosDeCompra
      .filter((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((p) => ({
        ...p,
        bestPriceFornecedorName: p.bestPriceFornecedorId
          ? fornecedores.find((f) => f.id === p.bestPriceFornecedorId)?.nome ||
            'N/A'
          : 'N/A',
      }));
  }, [produtosDeCompra, searchTerm, fornecedores]);

  const validateItemForm = () => {
    const errors = {};
    if (!itemData.fornecedorId)
      errors.fornecedorId = 'Selecione um fornecedor.';
    if (itemData.qtd <= 0) errors.qtd = 'Quantidade deve ser maior que zero.';
    setItemFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!validateItemForm()) return;
    if (isAddingToCart) return;

    setIsAddingToCart(true);

    const fornecedor = fornecedores.find((f) => f.id === itemData.fornecedorId);
    const itemOriginal = produtosDeCompra.find((p) => p.id === selectedItem.id);

    if (
      !selectedItem ||
      !fornecedor ||
      itemData.qtd <= 0 ||
      !itemOriginal.bestPrice
    ) {
      showToast('Erro: Item, fornecedor ou preço inválido.', 'error');
      setIsAddingToCart(false);
      return;
    }

    const novoCarrinho = { ...carrinho };
    if (!novoCarrinho[fornecedor.id]) {
      novoCarrinho[fornecedor.id] = [];
    }

    const custoUnitario = itemOriginal.bestPrice;
    const custoTotalItem = custoUnitario * Number(itemData.qtd);

    novoCarrinho[fornecedor.id].push({
      id: selectedItem.id,
      nome: selectedItem.nome,
      qtd: Number(itemData.qtd),
      observacao: itemData.observacao,
      unidade: selectedItem.unidadeAnalise,
      fornecedorItem: fornecedor.nome,
      precoUnitario: custoUnitario,
      custoTotal: custoTotalItem,
    });
    setCarrinho(novoCarrinho);
    resetItemSelection();
    showToast('Item adicionado ao carrinho!');
    setIsAddingToCart(false);
  };

  const handleSendOrder = async (fornecedorId) => {
    const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
    const itens = carrinho[fornecedorId];
    if (!fornecedor || !itens || itens.length === 0) {
      showToast('Não há itens no pedido para este fornecedor.', 'error');
      return;
    }

    let mensagem = `Olá, *${fornecedor.nome}*!%0AGostaria de fazer o seguinte pedido:%0A%0A`;
    let valorTotalPedido = 0;
    itens.forEach((item) => {
      mensagem += `- ${item.qtd}x ${item.nome} (${item.unidade})`;
      if (item.observacao) {
        mensagem += ` (Obs: ${item.observacao})`;
      }
      mensagem += `%0A`;
      valorTotalPedido += item.custoTotal;
    });
    mensagem += `%0A*Valor Total Estimado: ${formatarValor(valorTotalPedido)}*`;

    window.open(
      `https://wa.me/${formatarWhatsappParaLink(fornecedor.whatsapp)}?text=${mensagem}`,
      '_blank',
    );

    try {
      await addDocument('pedidosRealizados', {
        fornecedorId,
        fornecedorNome: fornecedor.nome,
        itens,
        solicitanteEmail: user.email,
        status: 'enviado',
        valorTotal: valorTotalPedido,
        criadoEm: new Date(),
      });
      showToast('Pedido enviado e salvo no histórico!');
    } catch (error) {
      showToast(
        'Erro ao salvar pedido no histórico: ' + error.message,
        'error',
      );
    }

    const novoCarrinho = { ...carrinho };
    delete novoCarrinho[fornecedorId];
    setCarrinho(novoCarrinho);
  };

  const handleProductClick = (product) => {
    setSelectedItem(product);
    setItemData((prev) => ({
      ...prev,
      fornecedorId: product.bestPriceFornecedorId || '',
    }));
    setShowPricesModal(true);
    setSearchTerm('');
    setItemFormErrors({});
  };

  const handlePriceSelected = (priceRecord) => {
    setItemData((prev) => ({
      ...prev,
      fornecedorId: priceRecord.fornecedorId,
    }));
    setShowPricesModal(false);
  };

  const resetItemSelection = () => {
    setSelectedItem(null);
    setSearchTerm('');
    setItemData({ qtd: 1, observacao: '', fornecedorId: '' });
    setItemFormErrors({});
  };

  return (
    <div className="card">
      <h2>
        <IconeCarrinho /> Fazer um Pedido
      </h2>
      <div className="two-column-layout">
        <div className="left-column">
          <div className="form-group">
            <InputField
              id="product-search-input"
              data-cy="search-input-pedidos"
              label="Procurar Item de Compra"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para procurar (ex: Farinha, Queijo)..."
              aria-label="Procurar item de compra no catálogo"
              icon={IconeBusca}
            />
          </div>

          {searchTerm && filteredProducts.length > 0 ? (
            <div
              className="list-container"
              style={{
                maxHeight: '400px',
                border: '1px solid var(--cor-borda)',
                borderRadius: '4px',
                marginTop: '0.5rem',
              }}
            >
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="list-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleProductClick(p)}
                  data-cy="product-list-item"
                  aria-label={`Selecionar item ${p.nome}`}
                >
                  <div className="list-item-info">
                    <p>
                      <strong className="truncate-text">{p.nome}</strong>
                    </p>
                    {p.bestPrice ? (
                      <p
                        className="sub-text"
                        style={{ color: 'var(--cor-sucesso)' }}
                      >
                        Melhor Preço: {formatarValorPreciso(p.bestPrice)}/
                        {p.unidadeAnalise} (Fornecedor:{' '}
                        {p.bestPriceFornecedorName})
                      </p>
                    ) : (
                      <p className="sub-text">Sem preço registrado.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="button-primary small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(p);
                    }}
                    aria-label={`Ver preços para ${p.nome}`}
                  >
                    Ver Preços
                  </button>
                </div>
              ))}
            </div>
          ) : searchTerm && filteredProducts.length === 0 ? (
            <div className="empty-state">
              <IconeBusca />
              <h3>Nenhum Item Encontrado</h3>
              <p className="sub-text">
                Verifique o nome ou registre o insumo na aba 'Catálogo'.
              </p>
            </div>
          ) : (
            produtosDeCompra.length === 0 && (
              <div className="empty-state">
                <IconeCaixa />
                <h3>Nenhum Insumo Registrado</h3>
                <p className="sub-text">
                  Registre seus insumos na aba 'Catálogo' para começar a fazer
                  pedidos.
                </p>
              </div>
            )
          )}
        </div>

        <div className="right-column">
          {showPricesModal && selectedItem && (
            <ComparativePricesModal
              item={selectedItem}
              onSelectPrice={handlePriceSelected}
              onClose={() => setShowPricesModal(false)}
            />
          )}

          {selectedItem && (
            <form
              className="card"
              style={{ padding: '1rem', marginBottom: '1.5rem' }}
              onSubmit={handleAddItem}
            >
              <h4 data-cy="selected-item-info">
                Item Selecionado: {selectedItem.nome}
              </h4>
              <p className="sub-text" data-cy="selected-item-supplier">
                Fornecedor escolhido:{' '}
                <strong>
                  {fornecedores.find((f) => f.id === itemData.fornecedorId)
                    ?.nome || 'Nenhum selecionado'}
                </strong>
              </p>

              <div className="form-group-inline">
                <InputField
                  id="item-qtd-input"
                  data-cy="item-qtd-input"
                  label="Quantidade"
                  type="number"
                  value={itemData.qtd}
                  onChange={(e) => {
                    setItemData({ ...itemData, qtd: e.target.value });
                    setItemFormErrors((prev) => ({ ...prev, qtd: '' }));
                  }}
                  min="1"
                  required
                  error={itemFormErrors.qtd}
                  aria-label="Quantidade do item de compra"
                />
                <InputField
                  id="item-obs-input"
                  label="Observação (Opcional)"
                  type="text"
                  value={itemData.observacao}
                  onChange={(e) =>
                    setItemData({ ...itemData, observacao: e.target.value })
                  }
                  placeholder="Ex: Sem cebola"
                  aria-label="Observação para o item"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPricesModal(true)}
                className="button-secondary"
              >
                Comparar Preços
              </button>
              <button
                type="submit"
                data-cy="add-to-cart-button"
                className="button-primary"
                style={{ marginLeft: '1rem' }}
                disabled={!itemData.fornecedorId || isAddingToCart}
              >
                {isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </button>
              <button
                type="button"
                onClick={resetItemSelection}
                className="button-link"
              >
                Cancelar
              </button>
            </form>
          )}

          <h3>Itens no Carrinho</h3>
          <div
            className="list-container"
            style={{
              maxHeight: 'auto',
              border: '1px solid var(--cor-borda)',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '0.5rem',
            }}
          >
            {Object.keys(carrinho).length > 0 ? (
              Object.keys(carrinho).map((fornecedorId) => {
                const fornecedor = fornecedores.find(
                  (f) => f.id === fornecedorId,
                );
                return (
                  <div
                    key={fornecedorId}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <h4>
                      Pedido para:{' '}
                      {fornecedor?.nome || 'Fornecedor Desconhecido'}
                    </h4>
                    {carrinho[fornecedorId].map((item, index) => (
                      <div key={index} className="list-item">
                        <span>
                          {item.qtd}x {item.nome}{' '}
                          {item.observacao && (
                            <em className="sub-text">({item.observacao})</em>
                          )}
                        </span>
                        <button
                          className="button-icon danger"
                          onClick={() => {
                            const newCart = { ...carrinho };
                            newCart[fornecedorId].splice(index, 1);
                            if (newCart[fornecedorId].length === 0) {
                              delete newCart[fornecedorId];
                            }
                            setCarrinho(newCart);
                          }}
                          aria-label={`Remover ${item.nome} do carrinho`}
                        >
                          <IconeLixeira />
                        </button>
                      </div>
                    ))}
                    <button
                      className="button-primary"
                      onClick={() => handleSendOrder(fornecedorId)}
                      style={{ marginTop: '1rem' }}
                      aria-label={`Enviar pedido para ${fornecedor?.nome}`}
                    >
                      Enviar Pedido via WhatsApp
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ border: 'none' }}>
                <IconeCarrinho />
                <h3>Seu Carrinho Está Vazio</h3>
                <p className="sub-text">
                  Selecione itens na lista ao lado para adicionar ao carrinho.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PedidosView;
