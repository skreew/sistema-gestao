import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument } from '../../services/firestoreService';
import { IconePdv, IconeMais, IconeRemover, IconeCarrinho, IconeDinheiro } from '../../utils/icons';
import { formatarValor } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const PdvView = () => {
    const { produtos, loadingData } = useData();
    const { showToast, showConfirmationModal } = useUI();

    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState([]);
    const [isProcessingSale, setIsProcessingSale] = useState(false);

    const availableProducts = useMemo(() => {
        // Filtra produtos que têm variantes com CMV calculado (ou seja, ficha técnica completa)
        return produtos.filter(p => p.variantes && p.variantes.length > 0 && p.variantes.some(v => v.cmvCalculado > 0));
    }, [produtos]);

    const selectedProduct = useMemo(() => {
        return availableProducts.find(p => p.id === selectedProductId);
    }, [selectedProductId, availableProducts]);

    const selectedVariantData = useMemo(() => {
        return selectedProduct?.variantes.find(v => v.nomeVariante === selectedVariant);
    }, [selectedProduct, selectedVariant]);

    const totalCartValue = useMemo(() => {
        return cart.reduce((total, item) => total + item.totalItemPrice, 0);
    }, [cart]);

    const handleAddToCart = () => {
        if (!selectedProduct || !selectedVariantData || quantity <= 0) {
            showToast("Selecione um produto, uma variante e uma quantidade válida.", 'error');
            return;
        }

        const itemPrice = selectedVariantData.cmvCalculado * 2; // Exemplo: Preço de venda é 2x o CMV
        const totalItemPrice = itemPrice * quantity;

        setCart(prevCart => [
            ...prevCart,
            {
                productId: selectedProduct.id,
                productName: selectedProduct.nome,
                variantName: selectedVariantData.nomeVariante,
                quantity,
                pricePerUnit: itemPrice,
                totalItemPrice,
                timestamp: new Date(),
                // Incluir a ficha técnica para futura baixa de estoque via Cloud Function
                fichaTecnica: selectedVariantData.fichaTecnica 
            }
        ]);
        showToast(`${quantity}x ${selectedProduct.nome} (${selectedVariantData.nomeVariante}) adicionado ao carrinho.`);
        resetProductSelection();
    };

    const handleRemoveFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
        showToast("Item removido do carrinho.");
    };

    const resetProductSelection = () => {
        setSelectedProductId('');
        setSelectedVariant('');
        setQuantity(1);
    };

    const handleFinalizeSale = async () => {
        if (cart.length === 0) {
            showToast("O carrinho está vazio.", 'error');
            return;
        }

        showConfirmationModal(`Confirmar venda de ${formatarValor(totalCartValue)}?`, async () => {
            setIsProcessingSale(true);
            try {
                await addDocument("vendasPDV", {
                    itensVendidos: cart,
                    valorTotal: totalCartValue,
                    dataVenda: new Date(),
                    status: 'finalizada',
                });

                setCart([]);
                showToast("Venda finalizada com sucesso! A baixa de estoque e o lançamento no caixa dependem das Cloud Functions.");
            } catch (error) {
                showToast("Erro ao finalizar venda: " + error.message, 'error');
            } finally {
                setIsProcessingSale(false);
            }
        });
    };

    if (loadingData) return <div className="card"><h3>A carregar PDV...</h3></div>;

    return (
        <div>
            <div className="card">
                <h2><IconePdv /> Ponto de Venda (PDV)</h2>
                <p>Registe vendas de produtos finais, com cálculo automático e gestão de carrinho. Ideal para operações de balcão.</p>
            </div>

            <div className="two-column-layout">
                {/* Coluna Esquerda: Seleção de Produtos */}
                <div className="left-column">
                    <div className="card" style={{padding: '1rem'}}>
                        <h3>Adicionar Produto à Venda</h3>
                        <SelectField
                            label="Produto Final"
                            value={selectedProductId}
                            onChange={e => { setSelectedProductId(e.target.value); setSelectedVariant(''); setQuantity(1); }}
                            options={[
                                { value: '', label: 'Selecione um produto...', disabled: true },
                                ...availableProducts.map(p => ({ value: p.id, label: p.nome }))
                            ]}
                            required
                        />
                        {selectedProduct && (
                            <SelectField
                                label="Variante"
                                value={selectedVariant}
                                onChange={e => setSelectedVariant(e.target.value)}
                                options={[
                                    { value: '', label: 'Selecione uma variante...', disabled: true },
                                    ...selectedProduct.variantes.map(v => ({ value: v.nomeVariante, label: `${v.nomeVariante} - ${formatarValor(v.cmvCalculado * 2)}` }))
                                ]}
                                required
                            />
                        )}
                        <InputField
                            label="Quantidade"
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                            min="1"
                            required
                        />
                        <button onClick={handleAddToCart} className="button-primary btn-full-width" disabled={!selectedVariant || quantity <= 0}>
                            <IconeMais /> Adicionar ao Carrinho
                        </button>
                    </div>
                </div>

                {/* Coluna Direita: Carrinho de Vendas */}
                <div className="right-column">
                    <div className="card" style={{padding: '1rem'}}>
                        <h3><IconeCarrinho /> Carrinho de Vendas</h3>
                        <div className="list-container" style={{maxHeight: '300px', border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem'}}>
                            {cart.length > 0 ? cart.map((item, index) => (
                                <div key={index} className="list-item">
                                    <div className="list-item-info">
                                        <p><strong>{item.quantity}x {item.productName} ({item.variantName})</strong></p>
                                        <p className="sub-text">Preço Unitário: {formatarValor(item.pricePerUnit)}</p>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p><strong>{formatarValor(item.totalItemPrice)}</strong></p>
                                        <button className="button-icon" onClick={() => handleRemoveFromCart(index)}><IconeRemover /></button>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state" style={{border: 'none'}}>
                                    <IconeCarrinho />
                                    <h3>Carrinho Vazio</h3>
                                    <p className="sub-text">Adicione produtos à venda.</p>
                                </div>
                            )}
                        </div>
                        <div className="divider-soft" />
                        <div style={{textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem'}}>
                            Total: {formatarValor(totalCartValue)}
                        </div>
                        <button onClick={handleFinalizeSale} className="button-primary btn-full-width" style={{marginTop: '1rem'}} disabled={cart.length === 0 || isProcessingSale}>
                            {isProcessingSale ? 'A finalizar...' : <><IconeDinheiro /> Finalizar Venda</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PdvView;