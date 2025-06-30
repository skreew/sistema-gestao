import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';
import AccessSelectionPage from './components/auth/AccessSelectionPage';
import Modal from './components/ui/Modal';
import DashboardView from './features/dashboard/DashboardView';
import PedidosView from './features/pedidos/PedidosView';
import CatalogoView from './features/cadastros/CatalogoView';
import CmvView from './features/cmv/CmvView';
import RelatoriosView from './features/relatorios/RelatoriosView';
import OnboardingView from './features/onboarding/OnboardingView';
import FluxoCaixaView from './features/fluxoCaixa/FluxoCaixaView'; // NOVO
import { IconeLogout, IconeCarrinho, IconeFichaTecnica, IconeDashboard, IconeAnalises, IconeConfiguracoes, IconeDinheiro } from './utils/icons'; // NOVO
import './App.css';

const AppContent = () => {
    const { user, userRole, logout, userProfile } = useAuth();
    const { modal, closeModal, confirmationModal, handleConfirmAction, closeConfirmationModal } = useUI();
    const [activeTab, setActiveTab] = useState('pedidos');
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        if (userRole === 'gestor' && userProfile && userProfile.onboardingComplete === false) {
            setActiveTab('onboarding');
        } else if (userRole === 'gestor') {
            setActiveTab('dashboard');
        } else {
            setActiveTab('pedidos');
        }
    }, [userRole, userProfile]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setIsNavOpen(false); // Fecha o menu mobile ao selecionar uma opção
    };

    const isOnboardingNeeded = user && userRole === 'gestor' && userProfile && userProfile.onboardingComplete === false;

    // Função para renderizar o conteúdo da aba ativa
    const renderActiveView = () => {
        if (isOnboardingNeeded) return <OnboardingView />;
        switch (activeTab) {
            case 'dashboard': return userRole === 'gestor' ? <DashboardView /> : <PedidosView />;
            case 'pedidos': return <PedidosView />;
            case 'catalogo': return <CatalogoView />;
            case 'cmv': return userRole === 'gestor' ? <CmvView /> : null;
            case 'analises': return userRole === 'gestor' ? <RelatoriosView /> : null;
            case 'financeiro': return userRole === 'gestor' ? <FluxoCaixaView /> : null; // NOVO
            case 'onboarding': return <OnboardingView />;
            default: return <PedidosView />;
        }
    };

    return (
        <div className="App">
            {modal.isOpen && <Modal title={modal.title || "Aviso"} onConfirm={closeModal} confirmText="OK">{modal.message}</Modal>}
            {confirmationModal.isOpen && (
                <Modal title={confirmationModal.title || "Confirmação"} onConfirm={handleConfirmAction} showCancel={true} onCancel={closeConfirmationModal} confirmText="Confirmar">
                    {confirmationModal.message}
                </Modal>
            )}

            <header className="main-header">
                <div className="user-info">Bem-vindo, {user.email} (<b>{userRole}</b>)</div>
                <button className="hamburger-menu-button" onClick={() => setIsNavOpen(!isNavOpen)} aria-label="Abrir menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={logout} className="button-primary desktop-only" data-cy="btn-logout" aria-label="Sair"><IconeLogout /> Sair</button>
            </header>

            <nav className={`main-nav ${isNavOpen ? 'open' : ''}`}>
                {userRole === 'gestor' && <button data-cy="nav-dashboard" className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')}><IconeDashboard /> Dashboard</button>}
                <button data-cy="nav-pedidos" className={`nav-button ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => handleTabClick('pedidos')}><IconeCarrinho /> Pedidos</button>

                {/* Botão Catálogo visível para ambos os perfis */}
                <button data-cy="nav-catalogo" className={`nav-button ${activeTab === 'catalogo' ? 'active' : ''}`} onClick={() => handleTabClick('catalogo')}><IconeConfiguracoes /> Catálogo</button>

                {userRole === 'gestor' && (
                    <>
                        <button data-cy="nav-fichas-tecnicas" className={`nav-button ${activeTab === 'cmv' ? 'active' : ''}`} onClick={() => handleTabClick('cmv')}><IconeFichaTecnica /> Fichas Técnicas</button>
                        <button data-cy="nav-financeiro" className={`nav-button ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => handleTabClick('financeiro')}><IconeDinheiro /> Financeiro</button>
                        <button data-cy="nav-analises" className={`nav-button ${activeTab === 'analises' ? 'active' : ''}`} onClick={() => handleTabClick('analises')}><IconeAnalises /> Análises</button>
                    </>
                )}

                <button onClick={logout} className="button-primary mobile-only" data-cy="btn-logout-mobile" aria-label="Sair"><IconeLogout /> Sair</button>
            </nav>

            <main className="container">
                {renderActiveView()}
            </main>
        </div>
    );
};

function App() {
    const { user, loadingAuth } = useAuth();
    if (loadingAuth) return <div className="loading-screen">Carregando...</div>;
    return user ? <AppContent /> : <AccessSelectionPage />;
}

export default App;