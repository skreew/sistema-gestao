import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <>
      {' '}
      {/* Added React Fragment to wrap adjacent JSX elements */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
