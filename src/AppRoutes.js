import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth } from './context/Auth';
import { useData } from './context/DataContext';
import { ROLES } from './constants/roles';
import { PATHS } from './constants/paths';
import MainLayout from './components/layout/MainLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import DashboardView from './features/dashboard/DashboardView';
import PedidosView from './features/pedidos/PedidosView';
import CatalogoView from './features/cadastros/CatalogoView';
import CmvView from './features/cmv/CmvView';
import FluxoDeCaixaView from './features/fluxoDeCaixa/FluxoDeCaixaView';
import RelatoriosView from './features/relatorios/RelatoriosView';
import UserManagementView from './features/userManagement/UserManagementView';
import OnboardingView from './features/onboarding/OnboardingView';
import AccessSelectionPage from './components/auth/AccessSelectionPage';
import VendasView from './features/vendas/VendasView';

const AppRoutes = () => {
  const { user, userRole, loadingAuth, userProfile } = useAuth();
  const { loadingData } = useData();

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  // O componente ProtectedRoute agora lida com todos os redirecionamentos
  const ProtectedRoute = ({ children, allowedRoles, isPublic = false }) => {
    // Se a rota não for pública e o usuário não estiver logado, redireciona para o login
    if (!isPublic && !user) {
      return <Navigate to={PATHS.LOGIN} replace />;
    }

    // Se o usuário estiver logado e tentar acessar a página de login, redireciona para o dashboard
    if (isPublic && user) {
      return <Navigate to={PATHS.DASHBOARD} replace />;
    }

    // Lógica de onboarding: se o gestor não completou e não está na página de onboarding, redireciona pra lá
    if (
      user &&
      userRole === ROLES.GESTOR &&
      !userProfile?.onboardingComplete &&
      window.location.pathname !== PATHS.ONBOARDING
    ) {
      return <Navigate to={PATHS.ONBOARDING} replace />;
    }

    // Se o usuário logado não tiver o perfil permitido para a rota, redireciona para o dashboard
    if (allowedRoles && user && !allowedRoles.includes(userRole)) {
      return <Navigate to={PATHS.DASHBOARD} replace />;
    }

    // Se passou por todas as verificações, renderiza a página solicitada
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route
          path={PATHS.LOGIN}
          element={
            <ProtectedRoute isPublic={true}>
              <AccessSelectionPage />
            </ProtectedRoute>
          }
        />

        {/* Rotas Protegidas (que precisam de login) */}
        <Route
          element={
            <ProtectedRoute>
              {/* O MainLayout só será renderizado se o usuário estiver logado */}
              {/* E a tela de loading de dados é mostrada aqui para não travar o app */}
              {loadingData ? <LoadingScreen /> : <MainLayout />}
            </ProtectedRoute>
          }
        >
          {/* Rotas que aparecem dentro do Layout Principal */}
          <Route path={PATHS.DASHBOARD} element={<DashboardView />} />
          <Route path={PATHS.VENDAS} element={<VendasView />} />
          <Route path={PATHS.PEDIDOS} element={<PedidosView />} />
          <Route path={PATHS.CATALOGO} element={<CatalogoView />} />
          <Route path={PATHS.CMV} element={<CmvView />} />
          <Route path={PATHS.FLUXO_CAIXA} element={<FluxoDeCaixaView />} />
          <Route path={PATHS.ANALISES} element={<RelatoriosView />} />
          <Route
            path={PATHS.GESTAO_UTILIZADORES}
            element={<UserManagementView />}
          />
          {/* A rota de onboarding agora está aqui dentro, para ter o menu lateral */}
          <Route path={PATHS.ONBOARDING} element={<OnboardingView />} />
        </Route>

        {/* Redirecionamento Padrão */}
        <Route path="*" element={<Navigate to={PATHS.DASHBOARD} />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
