import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatarData } from '../../utils/formatters';
import { IconeBusca } from '../../utils/icons';

const HistoricoView = () => {
    const { allPedidos, loadingData } = useData();
    const [filter, setFilter] = useState('');

    const filteredPedidos = useMemo(() => {
        if (!allPedidos) return [];
        return allPedidos
            .filter(p => 
                p.fornecedorNome?.toLowerCase().includes(filter.toLowerCase()) || 
                p.solicitanteEmail?.toLowerCase().includes(filter.toLowerCase())
            )
            .sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
    }, [allPedidos, filter]);

    if (loadingData) {
        return <div className="card"><h3>Carregando histórico...</h3></div>;
    }

    return (
        <div className="card">
            <h3>Histórico de Pedidos Enviados</h3>
            <div className="form-group">
                <div className="input-with-icon">
                    <span className="icon"><IconeBusca /></span>
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filtrar por fornecedor ou solicitante..."
                    />
                </div>
            </div>
            <div className="list-container">
                {filteredPedidos.length > 0 ? (
                    filteredPedidos.map(pedido => (
                        <div key={pedido.id} className="list-item">
                            <div className="list-item-info">
                                <p><strong>Fornecedor:</strong> {pedido.fornecedorNome}</p>
                                <p className="sub-text"><strong>Data:</strong> {formatarData(pedido.criadoEm)} | <strong>Solicitante:</strong> {pedido.solicitanteEmail}</p>
                                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#555', listStyleType: 'disc', margin: '0.5rem 0' }}>
                                    {pedido.itens.map((item, index) => (
                                        <li key={index}>{item.qtd}x {item.nome}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="list-item-actions">
                                <span style={{
                                    backgroundColor: 'var(--cor-borda)', 
                                    padding: '0.2rem 0.6rem', 
                                    borderRadius: '12px', 
                                    fontSize: '0.8rem'
                                }}>
                                    {pedido.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="sub-text">Nenhum pedido encontrado no histórico.</p>
                )}
            </div>
        </div>
    );
};

export default HistoricoView;