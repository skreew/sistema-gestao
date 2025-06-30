import React from 'react'; 
import GerenciarFornecedores from './GerenciarFornecedores'; 
import GerenciarCatalogo from './GerenciarCatalogo';
export default () => (
    <div className='grid-responsive'>
        <GerenciarFornecedores />
        <GerenciarCatalogo />
    </div>
);