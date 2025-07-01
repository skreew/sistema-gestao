import React, { useState } from 'react';
import { IconeCatalogo } from '../../utils/icons';
import GerenciarFornecedoresTab from './tabs/GerenciarFornecedoresTab';
import GerenciarInsumosTab from './tabs/GerenciarInsumosTab';
import RegistrarCompraTab from './tabs/RegistrarCompraTab';
import GerenciarPrecosInsumosTab from './tabs/GerenciarPrecosInsumosTab'; // Nova importação

const CatalogoView = () => {
    const [activeTab, setActiveTab] = useState('fornecedores');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'fornecedores': return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
            case 'insumos': return <GerenciarInsumosTab setActiveTab={setActiveTab} />;
            case 'registrarCompra': return <RegistrarCompraTab />;
            case 'gerenciarPrecos': return <GerenciarPrecosInsumosTab />; // Nova aba
            default: return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div>
            <div className="card">
                <h2><IconeCatalogo /> Catálogo de Itens e Fornecedores</h2>
                <p>Gerencie os seus fornecedores, registe os seus insumos e registe todas as compras para manter o controlo de custos.</p>
            </div>

            {/* Abas de navegação */}
            <div className="variantes-tabs">
                <button className={activeTab === 'fornecedores' ? 'active' : ''} onClick={() => setActiveTab('fornecedores')}>
                    Gerenciar Fornecedores
                </button>
                <button className={activeTab === 'insumos' ? 'active' : ''} onClick={() => setActiveTab('insumos')}>
                    Gerenciar Insumos
                </button>
                <button className={activeTab === 'registrarCompra' ? 'active' : ''} onClick={() => setActiveTab('registrarCompra')}>
                    Registar Nova Compra
                </button>
                <button className={activeTab === 'gerenciarPrecos' ? 'active' : ''} onClick={() => setActiveTab('gerenciarPrecos')}>
                    Gerenciar Preços de Insumos
                </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            {renderActiveTab()}
        </div>
    );
};

export default CatalogoView;