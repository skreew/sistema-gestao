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

  if (loadingAuth || loadingData) {
    return <LoadingScreen />;
  }

  const isAuthenticated = !!user;
  const isOnboardingComplete = userProfile?.onboardingComplete;

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to={PATHS.LOGIN} replace />;
    }
    if (userRole === ROLES.GESTOR && !isOnboardingComplete) {
      return <Navigate to={PATHS.ONBOARDING} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to={PATHS.DASHBOARD} replace />; // Redirecionar para o dashboard se não autorizado
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path={PATHS.LOGIN} element={<AccessSelectionPage />} />

        {/* Rotas protegidas que usam o MainLayout */}
        <Route element={<MainLayout />}>
          <Route
            path={PATHS.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR]}>
                <DashboardView />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.VENDAS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR]}>
                <VendasView />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.PEDIDOS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR, ROLES.COLABORADOR]}>
                <PedidosView />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CATALOGO}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR, ROLES.COLABORADOR]}>
                <CatalogoView />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.CMV}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR]}>
                <CmvView />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.FLUXO_CAIXA}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR]}>
                <FluxoDeCaixaView />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.ANALISES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR]}>
                <RelatoriosView />
              </ProtectedRoute>
            }
          />
          <Route
            path={PATHS.GESTAO_UTILIZADORES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.GESTOR]}>
                <UserManagementView />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Rota de Onboarding (específica para gestores que não completaram o onboarding) */}
        <Route
          path={PATHS.ONBOARDING}
          element={
            <ProtectedRoute allowedRoles={[ROLES.GESTOR]}>
              <OnboardingView />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento padrão para o dashboard após login ou para a página de login */}
        <Route
          path="*"
          element={
            isAuthenticated &&
            userRole === ROLES.GESTOR &&
            !isOnboardingComplete ? (
              <Navigate to={PATHS.ONBOARDING} replace />
            ) : isAuthenticated ? (
              <Navigate to={PATHS.DASHBOARD} replace />
            ) : (
              <Navigate to={PATHS.LOGIN} replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
