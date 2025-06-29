import React from 'react';
import { IconeGrafico } from '../../utils/icons';
import AnaliseDeCustoInsumo from './AnaliseDeCustoInsumo';

const RelatoriosView = () => {
    return (
        <div>
            <div className="card">
                <h2><IconeGrafico /> Relatórios Gerenciais</h2>
                <p>Esta área é dedicada à análise aprofundada dos dados do seu negócio.</p>
            </div>
            <AnaliseDeCustoInsumo />
        </div>
    );
};

export default RelatoriosView;