import React, { useState, useTransition } from 'react';
import { IconeAnalises } from '../../utils/icons';
import AnaliseDeCustoInsumo from './AnaliseDeCustoInsumo';
import HistoricoView from './HistoricoView';
import HistoricoComprasFornecedorView from './HistoricoComprasFornecedorView';

const RelatoriosView = () => {
  const [activeTab, setActiveTab] = useState('analiseCusto');
  const [, startTransition] = useTransition(); // Removido isPending, pois não é usado na UI

  return (
    <div>
      <div className="card">
        <h2>
          <IconeAnalises /> Análises e Histórico
        </h2>
        <p>
          Analise os dados do seu negócio para tomar decisões mais inteligentes
          e visualize históricos importantes.
        </p>
      </div>

      <div className="variantes-tabs">
        <button
          className={activeTab === 'analiseCusto' ? 'active' : ''}
          onClick={() => startTransition(() => setActiveTab('analiseCusto'))}
        >
          Análise de Custo de Insumos
        </button>
        <button
          className={activeTab === 'historicoPedidos' ? 'active' : ''}
          onClick={() =>
            startTransition(() => setActiveTab('historicoPedidos'))
          }
        >
          Histórico de Pedidos
        </button>
        <button
          className={activeTab === 'historicoComprasFornecedor' ? 'active' : ''}
          onClick={() =>
            startTransition(() => setActiveTab('historicoComprasFornecedor'))
          }
        >
          Histórico de Compras por Fornecedor
        </button>
      </div>

      {activeTab === 'analiseCusto' && <AnaliseDeCustoInsumo />}
      {activeTab === 'historicoPedidos' && <HistoricoView />}
      {activeTab === 'historicoComprasFornecedor' && (
        <HistoricoComprasFornecedorView />
      )}
    </div>
  );
};
export default RelatoriosView;
