import React from 'react';
import { useData } from '../../context/DataContext';
import { IconeHistorico } from '../../utils/icons';
import { formatarData, formatarValor } from '../../utils/formatters';

const HistoricoView = () => {
    const { allPedidos, loadingData } = useData();

    if (loadingData) {
        return <div className="card"><h2>Carregando Histórico...</h2></div>;
    }

    return (
        <div className="card">
            <h2><IconeHistorico /> Histórico de Pedidos</h2>
            <div className="list-container">
                {allPedidos.length > 0 ? allPedidos.map(pedido => (
                    <div key={pedido.id} className="list-item">
                        <div className="list-item-info">
                            <p><strong>Fornecedor:</strong> {pedido.fornecedorNome}</p>
                            <p className="sub-text"><strong>Data:</strong> {formatarData(pedido.criadoEm)}</p>
                            <p className="sub-text"><strong>Solicitante:</strong> {pedido.solicitanteEmail}</p>
                            <p className="sub-text"><strong>Status:</strong> {pedido.status}</p>
                            <ul>{pedido.itens.map((item, index) => <li key={index}>- {item.qtd}x {item.nome}</li>)}</ul>
                        </div>
                        <p><strong>{formatarValor(pedido.valorTotal)}</strong></p>
                    </div>
                )) : <p>Nenhum pedido no histórico.</p>}
            </div>
        </div>
    );
};

export default HistoricoView;