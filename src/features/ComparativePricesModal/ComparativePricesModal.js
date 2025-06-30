import React, { useMemo } from 'react';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { formatarValorPreciso, formatarData } from '../../utils/formatters';

const ComparativePricesModal = ({ item, onSelectPrice, onClose }) => {
    const { fornecedores } = useData();

    const pricesBySupplier = useMemo(() => {
        if (!item?.historicoPrecos) return [];
        const latestPrices = {};
        // Pega o preço mais recente de cada fornecedor
        item.historicoPrecos.forEach(rec => {
            if (!latestPrices[rec.fornecedorId] || rec.dataCompra.seconds > latestPrices[rec.fornecedorId].dataCompra.seconds) {
                latestPrices[rec.fornecedorId] = rec;
            }
        });
        return Object.values(latestPrices)
            .map(rec => ({ ...rec, fornecedorNome: fornecedores.find(f => f.id === rec.fornecedorId)?.nome || 'N/A' }))
            .sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise);
    }, [item, fornecedores]);

    return (
        <Modal title={`Preços para: "${item.nome}"`} onConfirm={onClose} confirmText="Fechar">
            <div className="list-container" style={{maxHeight: '300px'}}>
                {pricesBySupplier.length > 0 ? pricesBySupplier.map(price => (
                    <div key={price.id} className="list-item">
                        <div>
                            <p><strong>{price.fornecedorNome}</strong></p>
                            <p className="sub-text">Última compra: {formatarData(price.dataCompra)}</p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <p><strong>{formatarValorPreciso(price.precoPorUnidadeAnalise)}/{item.unidadeAnalise}</strong></p>
                            <button type="button" className="button-primary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={() => onSelectPrice(price)}>Selecionar</button>
                        </div>
                    </div>
                )) : <p className="sub-text">Nenhum histórico de compra para este item.</p>}
            </div>
        </Modal>
    );
};
export default ComparativePricesModal;