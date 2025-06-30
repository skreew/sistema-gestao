import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const DashboardView = () => {
    const { allPedidos, loadingData } = useData();

    const chartData = useMemo(() => {
        if (loadingData || !allPedidos || allPedidos.length === 0) {
            return { barChartData: null, lineChartData: null };
        }

        const gastosPorFornecedor = allPedidos.filter(p => p.valorTotal > 0).reduce((acc, p) => {
            const nome = p.fornecedorNome || 'N/A';
            acc[nome] = (acc[nome] || 0) + p.valorTotal;
            return acc;
        }, {});

        const barData = {
            labels: Object.keys(gastosPorFornecedor),
            datasets: [{ label: 'Gastos Totais (R$)', data: Object.values(gastosPorFornecedor), backgroundColor: 'rgba(0, 51, 160, 0.6)' }],
        };

        const gastosPorMes = allPedidos.filter(p => p.criadoEm?.seconds).reduce((acc, p) => {
            const mesAno = new Date(p.criadoEm.seconds * 1000).toLocaleDateString('pt-BR', { year: '2-digit', month: 'short' });
            acc[mesAno] = (acc[mesAno] || 0) + (p.valorTotal || 0);
            return acc;
        }, {});

        const sortedMonths = Object.keys(gastosPorMes).sort((a,b) => {
            const [m1, y1] = a.split('/');
            const [m2, y2] = b.split('/');
            const dateA = new Date(`20${y1}`, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(m1));
            const dateB = new Date(`20${y2}`, ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(m2));
            return dateA - dateB;
        });

        const lineData = {
            labels: sortedMonths,
            datasets: [{ label: 'Evolução de Gastos (R$)', data: sortedMonths.map(m => gastosPorMes[m]), borderColor: '#d93025', tension: 0.1 }]
        };

        return { barChartData: barData, lineChartData: lineData };
    }, [allPedidos, loadingData]);

    if (loadingData) return <div className="card"><h2>Carregando Dashboard...</h2></div>;

    return (
        <div>
            <div className="card"><h2><IconeGrafico /> Dashboard Gerencial</h2><p>Visão geral do desempenho e custos do seu negócio.</p></div>
            <div className="grid-responsive">
                {chartData.barChartData && chartData.barChartData.labels.length > 0 ? (
                    <div className="card"><h3>Gastos por Fornecedor</h3><div style={{ height: '300px' }}><Bar data={chartData.barChartData} options={{ maintainAspectRatio: false }} /></div></div>
                ) : <div className="card"><h3>Gastos por Fornecedor</h3><p>Nenhum dado de pedido com valor para exibir.</p></div>}

                {chartData.lineChartData && chartData.lineChartData.labels.length > 0 ? (
                    <div className="card"><h3>Evolução de Gastos Mensais</h3><div style={{ height: '300px' }}><Line data={chartData.lineChartData} options={{ maintainAspectRatio: false }} /></div></div>
                ) : <div className="card"><h3>Evolução de Gastos Mensais</h3><p>Nenhum dado de pedido para exibir.</p></div>}
            </div>
        </div>
    );
};
export default DashboardView;