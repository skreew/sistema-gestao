import React from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
// Import Chart.js components
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardView = () => {
 const { allPedidos, loadingData } = useData();

    if (loadingData) {
        return <div className="card"><h2>Carregando Dashboard...</h2></div>;
    }

    const gastosPorFornecedor = allPedidos.reduce((acc, pedido) => {
        const nome = pedido.fornecedorNome || 'Sem Fornecedor';
        const valor = pedido.valorTotal || 0;
        acc[nome] = (acc[nome] || 0) + valor;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(gastosPorFornecedor),
        datasets: [
            {
                label: 'Gastos Totais por Fornecedor (R$)',
                data: Object.values(gastosPorFornecedor),
                backgroundColor: 'rgba(0, 123, 255, 0.6)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="card">
            <h2><IconeGrafico /> Dashboard Gerencial</h2>
            <div className="divider" />
            <h3>Gastos por Fornecedor</h3>
            <div style={{ height: '400px', position: 'relative' }}>
                <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
        </div>
    );
};

export default DashboardView;