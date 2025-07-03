import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/Auth';
import { useUI } from '../../context/UIContext';
import { ROLES } from '../../constants/roles';
import { PATHS } from '../../constants/paths';
import Modal from '../ui/Modal';
import {
  IconeDashboard,
  IconeCarrinho,
  IconeCatalogo,
  IconeFichaTecnica,
  IconeDinheiro,
  IconeAnalises,
  IconeUsers,
  IconeLogout,
  IconeMenu,
  IconeFechar,
  IconeVendas,
} from '../../utils/icons';

const MainLayout = () => {
  const { user, userRole, logout } = useAuth();
  const { confirmationModal, handleConfirmAction, closeConfirmationModal } =
    useUI();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      path: PATHS.DASHBOARD,
      label: 'Dashboard',
      icon: IconeDashboard,
      roles: [ROLES.GESTOR],
    },
    {
      path: PATHS.VENDAS,
      label: 'Vendas',
      icon: IconeVendas,
      roles: [ROLES.GESTOR],
    },
    {
      path: PATHS.PEDIDOS,
      label: 'Pedidos',
      icon: IconeCarrinho,
      roles: [ROLES.GESTOR, ROLES.COLABORADOR],
    },
    {
      path: PATHS.CATALOGO,
      label: 'Catálogo',
      icon: IconeCatalogo,
      roles: [ROLES.GESTOR, ROLES.COLABORADOR],
    },
    {
      path: PATHS.CMV,
      label: 'Fichas Técnicas',
      icon: IconeFichaTecnica,
      roles: [ROLES.GESTOR],
    },
    {
      path: PATHS.FLUXO_CAIXA,
      label: 'Fluxo de Caixa',
      icon: IconeDinheiro,
      roles: [ROLES.GESTOR],
    },
    {
      path: PATHS.ANALISES,
      label: 'Análises e Relatórios',
      icon: IconeAnalises,
      roles: [ROLES.GESTOR],
    },
    {
      path: PATHS.GESTAO_UTILIZADORES,
      label: 'Gestão de Usuários',
      icon: IconeUsers,
      roles: [ROLES.GESTOR],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <div className="App">
      {confirmationModal.isOpen && (
        <Modal
          title="Confirmação"
          onConfirm={handleConfirmAction}
          onCancel={closeConfirmationModal}
          showCancel={true}
        >
          {confirmationModal.message}
        </Modal>
      )}

      {/* Sidebar */}
      <nav className={`main-nav ${isSidebarOpen ? 'open' : ''}`}>
        <div
          className="logo"
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: 'var(--cor-primaria-escura)',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          GestãoPRO
        </div>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            {item.icon && React.createElement(item.icon)} {item.label}
          </NavLink>
        ))}
        <div
          className="mobile-only"
          style={{ marginTop: 'auto', paddingTop: '1rem' }}
        >
          <button onClick={logout} className="nav-link">
            <IconeLogout /> Sair
          </button>
        </div>
      </nav>

      {/* Main Header */}
      <header className="main-header">
        <button
          className="hamburger-menu-button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <IconeFechar /> : <IconeMenu />}
        </button>
        <h1
          style={{
            fontSize: '1.5rem',
            margin: 0,
            color: 'var(--cor-primaria-escura)',
          }}
        >
          Bem-vindo(a), {user?.email || 'Usuário'}!
        </h1>
        <div className="user-info desktop-only">
          <span>
            {user?.email} ({userRole})
          </span>
          <button
            onClick={logout}
            className="button-secondary"
            style={{ marginLeft: '1rem' }}
          >
            <IconeLogout /> Sair
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
