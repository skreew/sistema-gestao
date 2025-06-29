import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeBusca } from '../../utils/icons';
import { formatarValorPreciso } from '../../utils/formatters';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnaliseDeCustoInsumo = () => {
    const { insumos, fornecedores, loadingData } = useData();
    const [insumoSelecionado, setInsumoSelecionado] = useState(null);

    const insumosAgrupados = useMemo(() => {
        return insumos.reduce((acc, insumo) => {
            const nomeBase = insumo.nome;
            if (!acc[nomeBase]) {
                acc[nomeBase] = [];
            }
            acc[nomeBase].push(insumo);
            return acc;
        }, {});
    }, [insumos]);

    const handleSelectInsumo = (nomeInsumo) => {
        setInsumoSelecionado(insumosAgrupados[nomeInsumo] || null);
    };

    const chartData = useMemo(() => {
        if (!insumoSelecionado) return null;

        const labels = insumoSelecionado.map(i => fornecedores.find(f => f.id === i.fornecedorId)?.nome || 'N/A');
        const data = insumoSelecionado.map(i => i.preco_por_unidade_padrao);

        return {
            labels,
            datasets: [{
                label: `Custo por ${insumoSelecionado[0].unidade_padrao}`,
                data,
                backgroundColor: 'rgba(220, 53, 69, 0.6)',
            }]
        }
    }, [insumoSelecionado, fornecedores]);


    if (loadingData) return <div className="card"><h3>Carregando análise...</h3></div>;

    return (
        <div className="card">
            <h3><IconeBusca /> Análise Comparativa de Custos por Insumo</h3>
            <div className="form-group">
                <label>Selecione um insumo para comparar os preços de compra</label>
                <select className="form-control" onChange={(e) => handleSelectInsumo(e.target.value)} defaultValue="">
                    <option value="" disabled>Escolha um insumo...</option>
                    {Object.keys(insumosAgrupados).sort().map(nome => (
                        <option key={nome} value={nome}>{nome}</option>
                    ))}
                </select>
            </div>

            {insumoSelecionado && chartData && (
                <div>
                    <div className="divider" />
                    <h4>Comparativo de Custo para: {insumoSelecionado[0].nome}</h4>
                    <div style={{ height: '300px', position: 'relative', marginBottom: '2rem' }}>
                       <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                    <div className="list-container" style={{maxHeight: '200px'}}>
                        {insumoSelecionado.sort((a,b) => a.preco_por_unidade_padrao - b.preco_por_unidade_padrao).map(i => (
                            <div key={i.id} className="list-item">
                                <p><strong>{fornecedores.find(f => f.id === i.fornecedorId)?.nome || 'N/A'}</strong></p>
                                <p>{formatarValorPreciso(i.preco_por_unidade_padrao)} / {i.unidade_padrao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnaliseDeCustoInsumo;