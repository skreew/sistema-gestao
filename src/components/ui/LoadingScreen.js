import React from 'react';
import { IconeCaminhao } from '../../utils/icons';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <IconeCaminhao />
      <p>Carregando sistema...</p>
    </div>
  );
};

export default LoadingScreen;
