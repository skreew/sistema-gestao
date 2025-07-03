import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatarValor } from '../../utils/formatters'; // Mantido, pois formatarValor é usado no JSX

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const DashboardView = () => {
  const { allPedidos, faturamentos, despesas, loadingData } = useData();

  const { barChartData, fluxoCaixaData } = useMemo(() => {
    if (loadingData) {
      return { barChartData: null, fluxoCaixaData: null };
    }

    const gastosPorFornecedor = allPedidos
      .filter((p) => p.status === 'finalizado' && p.valorTotal > 0)
      .reduce((acc, p) => {
        const nome = p.fornecedorNome || 'N/A';
        acc[nome] = (acc[nome] || 0) + p.valorTotal;
        return acc;
      }, {});

    const barData = {
      labels: Object.keys(gastosPorFornecedor),
      datasets: [
        {
          label: 'Gastos Totais (R$)',
          data: Object.values(gastosPorFornecedor),
          backgroundColor: 'rgba(0, 51, 160, 0.6)',
        },
      ],
    };

    const fluxoPorMes = {};
    faturamentos.forEach((f) => {
      const date = f.data.toDate
        ? f.data.toDate()
        : new Date(f.data.seconds * 1000);
      const mesAno = date.toLocaleDateString('pt-BR', {
        year: '2-digit',
        month: 'short',
      });
      fluxoPorMes[mesAno] = fluxoPorMes[mesAno] || {
        faturamento: 0,
        despesa: 0,
      };
      fluxoPorMes[mesAno].faturamento += f.valor;
    });
    despesas.forEach((d) => {
      const date = d.data.toDate
        ? d.data.toDate()
        : new Date(d.data.seconds * 1000);
      const mesAno = date.toLocaleDateString('pt-BR', {
        year: '2-digit',
        month: 'short',
      });
      fluxoPorMes[mesAno] = fluxoPorMes[mesAno] || {
        faturamento: 0,
        despesa: 0,
      };
      fluxoPorMes[mesAno].despesa += d.valor;
    });

    const sortedMonthsFluxo = Object.keys(fluxoPorMes).sort((a, b) => {
      const dateA = new Date('01 ' + a.replace('/', ' '));
      const dateB = new Date('01 ' + b.replace('/', ' '));
      return dateA - dateB;
    });

    const fluxoData = {
      labels: sortedMonthsFluxo,
      datasets: [
        {
          label: 'Faturamento (R$)',
          data: sortedMonthsFluxo.map((m) => fluxoPorMes[m].faturamento),
          borderColor: 'var(--cor-sucesso)',
          backgroundColor: 'rgba(0, 158, 77, 0.2)',
          fill: true,
          tension: 0.1,
        },
        {
          label: 'Despesas (R$)',
          data: sortedMonthsFluxo.map((m) => fluxoPorMes[m].despesa),
          borderColor: 'var(--cor-perigo)',
          backgroundColor: 'rgba(217, 48, 37, 0.2)',
          fill: true,
          tension: 0.1,
        },
      ],
    };

    return { barChartData: barData, fluxoCaixaData: fluxoData };
  }, [allPedidos, faturamentos, despesas, loadingData]);

  if (loadingData)
    return (
      <div className="card">
        <h2>Carregando Dashboard...</h2>
      </div>
    );

  return (
    <div>
      <div className="card">
        <h2>
          <IconeGrafico /> Dashboard Gerencial
        </h2>
        <p>Visão geral do desempenho e custos do seu negócio.</p>
      </div>
      <div className="two-column-layout">
        {barChartData && Object.keys(barChartData.labels).length > 0 ? (
          <div className="card">
            <h3>Gastos por Fornecedor</h3>
            <div style={{ height: '300px' }}>
              <Bar
                data={barChartData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <IconeGrafico />
            <h3>Nenhum Gasto por Fornecedor</h3>
            <p className="sub-text">
              Registre pedidos e marque-os como finalizados para ver este
              gráfico.
            </p>
          </div>
        )}

        {fluxoCaixaData && Object.keys(fluxoCaixaData.labels).length > 0 ? (
          <div className="card">
            <h3>Fluxo de Caixa Mensal</h3>
            <div style={{ height: '300px' }}>
              <Line
                data={fluxoCaixaData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <IconeGrafico />
            <h3>Nenhum Dado de Fluxo de Caixa</h3>
            <p className="sub-text">
              Registre faturamentos e despesas na aba 'Fluxo de Caixa' para ver
              este gráfico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardView;
