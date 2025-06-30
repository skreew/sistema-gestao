import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeBusca } from '../../utils/icons';
import { formatarValorPreciso } from '../../utils/formatters';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnaliseDeCustoInsumo = () => {
    const { produtosDeCompra, fornecedores, loadingData } = useData();
    const [selectedItem, setSelectedItem] = useState(null);

    // Filtra apenas itens que têm histórico de preços
    const itemsWithHistory = useMemo(() => 
        produtosDeCompra.filter(p => p.historicoPrecos && p.historicoPrecos.length > 0), 
    [produtosDeCompra]);

    const chartData = useMemo(() => {
        if (!selectedItem) return null;

        // Agrupa os preços pelo fornecedor, pegando sempre o mais recente
        const latestPrices = {};
        selectedItem.historicoPrecos.forEach(rec => {
            if (!latestPrices[rec.fornecedorId] || rec.dataCompra.seconds > latestPrices[rec.fornecedorId].dataCompra.seconds) {
                latestPrices[rec.fornecedorId] = rec;
            }
        });
        const dataPoints = Object.values(latestPrices)
            .map(rec => ({ ...rec, fornecedorNome: fornecedores.find(f => f.id === rec.fornecedorId)?.nome || 'N/A' }))
            .sort((a,b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise); // Ordena para o gráfico

        return {
            labels: dataPoints.map(d => d.fornecedorNome),
            datasets: [{
                label: `Custo por ${selectedItem.unidadeAnalise}`,
                data: dataPoints.map(d => d.precoPorUnidadeAnalise),
                backgroundColor: 'rgba(217, 48, 37, 0.6)',
            }]
        }
    }, [selectedItem, fornecedores]);


    if (loadingData) return <div className="card"><h3>Carregando análise...</h3></div>;

    return (
        <div className="card">
            <h3><IconeBusca /> Análise Comparativa de Custos</h3>
            <div className="form-group">
                <label htmlFor="item-select">Selecione um item para comparar preços entre fornecedores</label>
                <select id="item-select" className="form-control" onChange={e => setSelectedItem(itemsWithHistory.find(i => i.id === e.target.value))} defaultValue="">
                    <option value="" disabled>Escolha um item...</option>
                    {itemsWithHistory.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
                </select>
                {itemsWithHistory.length === 0 && (
                    <p className="sub-text">Nenhum item com histórico de preços para analisar. Cadastre e registre compras para seus insumos no "Catálogo".</p>
                )}
            </div>

            {selectedItem && chartData && (
                <div style={{ height: '300px', position: 'relative', marginTop: '2rem' }}>
                    <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false }, title: { display: true, text: `Comparativo para ${selectedItem.nome}` } } }} />
                </div>
            )}
            {!selectedItem && itemsWithHistory.length > 0 && (
                <p className="sub-text" style={{marginTop: '1rem'}}>Selecione um item acima para visualizar o comparativo de preços.</p>
            )}
        </div>
    );
};
export default AnaliseDeCustoInsumo;