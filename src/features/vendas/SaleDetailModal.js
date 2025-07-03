import React from 'react';
import Modal from '../../components/ui/Modal';
import { formatarData, formatarValor } from '../../utils/formatters';
import { IconeVendas } from '../../utils/icons';

const SaleDetailModal = ({ sale, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('sale-detail-printable');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Detalhe da Venda</title>');
      printWindow.document.write(
        '<style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } h2, h3 { color: #0033a0; }</style>',
      );
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Modal
      title="Detalhes da Venda"
      onConfirm={onClose}
      confirmText="Fechar"
      showCancel={true}
      onCancel={handlePrint}
    >
      <div id="sale-detail-printable">
        <h2>
          <IconeVendas /> Detalhes da Venda
        </h2>
        <p>
          <strong>ID da Venda:</strong> {sale.id}
        </p>
        <p>
          <strong>Data:</strong> {formatarData(sale.dataVenda)}
        </p>
        <h3 style={{ marginTop: '1.5rem' }}>Itens Vendidos</h3>
        <table
          style={{
            width: '100%',
            textAlign: 'left',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                Produto
              </th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                Qtd.
              </th>
              <th
                style={{
                  borderBottom: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'right',
                }}
              >
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {sale.itensVendidos.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '8px' }}>
                  {item.productName} ({item.variantName})
                </td>
                <td style={{ padding: '8px' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {formatarValor(item.totalItemPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 style={{ textAlign: 'right', marginTop: '1.5rem' }}>
          Total da Venda: {formatarValor(sale.valorTotal)}
        </h3>
      </div>
    </Modal>
  );
};

export default SaleDetailModal;
