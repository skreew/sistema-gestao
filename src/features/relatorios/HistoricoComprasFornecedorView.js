import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeCaminhao, IconeBusca } from '../../utils/icons';
import {
  formatarData,
  formatarValor,
  formatarValorPreciso,
} from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const HistoricoComprasFornecedorView = () => {
  const { produtosDeCompra, fornecedores, loadingData } = useData();
  const [selectedFornecedorId, setSelectedFornecedorId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompras = useMemo(() => {
    if (!selectedFornecedorId) return [];

    const comprasDoFornecedor = [];
    produtosDeCompra.forEach((insumo) => {
      insumo.historicoPrecos.forEach((compra) => {
        if (compra.fornecedorId === selectedFornecedorId) {
          comprasDoFornecedor.push({
            ...compra,
            insumoNome: insumo.nome,
            insumoUnidadeAnalise: insumo.unidadeAnalise,
            id: `${insumo.id}-${compra.id || Math.random()}`,
          });
        }
      });
    });

    let filtered = comprasDoFornecedor.sort((a, b) => {
      const dateA = a.dataCompra?.toDate
        ? a.dataCompra.toDate()
        : a.dataCompra || a.dataOferta;
      const dateB = b.dataCompra?.toDate
        ? b.dataCompra.toDate()
        : b.dataCompra || b.dataOferta;
      return dateB - dateA;
    });

    if (searchTerm) {
      filtered = filtered.filter((compra) =>
        compra.insumoNome.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return filtered;
  }, [produtosDeCompra, selectedFornecedorId, searchTerm]);

  if (loadingData)
    return (
      <div className="card">
        <h3>Carregando Histórico de Compras...</h3>
      </div>
    );

  return (
    <div className="card">
      <h3>
        <IconeCaminhao /> Histórico de Compras por Fornecedor
      </h3>
      <div className="form-group">
        <SelectField
          label="Selecione um Fornecedor"
          value={selectedFornecedorId}
          onChange={(e) => setSelectedFornecedorId(e.target.value)}
          options={[
            { value: '', label: 'Selecione...', disabled: true },
            ...fornecedores.map((f) => ({ value: f.id, label: f.nome })),
          ]}
        />
      </div>

      {selectedFornecedorId && (
        <>
          <InputField
            label="Procurar"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Procurar insumo na compra..."
            icon={IconeBusca}
          />

          <div className="list-container">
            {filteredCompras.length > 0 ? (
              filteredCompras.map((compra) => (
                <div key={compra.id} className="list-item">
                  <div className="list-item-info">
                    <p>
                      <strong>{compra.insumoNome}</strong>
                    </p>
                    <p className="sub-text">
                      {compra.tipo === 'compra'
                        ? `Qtd: ${compra.quantidadeComprada} ${compra.unidadeComprada} | Preço Total: ${formatarValor(compra.precoTotalNota)} | `
                        : `Tipo: Oferta | `}
                      Custo Unitário:{' '}
                      {formatarValorPreciso(compra.precoPorUnidadeAnalise)}/
                      {compra.insumoUnidadeAnalise}
                    </p>
                    <p className="sub-text">
                      Data:{' '}
                      {formatarData(compra.dataCompra || compra.dataOferta)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <IconeBusca />
                <h3>Nenhuma Compra/Oferta Registrada</h3>
                <p className="sub-text">
                  Nenhuma compra ou oferta encontrada para este fornecedor.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default HistoricoComprasFornecedorView;
