import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SelectField from '../../components/ui/forms/SelectField';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const AnaliseDeCustoInsumo = () => {
  const { produtosDeCompra, fornecedores, loadingData } = useData();
  const [selectedItemId, setSelectedItemId] = useState('');

  const itemsWithHistory = useMemo(
    () =>
      produtosDeCompra.filter(
        (p) => p.historicoPrecos && p.historicoPrecos.length > 0,
      ),
    [produtosDeCompra],
  );

  const selectedItem = useMemo(
    () => itemsWithHistory.find((i) => i.id === selectedItemId),
    [itemsWithHistory, selectedItemId],
  );

  const chartData = useMemo(() => {
    if (!selectedItem) return null;

    const latestPrices = {};
    selectedItem.historicoPrecos.forEach((rec) => {
      const recordDate =
        rec.tipo === 'compra' ? rec.dataCompra : rec.dataOferta;
      const timestamp = recordDate.seconds
        ? recordDate.seconds
        : recordDate instanceof Date
          ? recordDate.getTime() / 1000
          : recordDate;

      if (
        !latestPrices[rec.fornecedorId] ||
        timestamp > latestPrices[rec.fornecedorId].timestamp
      ) {
        latestPrices[rec.fornecedorId] = { ...rec, timestamp: timestamp };
      }
    });
    const dataPoints = Object.values(latestPrices)
      .map((rec) => ({
        ...rec,
        fornecedorNome:
          fornecedores.find((f) => f.id === rec.fornecedorId)?.nome || 'N/A',
      }))
      .sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise);

    return {
      labels: dataPoints.map((d) => d.fornecedorNome),
      datasets: [
        {
          label: `Custo por ${selectedItem.unidadeAnalise}`,
          data: dataPoints.map((d) => d.precoPorUnidadeAnalise),
          backgroundColor: 'rgba(0, 51, 160, 0.6)',
        },
      ],
    };
  }, [selectedItem, fornecedores]);

  if (loadingData)
    return (
      <div className="card">
        <h3>Carregando análise...</h3>
      </div>
    );

  return (
    <div className="card">
      <h3>
        <IconeGrafico /> Análise Comparativa de Custos
      </h3>
      <SelectField
        label="Selecione um item para comparar preços entre fornecedores"
        id="item-select"
        value={selectedItemId}
        onChange={(e) => setSelectedItemId(e.target.value)}
        options={[
          { value: '', label: 'Escolha um item...', disabled: true },
          ...itemsWithHistory.map((item) => ({
            value: item.id,
            label: item.nome,
          })),
        ]}
      />
      {itemsWithHistory.length === 0 && (
        <div className="empty-state">
          <IconeGrafico />
          <h3>Nenhum Item com Histórico de Preços</h3>
          <p className="sub-text">
            Registre compras ou ofertas para seus insumos na aba 'Catálogo' para
            ver este gráfico.
          </p>
        </div>
      )}

      {selectedItem && chartData && (
        <div
          style={{ height: '300px', position: 'relative', marginTop: '2rem' }}
        >
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: `Comparativo para ${selectedItem.nome}`,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: `Preço por ${selectedItem.unidadeAnalise}`,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};
export default AnaliseDeCustoInsumo;
