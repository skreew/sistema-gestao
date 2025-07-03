import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { deleteDocument } from '../../services/firestoreService';
import {
  IconeVendas,
  IconeLixeira,
  IconeBusca,
  IconeCalendario,
  IconeOlho,
} from '../../utils/icons';
import { formatarData, formatarValor } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SaleDetailModal from './SaleDetailModal';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const VendasView = () => {
  const { vendas, loadingData } = useData();
  const { showConfirmationModal, showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  const filteredVendas = useMemo(() => {
    let filtered = vendas;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (venda) =>
          venda.id.toLowerCase().includes(lowerCaseSearchTerm) ||
          (venda.itensVendidos &&
            venda.itensVendidos.some((item) =>
              item.productName.toLowerCase().includes(lowerCaseSearchTerm),
            )),
      );
    }

    if (filterDateStart) {
      const startDate = new Date(filterDateStart);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((venda) => {
        const vendaDate = venda.dataVenda.toDate
          ? venda.dataVenda.toDate()
          : new Date(venda.dataVenda.seconds * 1000);
        return vendaDate >= startDate;
      });
    }

    if (filterDateEnd) {
      const endDate = new Date(filterDateEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((venda) => {
        const vendaDate = venda.dataVenda.toDate
          ? venda.dataVenda.toDate()
          : new Date(venda.dataVenda.seconds * 1000);
        return vendaDate <= endDate;
      });
    }

    return filtered;
  }, [vendas, searchTerm, filterDateStart, filterDateEnd]);

  const handleDeleteVenda = (id) => {
    showConfirmationModal(
      'Tem certeza que deseja apagar esta venda do histórico?',
      async () => {
        try {
          await deleteDocument('vendas', id);
          showToast('Venda apagada do histórico.');
        } catch (error) {
          showToast('Erro ao apagar venda: ' + error.message, 'error');
        }
      },
    );
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Vendas', 14, 16);

    const tableColumn = ['ID da Venda', 'Data', 'Itens', 'Valor Total (R$)'];
    const tableRows = [];

    filteredVendas.forEach((venda) => {
      const dataFormatada = formatarData(venda.dataVenda);
      const valorFormatado = formatarValor(venda.valorTotal);
      const itens = venda.itensVendidos
        .map((item) => `${item.quantity}x ${item.productName}`)
        .join(', ');
      tableRows.push([venda.id, dataFormatada, itens, valorFormatado]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save('relatorio_vendas.pdf');
  };

  const csvData = filteredVendas.map((venda) => ({
    id: venda.id,
    data: formatarData(venda.dataVenda),
    valorTotal: venda.valorTotal,
    itens: venda.itensVendidos
      .map((item) => `${item.quantity}x ${item.productName}`)
      .join('; '),
  }));

  if (loadingData && vendas.length === 0)
    return (
      <div className="card">
        <h3>Carregando Vendas...</h3>
      </div>
    );

  return (
    <div>
      {selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
      <div className="card">
        <h2>
          <IconeVendas /> Histórico de Vendas
        </h2>
        <p>
          Consulte todas as vendas registradas no sistema. Utilize os filtros
          para refinar sua pesquisa.
        </p>
      </div>
      <div className="card">
        <h3>Filtros e Exportação</h3>
        <div className="form-group-inline">
          <InputField
            label="Procurar"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Procurar por ID ou item..."
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
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={generatePdf}
            className="button-secondary"
            disabled={filteredVendas.length === 0}
          >
            Exportar PDF
          </button>
          <CSVLink
            data={csvData}
            headers={[
              { label: 'ID', key: 'id' },
              { label: 'Data', key: 'data' },
              { label: 'Valor Total', key: 'valorTotal' },
              { label: 'Itens', key: 'itens' },
            ]}
            filename={'relatorio_vendas.csv'}
            className="button-secondary"
            target="_blank"
          >
            {filteredVendas.length === 0 ? (
              'Exportar CSV'
            ) : (
              <span style={{ color: 'var(--cor-primaria)' }}>Exportar CSV</span>
            )}
          </CSVLink>
        </div>
      </div>
      <div className="list-container">
        {filteredVendas.length > 0 ? (
          filteredVendas.map((venda) => (
            <div key={venda.id} className="list-item">
              <div className="list-item-info">
                <p>
                  <strong>ID da Venda:</strong> {venda.id.substring(0, 8)}...
                </p>
                <p className="sub-text">
                  <strong>Data:</strong> {formatarData(venda.dataVenda)}
                </p>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                  {venda.itensVendidos.map((item, idx) => (
                    <li key={idx} className="sub-text">
                      {item.quantity}x {item.productName}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    color: 'var(--cor-sucesso)',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  {formatarValor(venda.valorTotal)}
                </p>
                <div>
                  <button
                    className="button-icon"
                    onClick={() => setSelectedSale(venda)}
                    aria-label="Ver Detalhes"
                  >
                    <IconeOlho />
                  </button>
                  <button
                    className="button-icon danger"
                    onClick={() => handleDeleteVenda(venda.id)}
                    aria-label="Apagar Venda"
                  >
                    <IconeLixeira />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <IconeVendas />
            <h3>Nenhuma Venda Encontrada</h3>
            <p className="sub-text">
              Não há vendas registradas que correspondam aos filtros
              selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendasView;
