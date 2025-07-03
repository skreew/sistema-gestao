import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Import necessary context providers
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(); // Removed unused function call
