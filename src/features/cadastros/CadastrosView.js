import React from 'react';
import GerenciarFornecedores from './GerenciarFornecedores';
import GerenciarCatalogo from './GerenciarCatalogo';

const CadastrosView = () => {
    return (
        <div className="grid-responsive">
            <GerenciarFornecedores />
            <GerenciarCatalogo />
        </div>
    );
};

export default CadastrosView;