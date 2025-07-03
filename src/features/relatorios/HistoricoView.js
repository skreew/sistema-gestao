import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { deleteDocument } from '../../services/firestoreService';
import { formatarData, formatarValor } from '../../utils/formatters';
import {
  IconeCarrinho,
  IconeLixeira,
  IconeBusca,
  IconeCalendario,
} from '../../utils/icons';
import InputField from '../../components/ui/forms/InputField';

const HistoricoView = () => {
  const { allPedidos, loadingData } = useData();
  const { showConfirmationModal, showToast } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const filteredPedidos = useMemo(() => {
    let filtered = allPedidos;

    if (searchTerm) {
      filtered = filtered.filter(
        (pedido) =>
          pedido.fornecedorNome
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pedido.itens.some((item) =>
            item.nome.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    if (filterDateStart) {
      const startDate = new Date(filterDateStart);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((pedido) => {
        const pedidoDate = pedido.criadoEm.toDate
          ? pedido.criadoEm.toDate()
          : new Date(pedido.criadoEm.seconds * 1000);
        return pedidoDate >= startDate;
      });
    }

    if (filterDateEnd) {
      const endDate = new Date(filterDateEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((pedido) => {
        const pedidoDate = pedido.criadoEm.toDate
          ? pedido.criadoEm.toDate()
          : new Date(pedido.criadoEm.seconds * 1000);
        return pedidoDate <= endDate;
      });
    }

    return filtered;
  }, [allPedidos, searchTerm, filterDateStart, filterDateEnd]);

  const handleDeletePedido = (id) => {
    showConfirmationModal(
      'Tem certeza que deseja apagar este pedido do histórico?',
      async () => {
        try {
          await deleteDocument('pedidosRealizados', id);
          showToast('Pedido apagado do histórico.');
        } catch (error) {
          showToast('Erro ao apagar: ' + error.message, 'error');
        }
      },
    );
  };

  if (loadingData && allPedidos.length === 0)
    return (
      <div className="card">
        <h3>Carregando Histórico...</h3>
      </div>
    );

  return (
    <div className="card">
      <h3>
        <IconeCarrinho /> Histórico de Pedidos
      </h3>
      <div className="form-group-inline">
        <InputField
          label="Procurar"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Procurar por fornecedor ou item..."
          icon={IconeBusca}
        />
        <InputField
          label="De:"
          type="date"
          value={filterDateStart}
          onChange={(e) => setFilterDateStart(e.target.value)}
          icon={IconeCalendario}
        />
        <InputField
          label="Até:"
          type="date"
          value={filterDateEnd}
          onChange={(e) => setFilterDateEnd(e.target.value)}
          icon={IconeCalendario}
        />
      </div>
      <div className="list-container">
        {filteredPedidos.length > 0 ? (
          filteredPedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="list-item"
              style={{ flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <strong>{pedido.fornecedorNome}</strong>
                <span className="sub-text">
                  {formatarData(pedido.criadoEm)}
                </span>
              </div>
              <ul style={{ paddingLeft: '1rem', margin: '0.5rem 0' }}>
                {pedido.itens.map((item, idx) => (
                  <li key={idx} className="sub-text">
                    {item.qtd}x {item.nome}
                  </li>
                ))}
              </ul>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontWeight: 'bold',
                }}
              >
                <span>Total: {formatarValor(pedido.valorTotal)}</span>
                <button
                  className="button-icon danger"
                  onClick={() => handleDeletePedido(pedido.id)}
                >
                  <IconeLixeira />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <IconeCarrinho />
            <h3>Nenhum Pedido no Histórico</h3>
            <p className="sub-text">
              Faça pedidos na aba 'Fazer um Pedido' para ver o histórico aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HistoricoView;
