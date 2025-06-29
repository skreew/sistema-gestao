import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import AccessSelectionPage from './components/auth/AccessSelectionPage';
import Modal from './components/ui/Modal';
import DashboardView from './features/dashboard/DashboardView';
import PedidosView from './features/pedidos/PedidosView';
import CadastrosView from './features/cadastros/CadastrosView';
import CmvView from './features/cmv/CmvView';
import HistoricoView from './features/historico/HistoricoView';
import RelatoriosView from './features/relatorios/RelatoriosView';
import { IconeLogout, IconeCarrinho, IconeCadastro, IconeCmv, IconeHistorico, IconeGrafico, IconeDashboard } from './utils/icons';
import './App.css';

const AppContent = () => {
    const { user, userRole, logout } = useAuth();
    const { modal, closeModal, confirmationModal, handleConfirmAction, closeConfirmationModal } = useUI();

    const [activeTab, setActiveTab] = useState('pedidos');
    useEffect(() => {
        if (userRole === 'gestor') {
            setActiveTab('dashboard');
        } else {
            setActiveTab('pedidos');
        }
    }, [userRole]);

    return (
        <div className="App">
            {modal.isOpen && <Modal title="Aviso" onConfirm={closeModal} confirmText="OK">{modal.message}</Modal>}
            {confirmationModal.isOpen && (
                <Modal title="Confirmação" onConfirm={handleConfirmAction} showCancel={true} onCancel={closeConfirmationModal} confirmText="Confirmar">
                    {confirmationModal.message}
                </Modal>
            )}

            <header className="main-header">
                <div className="user-info">Bem-vindo, {user.email} (<b>{userRole}</b>)</div>
                <button onClick={logout} className="button-primary">
                    <IconeLogout /> Sair
                </button>
            </header>

            <nav className="main-nav">
                {userRole === 'gestor' && <button className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><IconeDashboard /> Dashboard</button>}
                <button className={`nav-button ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}><IconeCarrinho /> Pedidos</button>
                <button className={`nav-button ${activeTab === 'cadastros' ? 'active' : ''}`} onClick={() => setActiveTab('cadastros')}><IconeCadastro /> Cadastros</button>
                {userRole === 'gestor' && <button className={`nav-button ${activeTab === 'cmv' ? 'active' : ''}`} onClick={() => setActiveTab('cmv')}><IconeCmv /> CMV & Produtos</button>}
                {userRole === 'gestor' && <button className={`nav-button ${activeTab === 'relatorios' ? 'active' : ''}`} onClick={() => setActiveTab('relatorios')}><IconeGrafico /> Relatórios</button>}
                 <button className={`nav-button ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')}><IconeHistorico /> Histórico</button>
            </nav>

            <main className="container">
                {activeTab === 'dashboard' && userRole === 'gestor' && <DashboardView />}
                {activeTab === 'pedidos' && <PedidosView />}
                {activeTab === 'cadastros' && <CadastrosView />}
                {activeTab === 'cmv' && userRole === 'gestor' && <CmvView />}
                {activeTab === 'historico' && <HistoricoView />}
                {activeTab === 'relatorios' && userRole === 'gestor' && <RelatoriosView />}
            </main>
        </div>
    );
};

function App() {
    const { user, loadingAuth } = useAuth();

    if (loadingAuth) {
        return <div className="loading-screen">Carregando...</div>;
    }

    return user ? <AppContent /> : <AccessSelectionPage />;
}

export default App;