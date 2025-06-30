import React from 'react';
import { IconeAnalises } from '../../utils/icons';
import AnaliseDeCustoInsumo from './AnaliseDeCustoInsumo';
import HistoricoView from './HistoricoView'; // Agora HistoricoView é um subcomponente aqui

const RelatoriosView = () => {
    return (
        <div>
            <div className="card">
                <h2><IconeAnalises /> Análises e Histórico</h2>
                <p>Analise os dados do seu negócio para tomar decisões mais inteligentes.</p>
            </div>
            <AnaliseDeCustoInsumo />
            <HistoricoView />
        </div>
    );
};
export default RelatoriosView;