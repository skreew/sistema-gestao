import React from 'react';
import GerenciarFornecedores from './GerenciarFornecedores';
import GerenciarItensDeCompra from './GerenciarItensDeCompra';
import { useData } from '../../context/DataContext';
import { IconeConfiguracoes } from '../../utils/icons';

const CadastrosView = () => {
    const { fornecedores, produtosDeCompra } = useData();

    const isItensDeCompraDisabled = fornecedores.length === 0;

    return (
        <div className='grid-responsive'>
            <div className="card">
                <h2><IconeConfiguracoes /> Configurações Básicas</h2>
                <p>Gerencie os dados fundamentais para o funcionamento do sistema.</p>
            </div>
            <GerenciarFornecedores />
            <GerenciarItensDeCompra isDisabled={isItensDeCompraDisabled} />
        </div>
    );
};

export default CadastrosView;