import React, { useMemo } from 'react';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { formatarValorPreciso, formatarData } from '../../utils/formatters';
import { IconeBusca } from '../../utils/icons';

const ComparativePricesModal = ({ item, onSelectPrice, onClose }) => {
    const { fornecedores } = useData();

    const pricesBySupplier = useMemo(() => {
        if (!item?.historicoPrecos) return [];
        const latestPrices = {};
        // Pega o preço mais recente de cada fornecedor (considerando compras e ofertas)
        item.historicoPrecos.forEach(rec => {
            const recordDate = rec.tipo === 'compra' ? rec.dataCompra : rec.dataOferta;
            const timestamp = recordDate.seconds ? recordDate.seconds : (recordDate instanceof Date ? recordDate.getTime() / 1000 : recordDate);

            if (!latestPrices[rec.fornecedorId] || timestamp > (latestPrices[rec.fornecedorId].timestamp)) {
                latestPrices[rec.fornecedorId] = { ...rec, timestamp: timestamp };
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
                            <p className="sub-text">Última {price.tipo === 'compra' ? 'compra' : 'oferta'}: {formatarData(price.dataCompra || price.dataOferta)}</p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <p><strong>{formatarValorPreciso(price.precoPorUnidadeAnalise)}/{item.unidadeAnalise}</strong></p>
                            <button type="button" className="button-primary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={() => onSelectPrice(price)}>Selecionar</button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state" style={{border: 'none'}}>
                        <IconeBusca />
                        <h3>Nenhum Histórico de Preços</h3>
                        <p className="sub-text">Registe compras ou ofertas para este insumo na aba "Catálogo" para comparar preços.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
export default ComparativePricesModal;