import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const DashboardView = () => {
    const { allPedidos, loadingData } = useData();

    const { barChartData, lineChartData } = useMemo(() => {
        if (loadingData || allPedidos.length === 0) {
            return { barChartData: null, lineChartData: null };
        }

        // --- Gráfico de Barras: Gastos por Fornecedor ---
        const gastosPorFornecedor = allPedidos.reduce((acc, pedido) => {
            if(pedido.status === 'finalizado') {
                const nome = pedido.fornecedorNome || 'Sem Fornecedor';
                const valor = pedido.valorTotal || 0;
                acc[nome] = (acc[nome] || 0) + valor;
            }
            return acc;
        }, {});

        const barData = {
            labels: Object.keys(gastosPorFornecedor),
            datasets: [{
                label: 'Gastos Totais por Fornecedor (R$)',
                data: Object.values(gastosPorFornecedor),
                backgroundColor: 'rgba(0, 123, 255, 0.6)',
            }],
        };

        // --- Gráfico de Linha: Gastos Mensais ---
        const gastosPorMes = allPedidos.reduce((acc, pedido) => {
            if (pedido.status === 'finalizado' && pedido.criadoEm) {
                const mesAno = new Date(pedido.criadoEm.seconds * 1000).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' });
                const valor = pedido.valorTotal || 0;
                acc[mesAno] = (acc[mesAno] || 0) + valor;
            }
            return acc;
        }, {});

        const sortedMonths = Object.keys(gastosPorMes).sort((a, b) => {
            const [m1, y1] = a.split('/');
            const [m2, y2] = b.split('/');
            return new Date(`${y1}-${m1}-01`) - new Date(`${y2}-${m2}-01`);
        });

        const lineData = {
            labels: sortedMonths,
            datasets: [{
                label: 'Gastos Mensais (R$)',
                data: sortedMonths.map(mes => gastosPorMes[mes]),
                fill: false,
                borderColor: 'rgb(220, 53, 69)',
                tension: 0.1
            }]
        };

        return { barChartData: barData, lineChartData: lineData };
    }, [allPedidos, loadingData]);

    if (loadingData) {
        return <div className="card"><h2>Carregando Dashboard...</h2></div>;
    }

    return (
        <div className="grid-responsive">
            <div className="card">
                <h2><IconeGrafico /> Dashboard Gerencial</h2>
                <p>Visão geral do desempenho e custos do seu negócio.</p>
            </div>
            {barChartData && (
                <div className="card">
                    <h3>Gastos por Fornecedor (Pedidos Finalizados)</h3>
                    <div style={{ height: '400px', position: 'relative' }}>
                        <Bar data={barChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                </div>
            )}
            {lineChartData && (
                 <div className="card">
                    <h3>Evolução de Gastos Mensais (Pedidos Finalizados)</h3>
                    <div style={{ height: '400px', position: 'relative' }}>
                        <Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;