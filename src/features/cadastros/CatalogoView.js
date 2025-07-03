import React, { useState, useTransition } from 'react';
import { IconeCatalogo } from '../../utils/icons';
import GerenciarFornecedoresTab from './tabs/GerenciarFornecedoresTab';
import GerenciarInsumosTab from './tabs/GerenciarInsumosTab';
import RegistrarCompraTab from './tabs/RegistrarCompraTab';
import GerenciarPrecosInsumosTab from './tabs/GerenciarPrecosInsumosTab';

const CatalogoView = () => {
  const [activeTab, setActiveTab] = useState('fornecedores');
  const [, startTransition] = useTransition(); // Removido isPending, pois não é usado na UI

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'fornecedores':
        return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
      case 'insumos':
        return <GerenciarInsumosTab setActiveTab={setActiveTab} />;
      case 'registrarCompra':
        return <RegistrarCompraTab />;
      case 'gerenciarPrecos':
        return <GerenciarPrecosInsumosTab />;
      default:
        return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div>
      <div className="card">
        <h2>
          <IconeCatalogo /> Catálogo de Itens e Fornecedores
        </h2>
        <p>
          Gerencie seus fornecedores, registre seus insumos e registre todas as
          compras para manter o controle de custos.
        </p>
      </div>

      <div className="variantes-tabs">
        <button
          className={activeTab === 'fornecedores' ? 'active' : ''}
          onClick={() => startTransition(() => setActiveTab('fornecedores'))}
        >
          Gerenciar Fornecedores
        </button>
        <button
          className={activeTab === 'insumos' ? 'active' : ''}
          onClick={() => startTransition(() => setActiveTab('insumos'))}
        >
          Gerenciar Insumos
        </button>
        <button
          className={activeTab === 'registrarCompra' ? 'active' : ''}
          onClick={() => startTransition(() => setActiveTab('registrarCompra'))}
        >
          Registrar Nova Compra
        </button>
        <button
          className={activeTab === 'gerenciarPrecos' ? 'active' : ''}
          onClick={() => startTransition(() => setActiveTab('gerenciarPrecos'))}
        >
          Gerenciar Preços de Insumos
        </button>
      </div>

      {renderActiveTab()}
    </div>
  );
};

export default CatalogoView;
