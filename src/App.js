import React, { useState, useEffect } from 'react';
import { useAuth } from './context/Auth';
import { useUI } from './context/UIContext';
import { useData } from './context/DataContext'; // Importa o DataContext
import AccessSelectionPage from './components/auth/AccessSelectionPage';
import Modal from './components/ui/Modal';
import DashboardView from './features/dashboard/DashboardView';
import PedidosView from './features/pedidos/PedidosView';
import CatalogoView from './features/cadastros/CatalogoView';
import CmvView from './features/cmv/CmvView';
import EstoqueView from './features/estoque/EstoqueView';
import PdvView from './features/pdv/PdvView';
import RelatoriosView from './features/relatorios/RelatoriosView';
import OnboardingView from './features/onboarding/OnboardingView';
import FluxoDeCaixaView from './features/fluxoDeCaixa/FluxoDeCaixaView';
import { IconeLogout, IconeCarrinho, IconeFichaTecnica, IconeDashboard, IconeAnalises, IconeConfiguracoes, IconeDinheiro, IconeEstoque, IconePdv, IconeMenu, IconeFechar, IconeCaminhao } from './utils/icons';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { db } from './firebase'; // Importa o db para seed
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore'; // Importa funções Firestore para seed

// Função para popular o Firestore com dados de exemplo (APENAS PARA DESENVOLVIMENTO)
// Descomente e chame `seedData()` em `AppLoader` se precisar popular o banco de dados.
async function seedData() {
    console.log("Verificando e populando dados de exemplo...");
    const fornecedoresCol = collection(db, "fornecedores");
    const produtosDeCompraCol = collection(db, "produtosDeCompra");
    const produtosFinaisCol = collection(db, "produtosFinais");

    const fornecedoresSnap = await getDocs(fornecedoresCol);
    if (fornecedoresSnap.empty) {
        console.log("Populando fornecedores...");
        const f1Ref = await addDoc(fornecedoresCol, { nome: "Distribuidora de Massas S/A", whatsapp: "5511987654321", observacoes: "Entrega às terças e quintas" });
        const f2Ref = await addDoc(fornecedoresCol, { nome: "Açougue Central", whatsapp: "5511998765432", observacoes: "Melhor carne da região" });
        const f3Ref = await addDoc(fornecedoresCol, { nome: "Bebidas & Cia", whatsapp: "5521912345678", observacoes: "Entrega rápida" });
        const f4Ref = await addDoc(fornecedoresCol, { nome: "Doces Delícias", whatsapp: "5531923456789", observacoes: "Especialista em sobremesas" });

        const p1Ref = await addDoc(produtosDeCompraCol, { nome: "Farinha de Trigo Tipo 1", unidadeAnalise: "kg" });
        await addDoc(collection(db, "produtosDeCompra", p1Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f1Ref.id, dataCompra: new Date("2024-05-01"), quantidadeComprada: 50, precoTotalNota: 100, precoPorUnidadeAnalise: 2 });
        await addDoc(collection(db, "produtosDeCompra", p1Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f1Ref.id, dataCompra: new Date("2024-06-01"), quantidadeComprada: 50, precoTotalNota: 95, precoPorUnidadeAnalise: 1.9 });
        await addDoc(collection(db, "produtosDeCompra", p1Ref.id, "historicoPrecos"), { tipo: "oferta", fornecedorId: f2Ref.id, dataOferta: new Date("2024-06-15"), precoPorUnidadeAnalise: 1.85 });


        const p2Ref = await addDoc(produtosDeCompraCol, { nome: "Queijo Mozzarella", unidadeAnalise: "kg" });
        await addDoc(collection(db, "produtosDeCompra", p2Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f1Ref.id, dataCompra: new Date("2024-05-10"), quantidadeComprada: 20, precoTotalNota: 250, precoPorUnidadeAnalise: 12.5 });
        await addDoc(collection(db, "produtosDeCompra", p2Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f1Ref.id, dataCompra: new Date("2024-06-10"), quantidadeComprada: 20, precoTotalNota: 240, precoPorUnidadeAnalise: 12 });

        const p3Ref = await addDoc(produtosDeCompraCol, { nome: "Carne Bovina (Picanha)", unidadeAnalise: "kg" });
        await addDoc(collection(db, "produtosDeCompra", p3Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f2Ref.id, dataCompra: new Date("2024-06-15"), quantidadeComprada: 10, precoTotalNota: 500, precoPorUnidadeAnalise: 50 });

        const p4Ref = await addDoc(produtosDeCompraCol, { nome: "Cerveja Lager", unidadeAnalise: "L" });
        await addDoc(collection(db, "produtosDeCompra", p4Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f3Ref.id, dataCompra: new Date("2024-06-20"), quantidadeComprada: 50, precoTotalNota: 300, precoPorUnidadeAnalise: 6 });

        const p5Ref = await addDoc(produtosDeCompraCol, { nome: "Açúcar Refinado", unidadeAnalise: "kg" });
        await addDoc(collection(db, "produtosDeCompra", p5Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f4Ref.id, dataCompra: new Date("2024-06-25"), quantidadeComprada: 25, precoTotalNota: 75, precoPorUnidadeAnalise: 3 });

        const p6Ref = await addDoc(produtosDeCompraCol, { nome: "Leite Condensado", unidadeAnalise: "L" });
        await addDoc(collection(db, "produtosDeCompra", p6Ref.id, "historicoPrecos"), { tipo: "compra", fornecedorId: f4Ref.id, dataCompra: new Date("2024-06-25"), quantidadeComprada: 10, precoTotalNota: 80, precoPorUnidadeAnalise: 8 });

        console.log("Populando produtos finais...");
        await addDoc(produtosFinaisCol, {
            nome: "Pizza Calabresa",
            categoria: "Pizzas Salgadas",
            variantes: [
                {
                    nomeVariante: "Média",
                    custoEmbalagem: 2.00,
                    custoOperacional: 5.00,
                    fichaTecnica: [
                        { itemDeCompraId: p1Ref.id, nome: "Farinha de Trigo Tipo 1", quantidade: 300, unidade: "g", custo: 300/1000 * 1.9 }, // 300g de farinha
                        { itemDeCompraId: p2Ref.id, nome: "Queijo Mozzarella", quantidade: 200, unidade: "g", custo: 200/1000 * 12 }, // 200g de queijo
                    ],
                    cmvCalculado: (300/1000 * 1.9) + (200/1000 * 12) + 2.00 + 5.00
                },
                {
                    nomeVariante: "Grande",
                    custoEmbalagem: 2.50,
                    custoOperacional: 6.00,
                    fichaTecnica: [
                        { itemDeCompraId: p1Ref.id, nome: "Farinha de Trigo Tipo 1", quantidade: 400, unidade: "g", custo: 400/1000 * 1.9 },
                        { itemDeCompraId: p2Ref.id, nome: "Queijo Mozzarella", quantidade: 300, unidade: "g", custo: 300/1000 * 12 },
                    ],
                    cmvCalculado: (400/1000 * 1.9) + (300/1000 * 12) + 2.50 + 6.00
                }
            ]
        });

        await addDoc(produtosFinaisCol, {
            nome: "Espetinho de Carne",
            categoria: "Churrasco",
            variantes: [
                {
                    nomeVariante: "Padrão",
                    custoEmbalagem: 0.50,
                    custoOperacional: 1.50,
                    fichaTecnica: [
                        { itemDeCompraId: p3Ref.id, nome: "Carne Bovina (Picanha)", quantidade: 150, unidade: "g", custo: 150/1000 * 50 },
                    ],
                    cmvCalculado: (150/1000 * 50) + 0.50 + 1.50
                }
            ]
        });

        await addDoc(produtosFinaisCol, {
            nome: "Brigadeiro Gourmet",
            categoria: "Sobremesas",
            variantes: [
                {
                    nomeVariante: "Unidade",
                    custoEmbalagem: 0.10,
                    custoOperacional: 0.50,
                    fichaTecnica: [
                        { itemDeCompraId: p5Ref.id, nome: "Açúcar Refinado", quantidade: 20, unidade: "g", custo: 20/1000 * 3 },
                        { itemDeCompraId: p6Ref.id, nome: "Leite Condensado", quantidade: 50, unidade: "ml", custo: 50/1000 * 8 },
                    ],
                    cmvCalculado: (20/1000 * 3) + (50/1000 * 8) + 0.10 + 0.50
                }
            ]
        });

        await addDoc(produtosFinaisCol, {
            nome: "Refrigerante Cola",
            categoria: "Bebidas",
            variantes: [
                {
                    nomeVariante: "Lata 350ml",
                    custoEmbalagem: 0,
                    custoOperacional: 0.20,
                    fichaTecnica: [
                        { itemDeCompraId: p4Ref.id, nome: "Cerveja Lager", quantidade: 0.35, unidade: "L", custo: 0.35 * 6 }, // Usando cerveja como ref para bebida
                    ],
                    cmvCalculado: (0.35 * 6) + 0 + 0.20
                }
            ]
        });

        console.log("Dados de exemplo populados com sucesso!");
    } else {
        console.log("Dados de exemplo já existem. Pulando a população.");
    }
}


const AppContent = () => {
    const { user, userRole, logout, userProfile } = useAuth();
    const { modal, closeModal, confirmationModal, handleConfirmAction, closeConfirmationModal } = useUI();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        // Define a aba inicial com base no papel do usuário e status de onboarding
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
        setIsNavOpen(false); // Fecha o menu mobile ao clicar em um item
    };

    // Determina se o onboarding é necessário (apenas para gestores)
    const isOnboardingNeeded = user && userRole === 'gestor' && userProfile && userProfile.onboardingComplete === false;

    // Renderiza a view ativa com base na aba selecionada e no papel do usuário
    const renderActiveView = () => {
        if (isOnboardingNeeded) return <OnboardingView />;
        switch (activeTab) {
            case 'dashboard': return userRole === 'gestor' ? <DashboardView /> : <PedidosView />;
            case 'pedidos': return <PedidosView />;
            case 'catalogo': return <CatalogoView />;
            case 'cmv': return userRole === 'gestor' ? <CmvView /> : null;
            case 'estoque': return userRole === 'gestor' ? <EstoqueView /> : null;
            case 'pdv': return userRole === 'gestor' ? <PdvView /> : null;
            case 'fluxoDeCaixa': return userRole === 'gestor' ? <FluxoDeCaixaView /> : null;
            case 'analises': return userRole === 'gestor' ? <RelatoriosView /> : null;
            case 'onboarding': return <OnboardingView />; // Permite navegar de volta ao onboarding se necessário
            default: return <PedidosView />; // Fallback
        }
    };

    // Itens de navegação dinâmicos baseados no papel
    const navItems = [
        { name: 'dashboard', label: 'Dashboard', icon: IconeDashboard, role: 'gestor' },
        { name: 'pedidos', label: 'Pedidos', icon: IconeCarrinho, role: 'any' },
        { name: 'catalogo', label: 'Catálogo', icon: IconeConfiguracoes, role: 'any' }, // Ícone de engrenagem para catálogo/configurações
        { name: 'cmv', label: 'Fichas Técnicas', icon: IconeFichaTecnica, role: 'gestor' },
        { name: 'estoque', label: 'Estoque', icon: IconeEstoque, role: 'gestor' },
        { name: 'pdv', label: 'PDV', icon: IconePdv, role: 'gestor' },
        { name: 'fluxoDeCaixa', label: 'Fluxo de Caixa', icon: IconeDinheiro, role: 'gestor' },
        { name: 'analises', label: 'Análises', icon: IconeAnalises, role: 'gestor' },
    ];

    return (
        <div className="App">
            {/* Componente para exibir toasts (mensagens rápidas) */}
            <Toaster position="top-right" />

            {/* Modal de alerta genérico */}
            {modal.isOpen && <Modal title="Aviso" onConfirm={closeModal} confirmText="OK">{modal.message}</Modal>}

            {/* Modal de confirmação para ações críticas */}
            {confirmationModal.isOpen && (
                <Modal title="Confirmação" onConfirm={handleConfirmAction} showCancel={true} onCancel={closeConfirmationModal} confirmText="Confirmar">
                    {confirmationModal.message}
                </Modal>
            )}

            {/* Cabeçalho principal */}
            <header className="main-header">
                <button className="hamburger-menu-button" onClick={() => setIsNavOpen(!isNavOpen)} aria-label="Abrir menu">
                    <IconeMenu />
                </button>
                <div className="user-info">Bem-vindo, {user.email} (<b>{userRole}</b>)</div>
                <button onClick={logout} className="button-primary desktop-only" data-cy="btn-logout" aria-label="Sair"><IconeLogout /> Sair</button>
            </header>

            {/* Navegação Lateral (Sidebar) */}
            <nav className={`main-nav ${isNavOpen ? 'open' : ''}`}>
                <div className="flex-shrink-0 flex items-center px-4 py-4">
                    <IconeCaminhao className="h-8 w-8 text-cor-primaria" />
                    <span className="ml-2 font-semibold text-xl text-gray-800">GestãoPRO</span>
                </div>
                {navItems.map(item => (item.role === 'any' || item.role === userRole) && (
                    <button
                        key={item.name}
                        data-cy={`nav-${item.name}`}
                        className={`nav-button ${activeTab === item.name ? 'active' : ''}`}
                        onClick={() => handleTabClick(item.name)}
                        disabled={isOnboardingNeeded && item.name !== 'onboarding'} // Desabilita outras abas durante o onboarding
                    >
                        <item.icon /> {item.label}
                    </button>
                ))}
                <button onClick={logout} className="button-primary mobile-only" data-cy="btn-logout-mobile" aria-label="Sair"><IconeLogout /> Sair</button>
            </nav>

            {/* Conteúdo Principal */}
            <main className="container">
                {renderActiveView()}
            </main>
        </div>
    );
};

// Componente App (Root)
function App() {
    return <AppLoader />;
}

// Gerencia o estado de carregamento e autenticação inicial
const AppLoader = () => {
    const { user, loadingAuth } = useAuth();
    // const { loadingData } = useData(); // Pode ser usado para um loader mais granular

    useEffect(() => {
        // Descomente a linha abaixo para popular o banco de dados com dados de exemplo
        // seedData();
    }, []);

    if (loadingAuth) { // || loadingData) { // Adicione loadingData se quiser esperar todos os dados carregarem
        return (
            <div className="loading-screen">
                <IconeCaminhao />
                <p>A carregar...</p>
            </div>
        );
    }

    return user ? <AppContent /> : <AccessSelectionPage />;
}

export default App;