import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // PASSO 1: Importar o hook de navegação
import { useAuth } from '../../context/Auth';
import { useData } from '../../context/DataContext';
import { PATHS } from '../../constants/paths'; // Importar os caminhos das rotas
import { IconeCaminhao, IconeCheck, IconeCirculo } from '../../utils/icons';
import { useUI } from '../../context/UIContext';

const OnboardingView = () => {
  const navigate = useNavigate(); // PASSO 2: Preparar a função de navegação
  const { user, updateOnboardingStatus } = useAuth();
  const { fornecedores, produtosDeCompra, produtos } = useData();
  const { showToast } = useUI();
  const [isCompleting, setIsCompleting] = useState(false);

  const checklist = [
    {
      text: 'Registrar seu primeiro fornecedor',
      isComplete: fornecedores.length > 0,
    },
    {
      text: 'Registrar um item de compra (insumo)',
      isComplete: produtosDeCompra.length > 0,
    },
    {
      text: 'Registrar uma compra para ter um custo',
      isComplete: produtosDeCompra.some((p) => p.bestPrice),
    },
    {
      text: 'Criar sua primeira Ficha Técnica',
      isComplete: produtos.length > 0,
    },
  ];
  const allComplete = checklist.every((item) => item.isComplete);

  const handleCompleteOnboarding = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      // Espera a atualização no Firebase ser concluída
      await updateOnboardingStatus(user.uid, true);

      showToast('Configuração concluída! Bem-vindo(a)!', 'success');

      // PASSO 3: Forçar a navegação para o Dashboard
      navigate(PATHS.DASHBOARD);
    } catch (error) {
      console.error('Falha ao completar o onboarding:', error);
      showToast('Ocorreu um erro ao finalizar. Tente novamente.', 'error');
      setIsCompleting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card" style={{ maxWidth: '600px' }}>
        <h1>
          {' '}
          <IconeCaminhao /> Primeiros Passos!{' '}
        </h1>
        <p>
          {' '}
          Bem-vindo(a)! Complete os passos abaixo para configurar o
          sistema.{' '}
        </p>
        <div className="divider" />
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {checklist.map((item, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem',
                fontSize: '1.1rem',
              }}
            >
              <span
                style={{
                  marginRight: '1rem',
                  color: item.isComplete
                    ? 'var(--cor-sucesso)'
                    : 'var(--cor-borda)',
                }}
              >
                {item.isComplete ? <IconeCheck /> : <IconeCirculo />}
              </span>
              {item.text}
            </li>
          ))}
        </ul>
        <button
          onClick={handleCompleteOnboarding}
          className="button-primary btn-full-width"
          style={{ marginTop: '1rem' }}
          disabled={!allComplete || isCompleting}
        >
          {isCompleting
            ? 'Aguarde...'
            : allComplete
              ? 'Vamos Começar!'
              : 'Complete os passos para continuar'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingView;
