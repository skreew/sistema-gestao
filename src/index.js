import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Importa os provedores de contexto necessários
import { AuthProvider } from './context/Auth';
import { DataProvider } from './context/DataContext';
import { UIProvider } from './context/UIContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UIProvider>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </UIProvider>
  </React.StrictMode>,
);

// Se você quiser começar a medir o desempenho em seu aplicativo, passe uma função
// para registrar os resultados (por exemplo: reportWebVitals(console.log))
// ou envie para um ponto de extremidade de análise. Saiba mais: https://bit.ly/CRA-vitals
// reportWebVitals(); // Chamada de função não utilizada removida
