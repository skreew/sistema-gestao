import os
import textwrap

# --- Conteúdo Consolidado e CORRIGIDO dos Arquivos da Aplicação ---
# Este script contém as correções para os problemas de teste do Cypress.
# 1. Ajustado o fluxo de registro para manter o usuário logado após o cadastro.
# 2. Atualizado o teste de registro para validar o login automático.
# 3. Corrigido o método de validação do cy.session() para ser compatível com Firebase v9+.

PACKAGE_JSON_CONTENT = textwrap.dedent("""
    {
      "name": "sistema-pedidos-100",
      "version": "1.0.0",
      "private": true,
      "dependencies": {
        "chart.js": "^3.9.1",
        "firebase": "^9.10.0",
        "jspdf": "^2.5.1",
        "jspdf-autotable": "^3.5.25",
        "react": "^18.2.0",
        "react-chartjs-2": "^4.3.1",
        "react-csv": "^2.2.2",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1"
      },
      "devDependencies": {
        "cypress": "^10.11.0"
      },
      "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "cypress:open": "cypress open"
      },
      "eslintConfig": { "extends": ["react-app", "react-app/jest"] },
      "browserslist": {
        "production": [">0.2%", "not dead", "not op_mini all"],
        "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
      }
    }
""")

GITIGNORE_CONTENT = textwrap.dedent("""
    # Dependencies
    /node_modules
    /.pnp
    .pnp.js

    # Production
    /build

    # Misc
    .DS_Store
    .env.local
    .env.development.local
    .env.test.local
    .env.production.local
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*

    # Cypress
    cypress.env.json
    cypress/videos/
    cypress/screenshots/
""")

README_MD_CONTENT = textwrap.dedent("""
    # Sistema de Pedidos e Gestão v1.0

    Aplicação React completa para gestão de pedidos, fornecedores, catálogo, e cálculo de Custo de Mercadoria Vendida (CMV).

    ## Como Iniciar

    1.  **Instale as Dependências:**
        ```bash
        npm install
        ```

    2.  **Configure o Firebase:**
        Abra o arquivo `src/firebase.js` e preencha com as suas credenciais do Firebase.

    3.  **Inicie o Servidor de Desenvolvimento:**
        ```bash
        npm start
        ```
    A aplicação estará disponível em `http://localhost:3000`.
    
    ## Como Executar os Testes Automatizados

    1.  Certifique-se de que a aplicação esteja rodando (`npm start`).
    2.  Em um novo terminal, execute o comando para abrir a interface do Cypress:
        ```bash
        npm run cypress:open
        ```
    3.  Na janela do Cypress, escolha "E2E Testing" e execute o teste `sistema_completo.cy.js`.
""")

CYPRESS_CONFIG_JS_CONTENT = textwrap.dedent("""
    const { defineConfig } = require("cypress");

    module.exports = defineConfig({
      e2e: {
        baseUrl: 'http://localhost:3000',
        experimentalSessionAndOrigin: true,
        setupNodeEvents(on, config) {
          // implement node event listeners here
        },
      },
    });
""")

# CORREÇÕES DE TESTE APLICADAS
CYPRESS_TEST_FILE_CONTENT = textwrap.dedent("""
    // cypress/e2e/sistema_completo.cy.js

    describe('Fluxo de Autenticação de Colaborador', () => {
      it('deve permitir que um novo colaborador se registre e seja logado automaticamente', () => {
        cy.intercept('POST', '**/identitytoolkit.googleapis.com/**').as('firebaseAuth');
        cy.intercept('POST', '**/firestore.googleapis.com/**').as('firebaseFirestore');

        const emailColaborador = `colaborador_${Date.now()}@teste.com`;
        cy.visit('/');

        cy.contains('h1', 'Sistema de Pedidos', { timeout: 10000 }).should('be.visible');

        // --- Registro ---
        cy.get('[data-cy=btn-show-register]').click();
        cy.get('[data-cy=input-email-registro]').type(emailColaborador);
        cy.get('[data-cy=input-senha-registro]').type('senha123');
        cy.get('[data-cy=btn-register-submit]').click();

        // Espera a confirmação do Firebase e a mensagem de sucesso
        cy.wait('@firebaseAuth');
        cy.contains('Cadastro realizado com sucesso!', { timeout: 10000 }).should('be.visible');
        cy.get('[data-cy=modal-confirm-button]').click();

        // --- Verificação Final ---
        // O usuário deve ser redirecionado para a página principal, já logado.
        cy.contains('.user-info', `Bem-vindo, ${emailColaborador}`, { timeout: 10000 }).should('be.visible');
        cy.get('[data-cy=nav-dashboard]').should('not.exist');
        cy.get('[data-cy=nav-pedidos]').should('be.visible');
      });
    });

    describe('Fluxos do Gestor', () => {
      beforeEach(() => {
        cy.intercept('POST', '**/firestore.googleapis.com/**').as('firebaseFirestore');

        cy.session('gestorLogado', () => {
          cy.visit('/');
          cy.contains('h1', 'Sistema de Pedidos').should('be.visible');
          cy.get('[data-cy=btn-show-login]').click();
          cy.get('[data-cy=input-email-login]').type('admin@gmail.com');
          cy.get('[data-cy=input-senha-login]').type('admin123');
          cy.get('[data-cy=btn-login-submit]').click();
          cy.contains('.user-info', 'Bem-vindo, admin@gmail.com', { timeout: 10000 }).should('be.visible');
        }, {
          validate() {
            // Valida a sessão verificando um elemento que só existe quando logado.
            cy.get('[data-cy="btn-logout"]').should('be.visible');
          },
        });
        
        cy.visit('/');
        cy.contains('.user-info', 'Bem-vindo, admin@gmail.com', { timeout: 10000 }).should('be.visible');
      });

      it('deve cadastrar um novo fornecedor e verificar todos os dados', () => {
        const fornecedor = {
          nome: `Fornecedor Robusto ${Date.now()}`,
          whatsapp: '11987654321',
          obs: 'Teste completo de ponta a ponta'
        };

        cy.get('[data-cy=nav-cadastros]').click();
        
        cy.get('[data-cy=card-gerenciar-fornecedores]').within(() => {
          cy.get('[data-cy=input-fornecedor-nome]').type(fornecedor.nome);
          cy.get('[data-cy=input-fornecedor-whatsapp]').type(fornecedor.whatsapp);
          cy.get('[data-cy=input-fornecedor-obs]').type(fornecedor.obs);
          cy.get('[data-cy=btn-adicionar-fornecedor]').click();
        });
        
        cy.wait('@firebaseFirestore');

        cy.contains('Fornecedor salvo!').should('be.visible');
        cy.get('[data-cy=modal-confirm-button]').click();
        
        const whatsAppFormatado = `(${fornecedor.whatsapp.substring(0, 2)}) ${fornecedor.whatsapp.substring(2, 7)}-${fornecedor.whatsapp.substring(7)}`;
        
        cy.get('[data-cy=card-gerenciar-fornecedores] .list-container')
          .contains(fornecedor.nome)
          .parents('.list-item')
          .within(() => {
            cy.contains(whatsAppFormatado).should('be.visible');
            cy.contains(fornecedor.obs).should('be.visible');
          });
      });
    });
""")

INDEX_HTML_CONTENT = textwrap.dedent("""
    <!DOCTYPE html><html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sistema de Gestão</title>
      </head>
      <body>
        <noscript>Você precisa habilitar o JavaScript para rodar este app.</noscript>
        <div id="root"></div>
      </body></html>
""")

INDEX_CSS_CONTENT = textwrap.dedent("""
    :root {
      --cor-primaria: #0033a0;      /* Azul Ipiranga */
      --cor-secundaria: #ffde00;    /* Amarelo Ipiranga */
      --cor-sucesso: #009e4d;       /* Verde Ipiranga */
      --cor-perigo: #d93025;        /* Vermelho para alertas */
      --cor-fundo: #f8f9fa;         /* Cinza muito claro */
      --cor-texto: #212529;         /* Texto escuro */
      --cor-borda: #dee2e6;
      --sombra-card: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: var(--cor-fundo);
      color: var(--cor-texto);
      line-height: 1.6;
    }
    * { box-sizing: border-box; }
""")

APP_CSS_CONTENT = textwrap.dedent("""
    /* --- Layout Principal --- */
    .App { display: flex; flex-direction: column; min-height: 100vh; }
    .main-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background-color: white; border-bottom: 1px solid var(--cor-borda); box-shadow: var(--sombra-card); position: sticky; top: 0; z-index: 100; }
    .main-nav { display: flex; justify-content: center; padding: 0.5rem; background-color: #002b85; gap: 0.5rem; flex-wrap: wrap; }
    .container { padding: 2rem; width: 100%; max-width: 1600px; margin: 0 auto; }
    .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.5rem; font-weight: bold; color: var(--cor-primaria); }

    /* --- Componentes de UI --- */
    .card { background-color: white; border-radius: 8px; padding: 1.5rem 2rem; box-shadow: var(--sombra-card); margin-bottom: 2rem; }
    .card h2, .card h3 { margin-top: 0; display: flex; align-items: center; gap: 0.75rem; color: #333; }
    .card h3 { font-size: 1.25rem; }
    .card h4 { margin-top: 0; margin-bottom: 1rem; color: #555; }
    .divider { border-top: 1px solid var(--cor-borda); margin: 2rem 0; }
    .divider-soft { border-top: 1px solid #f0f0f0; margin: 1rem 0; }
    .icon { width: 1.5em; height: 1.5em; stroke-width: 1.5; display: inline-block; vertical-align: middle; }
    .icon.small { width: 1.2em; height: 1.2em; }

    /* --- Botões --- */
    button { cursor: pointer; border: 1px solid transparent; border-radius: 4px; padding: 0.6rem 1.2rem; font-size: 0.95rem; font-weight: 500; transition: all 0.2s ease-in-out; line-height: 1.5; }
    .button-primary { background-color: var(--cor-primaria); color: white; }
    .button-primary:hover { background-color: #002b85; }
    .button-secondary { background-color: #6c757d; color: white; }
    .button-secondary:hover { background-color: #5a6268; }
    .button-link { background: none; color: var(--cor-primaria); text-decoration: underline; padding: 0.5rem; border: none; }
    .button-icon { background: none; padding: 0.5rem; border: none; opacity: 0.7; }
    .button-icon:hover { opacity: 1; }

    /* --- Navegação --- */
    .nav-button { background-color: transparent; color: rgba(255, 255, 255, 0.8); padding: 0.6rem 1.2rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem; border: none; }
    .nav-button:hover { background-color: rgba(255, 255, 255, 0.1); color: white; }
    .nav-button.active { background-color: var(--cor-secundaria); color: var(--cor-primaria); font-weight: bold;}

    /* --- Formulários --- */
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--cor-borda); border-radius: 4px; font-size: 1rem; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--cor-primaria); box-shadow: 0 0 0 2px rgba(0, 51, 160, 0.25); }
    .form-group-inline { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
    .form-group-inline .form-group { flex: 1; min-width: 150px; }
    .input-with-icon { position: relative; }
    .input-with-icon .icon { position: absolute; top: 50%; left: 12px; transform: translateY(-50%); color: #6c757d; }
    .input-with-icon input { padding-left: 40px; }

    /* --- Listas --- */
    .list-container { max-height: 450px; overflow-y: auto; padding-right: 1rem; border-top: 1px solid var(--cor-borda); margin-top: 1rem; padding-top: 1rem; }
    .list-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #f0f0f0; }
    .list-item:last-child { border-bottom: none; }
    .list-item-info strong { font-size: 1.05rem; }
    .sub-text { font-size: 0.85rem; color: #6c757d; margin-top: 0.25rem; }

    /* --- Modal --- */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; width: 95%; max-width: 600px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
    .modal-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
    .modal-body { margin-top: 1.5rem; }

    /* --- Páginas de Login --- */
    .login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .login-card { width: 100%; max-width: 400px; text-align: center; }

    /* --- Específicos --- */
    .variantes-manager { border: 1px solid var(--cor-borda); border-radius: 6px; padding: 1rem; margin-top: 1.5rem; }
    .variantes-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--cor-borda); padding-bottom: 1rem; margin-bottom: 1rem; }
    .variantes-tabs button { background-color: #f8f9fa; border: 1px solid var(--cor-borda); }
    .variantes-tabs button.active { background-color: var(--cor-primaria); color: white; border-color: var(--cor-primaria); }

    /* --- Layouts Responsivos --- */
    .grid-responsive { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 2rem; }
    @media (max-width: 992px) { .grid-responsive { grid-template-columns: 1fr; } }
    @media (max-width: 768px) {
        .main-header { flex-direction: column; gap: 0.75rem; padding: 1rem; }
        .nav-button { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
        .container { padding: 1rem; }
        .card { padding: 1.25rem; }
        .card h2 { font-size: 1.25rem; }
        .form-group-inline { flex-direction: column; align-items: stretch; gap: 1rem; }
    }
""")

FIREBASE_JS_CONTENT = textwrap.dedent("""
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";
    import { getAnalytics } from "firebase/analytics";

    const firebaseConfig = {
      // ATENÇÃO: Substitua pelas suas credenciais do Firebase
      apiKey: "AIzaSyDrROaFFo6xjrkn4FhKWdY1c4Z0Jyy6SNw",
      authDomain: "sistema-gestao-1a0cd.firebaseapp.com",
      projectId: "sistema-gestao-1a0cd",
      storageBucket: "sistema-gestao-1a0cd.appspot.com",
      messagingSenderId: "715681926217",
      appId: "1:715681926217:web:7b4ed090a6c2aa2afec398",
      measurementId: "G-Z2KJC3GMNE"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const analytics = getAnalytics(app);

    export { db, auth, analytics };
""")

APP_JS_CONTENT = textwrap.dedent("""
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
            if (userRole === 'gestor') setActiveTab('dashboard');
            else setActiveTab('pedidos');
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
                    <button onClick={logout} className="button-primary" data-cy="btn-logout">
                        <IconeLogout /> Sair
                    </button>
                </header>
                <nav className="main-nav">
                    {userRole === 'gestor' && <button data-cy="nav-dashboard" className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><IconeDashboard /> Dashboard</button>}
                    <button data-cy="nav-pedidos" className={`nav-button ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}><IconeCarrinho /> Pedidos</button>
                    <button data-cy="nav-cadastros" className={`nav-button ${activeTab === 'cadastros' ? 'active' : ''}`} onClick={() => setActiveTab('cadastros')}><IconeCadastro /> Cadastros</button>
                    {userRole === 'gestor' && <button data-cy="nav-cmv" className={`nav-button ${activeTab === 'cmv' ? 'active' : ''}`} onClick={() => setActiveTab('cmv')}><IconeCmv /> CMV & Produtos</button>}
                    {userRole === 'gestor' && <button data-cy="nav-relatorios" className={`nav-button ${activeTab === 'relatorios' ? 'active' : ''}`} onClick={() => setActiveTab('relatorios')}><IconeGrafico /> Relatórios</button>}
                    <button data-cy="nav-historico" className={`nav-button ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')}><IconeHistorico /> Histórico</button>
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
        if (loadingAuth) return <div className="loading-screen">Carregando...</div>;
        return user ? <AppContent /> : <AccessSelectionPage />;
    }

    export default App;
""")

INDEX_JS_CONTENT = textwrap.dedent("""
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import './index.css';
    import App from './App';
    import { AuthProvider } from './context/AuthContext';
    import { UIProvider } from './context/UIContext';
    import { DataProvider } from './context/DataContext';

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <UIProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </UIProvider>
        </AuthProvider>
      </React.StrictMode>
    );
""")

# CORREÇÃO DE FLUXO DE TESTE
ACCESS_SELECTION_PAGE_JS_CONTENT = textwrap.dedent("""
    import React, { useState } from 'react';
    import { useAuth } from '../../context/AuthContext';
    import { useUI } from '../../context/UIContext';
    import { IconeCaminhao } from '../../utils/icons';

    const AccessSelectionPage = () => {
        const [view, setView] = useState('selection');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const { loginUser, registerUser } = useAuth();
        const { showModal } = useUI();

        const handleLogin = async (e) => {
            e.preventDefault();
            try {
                await loginUser(email, password);
            } catch (error) {
                showModal("E-mail ou senha inválidos. Tente novamente.");
            }
        };

        const handleRegister = async (e) => {
            e.preventDefault();
            try {
                await registerUser(email, password, 'colaborador');
                // O usuário será logado automaticamente pelo onAuthStateChanged
                showModal("Cadastro realizado com sucesso!");
            } catch (error) {
                showModal(`Erro no cadastro: ${error.message}`);
            }
        };

        const renderContent = () => {
            switch (view) {
                case 'login':
                    return (
                        <form onSubmit={handleLogin}>
                            <h3>Acessar o Sistema</h3>
                            <div className="form-group">
                                <input data-cy="input-email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
                            </div>
                            <div className="form-group">
                                <input data-cy="input-senha-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
                            </div>
                            <button data-cy="btn-login-submit" type="submit" className="button-primary" style={{width: '100%'}}>Entrar</button>
                            <button type="button" onClick={() => setView('selection')} className="button-link">Voltar</button>
                        </form>
                    );
                case 'register':
                    return (
                        <form onSubmit={handleRegister}>
                            <h3>Registrar Novo Usuário</h3>
                            <div className="form-group">
                                <input data-cy="input-email-registro" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
                            </div>
                            <div className="form-group">
                                <input data-cy="input-senha-registro" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mínimo 6 caracteres)" required />
                            </div>
                            <button data-cy="btn-register-submit" type="submit" className="button-primary" style={{width: '100%'}}>Registrar</button>
                            <button type="button" onClick={() => setView('selection')} className="button-link">Voltar</button>
                        </form>
                    );
                default:
                    return (
                        <>
                            <p className="login-subtitle">Bem-vindo!</p>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                <button data-cy="btn-show-login" onClick={() => setView('login')} className="button-primary large">Entrar</button>
                                <button data-cy="btn-show-register" onClick={() => setView('register')} className="button-secondary large">Registrar Novo Colaborador</button>
                            </div>
                        </>
                    );
            }
        };

        return (
            <div className="login-container">
                <div className="login-card card">
                    <h1 className="login-title"><IconeCaminhao /> Sistema de Pedidos</h1>
                    {renderContent()}
                </div>
            </div>
        );
    };
    
    export default AccessSelectionPage;
""")

GERENCIAR_FORNECEDORES_JS_CONTENT = textwrap.dedent("""
    import React, { useState, useMemo } from 'react';
    import { useUI } from '../../context/UIContext';
    import { useData } from '../../context/DataContext';
    import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
    import { IconeCaminhao, IconeBusca, IconeEditar, IconeLixeira } from '../../utils/icons';
    import { formatarWhatsappParaLink, formatarWhatsappParaExibicao } from '../../utils/formatters';

    const GerenciarFornecedores = () => {
        const { showModal, showConfirmationModal } = useUI();
        const { fornecedores } = useData();
        const [editingFornecedor, setEditingFornecedor] = useState(null);
        const [nome, setNome] = useState('');
        const [whatsapp, setWhatsapp] = useState('');
        const [observacoes, setObservacoes] = useState('');
        const [busca, setBusca] = useState('');

        const fornecedoresFiltrados = useMemo(() =>
            fornecedores.filter(f => f.nome.toLowerCase().includes(busca.toLowerCase())),
            [fornecedores, busca]
        );

        const handleSalvar = async (e) => {
            e.preventDefault();
            const numeroFormatado = formatarWhatsappParaLink(whatsapp);
            if (!nome || !numeroFormatado) {
                showModal('Preencha o nome e um WhatsApp válido.');
                return;
            }
            const data = { nome, whatsapp: numeroFormatado, observacoes: observacoes || null };
            try {
                if (editingFornecedor) {
                    await updateDocument("fornecedores", editingFornecedor.id, data);
                    showModal('Fornecedor atualizado!');
                } else {
                    await addDocument("fornecedores", data);
                    showModal('Fornecedor salvo!');
                }
                resetForm();
            } catch (error) {
                showModal('Erro ao salvar: ' + error.message);
            }
        };

        const handleEditar = (fornecedor) => {
            setEditingFornecedor(fornecedor); setNome(fornecedor.nome);
            setWhatsapp(fornecedor.whatsapp); setObservacoes(fornecedor.observacoes || '');
        };

        const handleDelete = (id) => {
            showConfirmationModal("Excluir este fornecedor?", async () => {
                try {
                    await deleteDocument("fornecedores", id);
                    showModal("Fornecedor excluído.");
                } catch (error) {
                    showModal("Erro ao excluir: " + error.message);
                }
            });
        };

        const resetForm = () => {
            setEditingFornecedor(null); setNome('');
            setWhatsapp(''); setObservacoes('');
        };

        return (
            <div className="card" data-cy="card-gerenciar-fornecedores">
                <h2><IconeCaminhao /> Gerenciar Fornecedores</h2>
                <form onSubmit={handleSalvar}>
                    <div className="form-group">
                        <label>Nome</label>
                        <input data-cy="input-fornecedor-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da empresa" required />
                    </div>
                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input data-cy="input-fornecedor-whatsapp" type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" required />
                    </div>
                    <div className="form-group">
                        <label>Observações</label>
                        <input data-cy="input-fornecedor-obs" type="text" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Ex: Entregas às terças" />
                    </div>
                    <button data-cy="btn-adicionar-fornecedor" type="submit" className="button-primary">{editingFornecedor ? 'Atualizar Fornecedor' : 'Adicionar Fornecedor'}</button>
                    {editingFornecedor && <button type="button" onClick={resetForm} className="button-link">Cancelar Edição</button>}
                </form>
                <div className="divider" />
                <div className="form-group">
                    <label>Buscar Fornecedor</label>
                    <div className="input-with-icon">
                      <span className="icon"><IconeBusca /></span>
                      <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Digite para buscar..." />
                    </div>
                </div>
                <div className="list-container">
                    {fornecedoresFiltrados.map(f => (
                        <div key={f.id} className="list-item">
                            <div className="list-item-info">
                                <p><strong>{f.nome}</strong></p>
                                <a href={`https://wa.me/${f.whatsapp}`} target="_blank" rel="noopener noreferrer">{formatarWhatsappParaExibicao(f.whatsapp)}</a>
                                {f.observacoes && <p className='sub-text'>Obs: {f.observacoes}</p>}
                            </div>
                            <div className="list-item-actions">
                                <button className="button-icon" onClick={() => handleEditar(f)}><IconeEditar /></button>
                                <button className="button-icon" onClick={() => handleDelete(f.id)}><IconeLixeira /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    export default GerenciarFornecedores;
""")

AUTH_CONTEXT_JS_CONTENT = textwrap.dedent("""
    import React, { createContext, useState, useEffect, useContext } from 'react';
    import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
    import { doc, getDoc, setDoc } from "firebase/firestore";
    import { auth, db } from '../firebase';

    const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
        const [userRole, setUserRole] = useState(null);
        const [loadingAuth, setLoadingAuth] = useState(true);

        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUserRole(userDocSnap.data().role);
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                }
                setLoadingAuth(false);
            });
            return unsubscribe;
        }, []);

        const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);

        const registerUser = async (email, password, role = 'colaborador') => {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: role,
                criadoEm: new Date()
            });
            return userCredential;
        };

        const logout = () => signOut(auth);

        const value = { user, userRole, loadingAuth, loginUser, registerUser, logout };

        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => useContext(AuthContext);
""")

DATA_CONTEXT_JS_CONTENT = textwrap.dedent("""
    import React, { createContext, useState, useEffect, useContext } from 'react';
    import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
    import { db } from '../firebase';
    import { useAuth } from './AuthContext';

    const DataContext = createContext();

    export const DataProvider = ({ children }) => {
        const { user, userRole } = useAuth();
        const [fornecedores, setFornecedores] = useState([]);
        const [produtosDeCompra, setProdutosDeCompra] = useState([]);
        const [insumos, setInsumos] = useState([]);
        const [produtos, setProdutos] = useState([]);
        const [allPedidos, setAllPedidos] = useState([]);
        const [loadingData, setLoadingData] = useState(true);

        useEffect(() => {
            if (!user) {
                setFornecedores([]); setProdutosDeCompra([]); setInsumos([]);
                setProdutos([]); setAllPedidos([]); setLoadingData(false);
                return;
            }

            setLoadingData(true);
            const collectionsToFetch = [
                { name: "fornecedores", setter: setFornecedores, orderByField: "nome" },
                { name: "produtosDeCompra", setter: setProdutosDeCompra, orderByField: "nome" },
                { name: "pedidosRealizados", setter: setAllPedidos, orderByField: "criadoEm", orderDirection: "desc" }
            ];

            if (userRole === 'gestor') {
                collectionsToFetch.push({ name: "insumos", setter: setInsumos, orderByField: "nome" });
                collectionsToFetch.push({ name: "produtosFinais", setter: setProdutos, orderByField: "nome" });
            }
            
            const unsubscribers = collectionsToFetch.map(coll => 
                onSnapshot(query(collection(db, coll.name), orderBy(coll.orderByField, coll.orderDirection || 'asc')), 
                    (snapshot) => coll.setter(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))),
                    (error) => console.error("Erro ao buscar coleção:", coll.name, error)
                )
            );
            
            setLoadingData(false);
            return () => unsubscribers.forEach(unsub => unsub());
        }, [user, userRole]);

        const value = { fornecedores, produtosDeCompra, insumos, produtos, allPedidos, loadingData };
        return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
    };
    export const useData = () => useContext(DataContext);
""")

UI_CONTEXT_JS_CONTENT = textwrap.dedent("""
    import React, { createContext, useState, useContext } from 'react';

    const UIContext = createContext();

    export const UIProvider = ({ children }) => {
        const [modal, setModal] = useState({ isOpen: false, message: '' });
        const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });
        
        const showModal = (message) => setModal({ isOpen: true, message });
        const closeModal = () => setModal({ isOpen: false, message: '' });
        
        const showConfirmationModal = (message, onConfirm) => setConfirmationModal({ isOpen: true, message, onConfirm });
        const closeConfirmationModal = () => setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });
        
        const handleConfirmAction = () => {
            if (typeof confirmationModal.onConfirm === 'function') {
                confirmationModal.onConfirm();
            }
            closeConfirmationModal();
        };

        const value = {
            modal, showModal, closeModal,
            confirmationModal, showConfirmationModal, closeConfirmationModal, handleConfirmAction
        };
        
        return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
    };

    export const useUI = () => useContext(UIContext);
""")

MODAL_JS_CONTENT = textwrap.dedent("""
    import React from 'react';

    const Modal = ({ children, onConfirm, showCancel, onCancel, title, confirmText = "Fechar" }) => (
        <div className="modal-overlay">
            <div className="modal-content">
                {title && <h2>{title}</h2>}
                <div className="modal-body">
                    {typeof children === 'string' ? <p>{children}</p> : children}
                </div>
                <div className="modal-actions">
                    {showCancel && <button onClick={onCancel} className="button-secondary">Cancelar</button>}
                    <button data-cy="modal-confirm-button" onClick={onConfirm} className="button-primary">{confirmText}</button>
                </div>
            </div>
        </div>
    );

    export default Modal;
""")

DASHBOARD_VIEW_JS_CONTENT = textwrap.dedent("""
    import React, { useMemo } from 'react';
    import { useData } from '../../context/DataContext';
    import { IconeGrafico } from '../../utils/icons';
    import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
    import { Bar, Line } from 'react-chartjs-2';

    ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

    const DashboardView = () => {
        const { allPedidos, loadingData } = useData();

        const { barChartData, lineChartData } = useMemo(() => {
            if (loadingData || allPedidos.length === 0) {
                return { barChartData: null, lineChartData: null };
            }

            const gastosPorFornecedor = allPedidos.reduce((acc, pedido) => {
                if(pedido.status === 'finalizado') {
                    const nome = pedido.fornecedorNome || 'Sem Fornecedor';
                    const valor = pedido.valorTotal || 0;
                    acc[nome] = (acc[nome] || 0) + valor;
                }
                return acc;
            }, {});

            const barData = {
                labels: Object.keys(gastosPorFornecedor),
                datasets: [{
                    label: 'Gastos Totais por Fornecedor (R$)',
                    data: Object.values(gastosPorFornecedor),
                    backgroundColor: 'rgba(0, 51, 160, 0.6)',
                }],
            };
            
            const gastosPorMes = allPedidos.reduce((acc, pedido) => {
                if (pedido.status === 'finalizado' && pedido.criadoEm) {
                    const mesAno = new Date(pedido.criadoEm.seconds * 1000).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' });
                    const valor = pedido.valorTotal || 0;
                    acc[mesAno] = (acc[mesAno] || 0) + valor;
                }
                return acc;
            }, {});

            const sortedMonths = Object.keys(gastosPorMes).sort((a, b) => {
                const [m1, y1] = a.split('/');
                const [m2, y2] = b.split('/');
                return new Date(`${y1}-${m1}-01`) - new Date(`${y2}-${m2}-01`);
            });

            const lineData = {
                labels: sortedMonths,
                datasets: [{
                    label: 'Gastos Mensais (R$)',
                    data: sortedMonths.map(mes => gastosPorMes[mes]),
                    fill: false,
                    borderColor: 'rgb(217, 48, 37)',
                    tension: 0.1
                }]
            };

            return { barChartData: barData, lineChartData: lineData };
        }, [allPedidos, loadingData]);

        if (loadingData) {
            return <div className="card"><h2>Carregando Dashboard...</h2></div>;
        }

        return (
            <div className="grid-responsive">
                <div className="card">
                    <h2><IconeGrafico /> Dashboard Gerencial</h2>
                    <p>Visão geral do desempenho e custos do seu negócio.</p>
                </div>
                {barChartData && (
                    <div className="card">
                        <h3>Gastos por Fornecedor (Pedidos Finalizados)</h3>
                        <div style={{ height: '400px', position: 'relative' }}>
                            <Bar data={barChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                        </div>
                    </div>
                )}
                {lineChartData && (
                     <div className="card">
                        <h3>Evolução de Gastos Mensais (Pedidos Finalizados)</h3>
                        <div style={{ height: '400px', position: 'relative' }}>
                            <Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default DashboardView;
""")

CADASTROS_VIEW_JS_CONTENT = textwrap.dedent("""
    import React from 'react'; 
    import GerenciarFornecedores from './GerenciarFornecedores'; 
    import GerenciarCatalogo from './GerenciarCatalogo';
    export default () => (
        <div className='grid-responsive'>
            <GerenciarFornecedores />
            <GerenciarCatalogo />
        </div>
    );
""")

GERENCIAR_CATALOGO_JS_CONTENT = textwrap.dedent("""
    import React, { useState, useMemo } from 'react';
    import { useUI } from '../../context/UIContext';
    import { useData } from '../../context/DataContext';
    import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
    import { IconeCatalogo, IconeBusca, IconeEditar, IconeLixeira } from '../../utils/icons';

    const GerenciarCatalogo = () => {
        const { showModal, showConfirmationModal } = useUI();
        const { produtosDeCompra, fornecedores } = useData();

        const initialState = {
            nome: '',
            fornecedorId: '',
            detalheCompra: {
                tipoBase: 'peso',
                unidadeCompra: '',
                conteudo: '',
                unidadeConteudo: 'kg',
            },
        };

        const [editing, setEditing] = useState(null);
        const [formState, setFormState] = useState(initialState);
        const [busca, setBusca] = useState('');

        const produtosFiltrados = useMemo(() =>
            produtosDeCompra.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())),
            [produtosDeCompra, busca]
        );

        const handleFormChange = (e) => {
            const { name, value } = e.target;
            if (name.startsWith("detalheCompra.")) {
                const field = name.split('.')[1];
                if (field === 'tipoBase') {
                    const newUnit = value === 'peso' ? 'kg' : 'L';
                    setFormState(prev => ({...prev, detalheCompra: {...prev.detalheCompra, tipoBase: value, unidadeConteudo: newUnit}}));
                } else {
                    setFormState(prev => ({...prev, detalheCompra: {...prev.detalheCompra, [field]: value}}));
                }
            } else {
                setFormState(prev => ({ ...prev, [name]: value }));
            }
        };

        const calcularMedidaPadrao = (detalhe) => {
            const { tipoBase, conteudo, unidadeConteudo } = detalhe;
            const valor = parseFloat(String(conteudo).replace(',', '.'));
            if (isNaN(valor)) return null;

            if (tipoBase === 'peso') return { valor: unidadeConteudo === 'kg' ? valor * 1000 : valor, unidade: 'g' };
            if (tipoBase === 'volume') return { valor: unidadeConteudo === 'L' ? valor * 1000 : valor, unidade: 'ml' };
            if (tipoBase === 'unidade') return { valor: valor, unidade: 'un' };
            return null;
        };

        const handleSalvar = async (e) => {
            e.preventDefault();
            const { nome, fornecedorId, detalheCompra } = formState;
            if (!nome || !fornecedorId || !detalheCompra.unidadeCompra || !detalheCompra.conteudo) {
                showModal("Preencha todos os campos obrigatórios do produto.");
                return;
            }
            const medidaPadrao = calcularMedidaPadrao(detalheCompra);
            if (!medidaPadrao) {
                showModal("Medida inválida. Verifique os valores de conteúdo.");
                return;
            }
            const dataToSave = { nome, fornecedorId, detalheCompra, medidaPadrao };

            try {
                if (editing) {
                    await updateDocument("produtosDeCompra", editing.id, dataToSave);
                    showModal("Produto atualizado!");
                } else {
                    await addDocument("produtosDeCompra", dataToSave);
                    showModal("Produto salvo no catálogo!");
                }
                resetForm();
            } catch (error) {
                showModal("Erro ao salvar: " + error.message);
            }
        };

        const handleEditar = (produto) => {
            setEditing(produto);
            setFormState({
                nome: produto.nome,
                fornecedorId: produto.fornecedorId,
                detalheCompra: produto.detalheCompra
            });
        };
        
        const handleDelete = (id) => {
             showConfirmationModal("Excluir este produto do catálogo?", async () => {
                try {
                    await deleteDocument("produtosDeCompra", id);
                    showModal("Produto excluído.");
                } catch (error) {
                    showModal("Erro ao excluir: " + error.message);
                }
            });
        };

        const resetForm = () => { setEditing(null); setFormState(initialState); };
        
        const formatarDetalheCompraParaExibicao = (detalhe) => {
            if (!detalhe || !detalhe.unidadeCompra) return '';
            return `${detalhe.unidadeCompra} de ${detalhe.conteudo} ${detalhe.unidadeConteudo || ''}`;
        };

        return (
            <div className="card">
                <h2><IconeCatalogo /> Gerenciar Catálogo de Compra</h2>
                <form onSubmit={handleSalvar}>
                    <div className="form-group"><label>Nome do Produto no Catálogo</label><input name="nome" type="text" value={formState.nome} onChange={handleFormChange} placeholder="Ex: Queijo Mussarela Peça" required /></div>
                    <div className="form-group"><label>Como o produto é medido?</label><select name="detalheCompra.tipoBase" value={formState.detalheCompra.tipoBase} onChange={handleFormChange}><option value="peso">Por Peso (g, kg)</option><option value="volume">Por Volume (ml, L)</option><option value="unidade">Por Unidade (un, cx, pct)</option></select></div>
                    <div className="form-group-inline">
                        <div className="form-group"><label>Forma de Compra</label><input name="detalheCompra.unidadeCompra" type="text" value={formState.detalheCompra.unidadeCompra} onChange={handleFormChange} placeholder="Ex: Peça, Caixa" required /></div>
                        {(formState.detalheCompra.tipoBase === 'peso' || formState.detalheCompra.tipoBase === 'volume') && (<><div className="form-group"><label>Quantidade</label><input name="detalheCompra.conteudo" type="text" value={formState.detalheCompra.conteudo} onChange={handleFormChange} placeholder="Ex: 2.5" required /></div><div className="form-group"><label>Medida</label><select name="detalheCompra.unidadeConteudo" value={formState.detalheCompra.unidadeConteudo} onChange={handleFormChange}>{formState.detalheCompra.tipoBase === 'peso' ? (<><option value="kg">kg</option><option value="g">g</option></>) : (<><option value="L">L</option><option value="ml">ml</option></>)}</select></div></>)}
                        {formState.detalheCompra.tipoBase === 'unidade' && (<div className="form-group"><label>Nº de Itens</label><input name="detalheCompra.conteudo" type="number" value={formState.detalheCompra.conteudo} onChange={handleFormChange} placeholder="Ex: 12" required /></div>)}
                    </div>
                    <div className="form-group"><label>Fornecedor Padrão</label><select name="fornecedorId" value={formState.fornecedorId} onChange={handleFormChange} required><option value="">Selecione...</option>{fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
                    <button type="submit" className="button-primary">{editing ? 'Atualizar Produto' : 'Salvar Novo Produto'}</button>
                    {editing && <button type="button" onClick={resetForm} className="button-link">Cancelar</button>}
                </form>
                <div className="divider" />
                <div className="form-group"><label>Buscar Produto</label><div className="input-with-icon"><span className="icon"><IconeBusca /></span><input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Digite para buscar..." /></div></div>
                <div className="list-container">
                    {produtosFiltrados.map(p => (
                        <div key={p.id} className="list-item">
                            <div className="list-item-info">
                                <p><strong>{p.nome}</strong></p>
                                <p className="sub-text">Detalhe: {formatarDetalheCompraParaExibicao(p.detalheCompra)}</p>
                                <p className="sub-text">Padrão: {p.medidaPadrao.valor}{p.medidaPadrao.unidade}</p>
                                <p className="sub-text">Fornecedor: {fornecedores.find(f => f.id === p.fornecedorId)?.nome || 'N/A'}</p>
                            </div>
                            <div className="list-item-actions">
                                <button className="button-icon" onClick={() => handleEditar(p)}><IconeEditar /></button>
                                <button className="button-icon" onClick={() => handleDelete(p.id)}><IconeLixeira /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    export default GerenciarCatalogo;
""")

CMV_VIEW_JS_CONTENT = textwrap.dedent("""
    import React, { useState, useMemo } from 'react';
    import { useData } from '../../context/DataContext';
    import { useUI } from '../../context/UIContext';
    import { setDocument, incrementField, addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
    import { IconeCmv, IconeFichaTecnica, IconeEditar, IconeLixeira, IconeSalvar } from '../../utils/icons';
    import { formatarValor, formatarValorPreciso } from '../../utils/formatters';
    
    const RegistrarCompra = () => {
        const { produtosDeCompra, allPedidos } = useData();
        const { showModal } = useUI();
        const [selectedProdutoId, setSelectedProdutoId] = useState('');
        const [valorNota, setValorNota] = useState('');
        const [pedidoVinculadoId, setPedidoVinculadoId] = useState('');

        const handleUpdateInsumoCost = async (e) => {
            e.preventDefault();
            const produtoSelecionado = produtosDeCompra.find(p => p.id === selectedProdutoId);
            const valor = parseFloat(String(valorNota).replace(',', '.'));

            if (!produtoSelecionado || isNaN(valor) || valor <= 0) {
                showModal("Selecione um produto e insira um valor de nota válido.");
                return;
            }
            
            const { medidaPadrao } = produtoSelecionado;
            if (!medidaPadrao || !medidaPadrao.valor) {
                showModal("O produto selecionado não tem uma medida padrão calculada. Verifique o cadastro.");
                return;
            }

            const precoFinal = valor / medidaPadrao.valor;

            const insumoData = {
                nome: produtoSelecionado.nome,
                fornecedorId: produtoSelecionado.fornecedorId,
                preco_por_unidade_padrao: precoFinal,
                unidade_padrao: medidaPadrao.unidade,
                ultima_compra_desc: `Nota de R$ ${valor.toFixed(2)} para ${medidaPadrao.valor}${medidaPadrao.unidade}`,
            };

            try {
                await setDocument("insumos", produtoSelecionado.id, insumoData);
                await incrementField("insumos", produtoSelecionado.id, "estoqueAtual", medidaPadrao.valor);
                
                if (pedidoVinculadoId) {
                    await updateDocument("pedidosRealizados", pedidoVinculadoId, {
                        valorTotal: valor,
                        status: 'finalizado'
                    });
                }
                
                showModal(`Custo atualizado e estoque incrementado! Novo custo: ${formatarValorPreciso(precoFinal)}/${medidaPadrao.unidade}.`);
                setSelectedProdutoId('');
                setValorNota('');
                setPedidoVinculadoId('');
            } catch (error) {
                showModal("Erro ao atualizar custo: " + error.message);
            }
        };
        
        const pedidosPendentes = useMemo(() => allPedidos.filter(p => p.status === 'enviado'), [allPedidos]);

        return (
            <div className="card">
                <h2><IconeSalvar /> Registrar Compra e Fechar Ciclo</h2>
                <form onSubmit={handleUpdateInsumoCost}>
                    <div className="form-group">
                        <label>1. Selecione o item do Catálogo</label>
                        <select value={selectedProdutoId} onChange={e => setSelectedProdutoId(e.target.value)} required>
                            <option value="">Selecione um produto...</option>
                            {produtosDeCompra.map(p => (
                                <option key={p.id} value={p.id}>{p.nome} ({p.detalheCompra.unidadeCompra})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>2. Valor Total da Nota Fiscal (R$)</label>
                        <input type="text" value={valorNota} onChange={e => setValorNota(e.target.value)} placeholder="Ex: 150,25" required />
                    </div>
                    <div className="form-group">
                        <label>3. Vincular a um Pedido Enviado (Opcional)</label>
                         <select value={pedidoVinculadoId} onChange={e => setPedidoVinculadoId(e.target.value)}>
                            <option value="">Não vincular</option>
                            {pedidosPendentes.map(p => (
                                <option key={p.id} value={p.id}>
                                    Pedido para {p.fornecedorNome} em {new Date(p.criadoEm.seconds * 1000).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="button-primary">Calcular Custo e Adicionar ao Estoque</button>
                </form>
            </div>
        );
    };
 
    const GerenciarProdutosFinais = () => {
        const { insumos, produtos } = useData();
        const { showModal, showConfirmationModal } = useUI();

        const initialState = {
            nome: '',
            categoria: '',
            variantes: [{ nomeVariante: 'Padrão', custoEmbalagem: '', custoOperacional: '', fichaTecnica: [] }]
        };

        const [editingProduto, setEditingProduto] = useState(null);
        const [formState, setFormState] = useState(initialState);
        const [varianteAtiva, setVarianteAtiva] = useState(0);
        const [insumoFicha, setInsumoFicha] = useState('');
        const [qtdInsumoFicha, setQtdInsumoFicha] = useState('');
        const [margemLucro, setMargemLucro] = useState(200);

        const resetForm = () => {
            setEditingProduto(null);
            setFormState(initialState);
            setVarianteAtiva(0);
        };
        
        const handleSalvarProdutoFinal = async (e) => {
            e.preventDefault();
            if (!formState.nome) {
                showModal("O nome do produto é obrigatório.");
                return;
            }

            try {
                const variantesCalculadas = formState.variantes.map(variante => {
                    let custoTotalInsumos = 0;
                    const fichaTecnicaCalculada = variante.fichaTecnica.map(item => {
                        const insumoDetalhe = insumos.find(i => i.id === item.insumoId);
                        if (!insumoDetalhe) throw new Error(`Insumo "${item.nome}" não encontrado.`);
                        const custoItem = item.quantidade * insumoDetalhe.preco_por_unidade_padrao;
                        custoTotalInsumos += custoItem;
                        return { ...item, custo: custoItem };
                    });

                    const custoEmbalagem = parseFloat(String(variante.custoEmbalagem || '0').replace(',', '.'));
                    const custoOperacional = parseFloat(String(variante.custoOperacional || '0').replace(',', '.'));
                    const cmvCalculado = custoTotalInsumos + custoEmbalagem + custoOperacional;

                    return { ...variante, fichaTecnica: fichaTecnicaCalculada, cmvCalculado };
                });

                const produtoData = {
                    nome: formState.nome,
                    categoria: formState.categoria || 'Sem Categoria',
                    variantes: variantesCalculadas
                };

                if (editingProduto) {
                    await updateDocument("produtosFinais", editingProduto.id, produtoData);
                    showModal("Produto atualizado com sucesso!");
                } else {
                    await addDocument("produtosFinais", produtoData);
                    showModal("Produto final salvo com sucesso!");
                }
                resetForm();
            } catch (error) {
                showModal("Erro ao salvar produto: " + error.message);
            }
        };
        
        const handleAdicionarItemFicha = () => {
            const insumo = insumos.find(i => i.id === insumoFicha);
            const quantidade = parseFloat(String(qtdInsumoFicha).replace(',', '.'));
            if (!insumo || isNaN(quantidade) || quantidade <= 0) {
                showModal("Selecione um insumo e quantidade válida.");
                return;
            }
            
            const novasVariantes = [...formState.variantes];
            novasVariantes[varianteAtiva].fichaTecnica.push({
                insumoId: insumo.id,
                nome: insumo.nome,
                quantidade: quantidade,
                unidade: insumo.unidade_padrao
            });
            setFormState({...formState, variantes: novasVariantes });
            setInsumoFicha('');
            setQtdInsumoFicha('');
        };

        const handleRemoverItemFicha = (itemIndex) => {
            const novasVariantes = [...formState.variantes];
            novasVariantes[varianteAtiva].fichaTecnica.splice(itemIndex, 1);
            setFormState({ ...formState, variantes: novasVariantes });
        };
        
        const handleUpdateVariante = (index, campo, valor) => {
            const novasVariantes = [...formState.variantes];
            novasVariantes[index][campo] = valor;
            setFormState({ ...formState, variantes: novasVariantes });
        };

        const handleAdicionarVariante = () => {
            const novasVariantes = [...formState.variantes, { nomeVariante: `Variante ${formState.variantes.length + 1}`, custoEmbalagem: '', custoOperacional: '', fichaTecnica: [] }];
            setFormState({ ...formState, variantes: novasVariantes });
        };

        const handleRemoverVariante = (index) => {
            if (formState.variantes.length <= 1) {
                showModal("O produto deve ter pelo menos uma variante.");
                return;
            }
            const novasVariantes = [...formState.variantes];
            novasVariantes.splice(index, 1);
            setFormState({ ...formState, variantes: novasVariantes });
            if (varianteAtiva >= index && varianteAtiva > 0) {
                setVarianteAtiva(varianteAtiva - 1);
            }
        };
        
        const handleEditarProduto = (produto) => {
            setEditingProduto(produto);
            setFormState(produto);
            setVarianteAtiva(0);
        };

        const handleDeleteProduto = (id) => {
            showConfirmationModal("Excluir este produto e todas as suas fichas técnicas?", async () => {
                try {
                    await deleteDocument("produtosFinais", id);
                    showModal("Produto excluído.");
                } catch (error) {
                    showModal("Erro ao excluir: " + error.message);
                }
            });
        };

        return (
            <div className="card">
                <h2><IconeFichaTecnica /> Gerenciar Produtos Finais (Ficha Técnica)</h2>
                <form onSubmit={handleSalvarProdutoFinal}>
                    <div className="form-group-inline">
                        <div className="form-group"><label>Nome do Produto</label><input type="text" value={formState.nome} onChange={e => setFormState({...formState, nome: e.target.value})} placeholder="Ex: Pizza" required/></div>
                        <div className="form-group"><label>Categoria</label><input type="text" value={formState.categoria} onChange={e => setFormState({...formState, categoria: e.target.value})} placeholder="Ex: Pizzas Salgadas"/></div>
                    </div>
                    
                    <div className="variantes-manager">
                        <h4>Variantes (Tamanhos/Sabores)</h4>
                        <div className="variantes-tabs">
                            {formState.variantes.map((v, index) => (
                                <button type="button" key={index} onClick={() => setVarianteAtiva(index)} className={varianteAtiva === index ? 'active' : ''}>
                                    {v.nomeVariante || `Variante ${index+1}`}
                                </button>
                            ))}
                            <button type="button" onClick={handleAdicionarVariante} className="button-add-variant">+</button>
                        </div>
                        <div className="variante-content">
                            <div className="form-group-inline">
                                <div className="form-group"><label>Nome da Variante</label><input type="text" value={formState.variantes[varianteAtiva].nomeVariante} onChange={e => handleUpdateVariante(varianteAtiva, 'nomeVariante', e.target.value)} placeholder="Ex: Grande, Calabresa"/></div>
                                <div className="form-group"><label>Custo Embalagem (R$)</label><input type="text" value={formState.variantes[varianteAtiva].custoEmbalagem} onChange={e => handleUpdateVariante(varianteAtiva, 'custoEmbalagem', e.target.value)} placeholder="1.50"/></div>
                                <div className="form-group"><label>Outros Custos (Gás, M.O.)</label><input type="text" value={formState.variantes[varianteAtiva].custoOperacional} onChange={e => handleUpdateVariante(varianteAtiva, 'custoOperacional', e.target.value)} placeholder="3.00"/></div>
                                {formState.variantes.length > 1 && <button type="button" onClick={() => handleRemoverVariante(varianteAtiva)} className="button-icon"><IconeLixeira/></button>}
                            </div>
                            <h5>Ficha Técnica da Variante</h5>
                            <div className="form-group-inline">
                                <div className="form-group" style={{flex: 3}}><label>Insumo</label><select value={insumoFicha} onChange={e => setInsumoFicha(e.target.value)}><option value="">Selecione...</option>{insumos.map(i => <option key={i.id} value={i.id}>{`${i.nome} (${i.unidade_padrao})`}</option>)}</select></div>
                                <div className="form-group"><label>Qtd</label><input type="text" value={qtdInsumoFicha} onChange={e => setQtdInsumoFicha(e.target.value)} placeholder="Ex: 150"/></div>
                                <button type="button" onClick={handleAdicionarItemFicha} className="button-secondary" disabled={!insumoFicha || !qtdInsumoFicha}>+</button>
                            </div>
                            <div className="list-container" style={{maxHeight: '150px'}}>
                                {formState.variantes[varianteAtiva].fichaTecnica.map((item, index) => (
                                    <div key={index} className="list-item">
                                        <span>{item.nome} - {item.quantidade} {item.unidade}</span>
                                        <button type='button' className='button-icon' onClick={() => handleRemoverItemFicha(index)}><IconeLixeira/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="divider-soft" />
                    <button type="submit" className="button-primary">{editingProduto ? 'Atualizar Produto' : 'Salvar Novo Produto'}</button>
                    {editingProduto && <button type="button" onClick={resetForm} className="button-link">Cancelar Edição</button>}
                </form>

                <div className="divider" />
                <h3><IconeFichaTecnica /> Produtos Finais Cadastrados</h3>
                <div className="form-group"><label>Margem de Lucro para Preço Sugerido (%)</label><input type="number" value={margemLucro} onChange={e => setMargemLucro(Number(e.target.value))} /></div>
                <div className="list-container">
                    {produtos.map(p => (
                        <div key={p.id} className="card" style={{marginBottom: '1rem'}}>
                            <div className="list-item" style={{borderBottom: 'none', padding: 0}}>
                                <h4>{p.nome} - <span className="sub-text">{p.categoria}</span></h4>
                                <div className="list-item-actions">
                                    <button className="button-icon" onClick={() => handleEditarProduto(p)}><IconeEditar/></button>
                                    <button className="button-icon" onClick={() => handleDeleteProduto(p.id)}><IconeLixeira/></button>
                                </div>
                            </div>
                            <div className="divider-soft" />
                            {p.variantes.map((v, index) => (
                                <div key={index} className="list-item">
                                    <strong>{v.nomeVariante}</strong>
                                    <div>
                                        <p>CMV: <strong>{formatarValor(v.cmvCalculado)}</strong></p>
                                        <p className="sub-text">Preço Sugerido: {formatarValor(v.cmvCalculado * (1 + margemLucro / 100))}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    const CmvView = () => {
        return (
            <div className="grid-responsive">
                <RegistrarCompra />
                <GerenciarProdutosFinais />
            </div>
        );
    };

    export default CmvView;
""")

HISTORICO_VIEW_JS_CONTENT = textwrap.dedent("""
    import React from 'react';
    import { useData } from '../../context/DataContext';
    import { IconeHistorico } from '../../utils/icons';
    import { formatarData, formatarValor } from '../../utils/formatters';

    const HistoricoView = () => {
        const { allPedidos, loadingData } = useData();
        
        if (loadingData) {
            return <div className="card"><h2>Carregando Histórico...</h2></div>;
        }

        return (
            <div className="card">
                <h2><IconeHistorico /> Histórico de Pedidos</h2>
                <div className="list-container">
                    {allPedidos.length > 0 ? allPedidos.map(pedido => (
                        <div key={pedido.id} className="list-item">
                            <div className="list-item-info">
                                <p><strong>Fornecedor:</strong> {pedido.fornecedorNome}</p>
                                <p className="sub-text"><strong>Data:</strong> {formatarData(pedido.criadoEm)}</p>
                                <p className="sub-text"><strong>Solicitante:</strong> {pedido.solicitanteEmail}</p>
                                <p className="sub-text"><strong>Status:</strong> {pedido.status}</p>
                                <ul>{pedido.itens.map((item, index) => <li key={index}>- {item.qtd}x {item.nome}</li>)}</ul>
                            </div>
                            <p><strong>{formatarValor(pedido.valorTotal)}</strong></p>
                        </div>
                    )) : <p>Nenhum pedido no histórico.</p>}
                </div>
            </div>
        );
    };

    export default HistoricoView;
""")

PEDIDOS_VIEW_JS_CONTENT = textwrap.dedent("""
    import React, { useState } from 'react';
    import { useData } from '../../context/DataContext';
    import { useUI } from '../../context/UIContext';
    import { useAuth } from '../../context/AuthContext';
    import { addDocument } from '../../services/firestoreService';
    import { formatarWhatsappParaLink } from '../../utils/formatters';
    import { IconeCarrinho, IconeLixeira } from '../../utils/icons';

    const PedidosView = () => {
        const { fornecedores, produtosDeCompra } = useData();
        const { showModal } = useUI();
        const { user } = useAuth();
        
        const [carrinho, setCarrinho] = useState({});
        const [itemPedido, setItemPedido] = useState({ produtoId: '', qtd: 1, fornecedorId: '', observacao: '' });

        const handleAddItemAoCarrinho = (e) => {
            e.preventDefault();
            const { produtoId, qtd, fornecedorId, observacao } = itemPedido;
            const produtoInfo = produtosDeCompra.find(p => p.id === produtoId);
            if (!produtoInfo || qtd <= 0) {
                showModal("Selecione um produto e quantidade válidos.");
                return;
            }
            const novoCarrinho = { ...carrinho };
            if (!novoCarrinho[fornecedorId]) {
                novoCarrinho[fornecedorId] = [];
            }
            novoCarrinho[fornecedorId].push({ id: produtoId, nome: produtoInfo.nome, qtd: Number(qtd), observacao: observacao, unidade: produtoInfo.detalheCompra.unidadeCompra });
            setCarrinho(novoCarrinho);
            setItemPedido({ produtoId: '', qtd: 1, fornecedorId: itemPedido.fornecedorId, observacao: '' });
        };
        
        const handleEnviarPedidoWhatsApp = async (fornecedorId) => {
            const fornecedor = fornecedores.find(f => f.id === fornecedorId);
            const itensDoPedido = carrinho[fornecedorId];
            if (!fornecedor || !itensDoPedido || itensDoPedido.length === 0) {
                showModal("Não há itens no pedido para este fornecedor.");
                return;
            }

            let mensagem = `Olá, *${fornecedor.nome}*!\\nGostaria de fazer o seguinte pedido:\\n\\n`;
            itensDoPedido.forEach(item => {
                mensagem += `- ${item.qtd}x ${item.nome} (${item.unidade})`;
                if (item.observacao) {
                    mensagem += ` (Obs: ${item.observacao})`;
                }
                mensagem += `\\n`;
            });
            
            const link = `https://wa.me/${formatarWhatsappParaLink(fornecedor.whatsapp)}?text=${encodeURIComponent(mensagem)}`;
            window.open(link, '_blank');
            
            try {
                await addDocument("pedidosRealizados", {
                    fornecedorId: fornecedor.id,
                    fornecedorNome: fornecedor.nome,
                    itens: itensDoPedido,
                    solicitanteEmail: user.email,
                    status: 'enviado',
                    valorTotal: 0
                });
            } catch (error) {
                showModal("Erro ao salvar pedido no histórico: " + error.message);
            }
            
            const novoCarrinho = { ...carrinho };
            delete novoCarrinho[fornecedorId];
            setCarrinho(novoCarrinho);
        };
        
        return (
            <div className="card">
                <h2><IconeCarrinho /> Fazer um Pedido</h2>
                <form onSubmit={handleAddItemAoCarrinho}>
                    <div className="form-group">
                        <label>1. Fornecedor</label>
                        <select value={itemPedido.fornecedorId} onChange={(e) => setItemPedido({ ...itemPedido, fornecedorId: e.target.value, produtoId: '' })} required>
                            <option value="">Selecione...</option>
                            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                        </select>
                    </div>
                    {itemPedido.fornecedorId && (
                        <>
                            <div className="form-group">
                                <label>2. Produto do Catálogo</label>
                                <select value={itemPedido.produtoId} onChange={(e) => setItemPedido({ ...itemPedido, produtoId: e.target.value })} required>
                                    <option value="">Selecione...</option>
                                    {produtosDeCompra.filter(p => p.fornecedorId === itemPedido.fornecedorId).map(p => (
                                        <option key={p.id} value={p.id}>{p.nome} ({p.detalheCompra.unidadeCompra})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group-inline">
                                <div className="form-group">
                                    <label>3. Quantidade</label>
                                    <input type="number" value={itemPedido.qtd} onChange={(e) => setItemPedido({ ...itemPedido, qtd: e.target.value })} min="1" required />
                                </div>
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Observação (Opcional)</label>
                                    <input type="text" value={itemPedido.observacao} onChange={e => setItemPedido({ ...itemPedido, observacao: e.target.value })} placeholder="Ex: Sem cebola" />
                                </div>
                            </div>
                            <button type="submit" className="button-secondary">Adicionar ao Carrinho</button>
                        </>
                    )}
                </form>
                <div className="divider" />
                <h3>Itens no Carrinho</h3>
                <div className="list-container">
                    {Object.keys(carrinho).length > 0 ? Object.keys(carrinho).map(fornecedorId => {
                        const fornecedor = fornecedores.find(f => f.id === fornecedorId);
                        return (
                            <div key={fornecedorId} className="pedido-fornecedor">
                                <h4>Pedido para: {fornecedor?.nome || '...'}</h4>
                                {carrinho[fornecedorId].map((item, index) => (
                                    <div key={index} className="list-item">
                                        <span>{item.qtd}x {item.nome} {item.observacao && <em className="sub-text">({item.observacao})</em>}</span>
                                        <button className="button-icon" onClick={() => {
                                            const novoCarrinho = { ...carrinho };
                                            novoCarrinho[fornecedorId].splice(index, 1);
                                            if (novoCarrinho[fornecedorId].length === 0) {
                                                delete novoCarrinho[fornecedorId];
                                            }
                                            setCarrinho(novoCarrinho);
                                        }}><IconeLixeira /></button>
                                    </div>
                                ))}
                                <button onClick={() => handleEnviarPedidoWhatsApp(fornecedorId)} className="button-primary">Enviar Pedido</button>
                            </div>
                        )
                    }) : <p className="sub-text">Seu carrinho está vazio.</p>}
                </div>
            </div>
        );
    };
    
    export default PedidosView;
""")

RELATORIOS_VIEW_JS_CONTENT = textwrap.dedent("""
    import React from 'react';
    import { IconeGrafico } from '../../utils/icons';
    import AnaliseDeCustoInsumo from './AnaliseDeCustoInsumo';

    const RelatoriosView = () => {
        return (
            <div>
                <div className="card">
                    <h2><IconeGrafico /> Relatórios Gerenciais</h2>
                    <p>Esta área é dedicada à análise aprofundada dos dados do seu negócio.</p>
                </div>
                <AnaliseDeCustoInsumo />
            </div>
        );
    };

    export default RelatoriosView;
""")

ANALISE_CUSTO_INSUMO_JS_CONTENT = textwrap.dedent("""
    import React, { useState, useMemo } from 'react';
    import { useData } from '../../context/DataContext';
    import { IconeBusca } from '../../utils/icons';
    import { formatarValorPreciso } from '../../utils/formatters';
    import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
    import { Bar } from 'react-chartjs-2';

    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    const AnaliseDeCustoInsumo = () => {
        const { insumos, fornecedores, loadingData } = useData();
        const [insumoSelecionado, setInsumoSelecionado] = useState(null);

        const insumosAgrupados = useMemo(() => {
            return insumos.reduce((acc, insumo) => {
                const nomeBase = insumo.nome;
                if (!acc[nomeBase]) {
                    acc[nomeBase] = [];
                }
                acc[nomeBase].push(insumo);
                return acc;
            }, {});
        }, [insumos]);
        
        const handleSelectInsumo = (nomeInsumo) => {
            setInsumoSelecionado(insumosAgrupados[nomeInsumo] || null);
        };

        const chartData = useMemo(() => {
            if (!insumoSelecionado) return null;
            
            const labels = insumoSelecionado.map(i => fornecedores.find(f => f.id === i.fornecedorId)?.nome || 'N/A');
            const data = insumoSelecionado.map(i => i.preco_por_unidade_padrao);
            
            return {
                labels,
                datasets: [{
                    label: `Custo por ${insumoSelecionado[0].unidade_padrao}`,
                    data,
                    backgroundColor: 'rgba(217, 48, 37, 0.6)',
                }]
            }
        }, [insumoSelecionado, fornecedores]);


        if (loadingData) return <div className="card"><h3>Carregando análise...</h3></div>;

        return (
            <div className="card">
                <h3><IconeBusca /> Análise Comparativa de Custos por Insumo</h3>
                <div className="form-group">
                    <label>Selecione um insumo para comparar os preços de compra</label>
                    <select className="form-control" onChange={(e) => handleSelectInsumo(e.target.value)} defaultValue="">
                        <option value="" disabled>Escolha um insumo...</option>
                        {Object.keys(insumosAgrupados).sort().map(nome => (
                            <option key={nome} value={nome}>{nome}</option>
                        ))}
                    </select>
                </div>

                {insumoSelecionado && chartData && (
                    <div>
                        <div className="divider" />
                        <h4>Comparativo de Custo para: {insumoSelecionado[0].nome}</h4>
                        <div style={{ height: '300px', position: 'relative', marginBottom: '2rem' }}>
                           <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
                        </div>
                        <div className="list-container" style={{maxHeight: '200px'}}>
                            {insumoSelecionado.sort((a,b) => a.preco_por_unidade_padrao - b.preco_por_unidade_padrao).map(i => (
                                <div key={i.id} className="list-item">
                                    <p><strong>{fornecedores.find(f => f.id === i.fornecedorId)?.nome || 'N/A'}</strong></p>
                                    <p>{formatarValorPreciso(i.preco_por_unidade_padrao)} / {i.unidade_padrao}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default AnaliseDeCustoInsumo;
""")

FIRESTORE_SERVICE_JS_CONTENT = textwrap.dedent("""
    import { db } from '../firebase';
    import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, increment } from "firebase/firestore";

    export const addDocument = (collectionName, data) => {
        return addDoc(collection(db, collectionName), { ...data, criadoEm: serverTimestamp() });
    };
    export const updateDocument = (collectionName, docId, data) => {
        const docRef = doc(db, collectionName, docId);
        return updateDoc(docRef, { ...data, atualizadoEm: serverTimestamp() });
    };
    export const deleteDocument = (collectionName, docId) => {
        const docRef = doc(db, collectionName, docId);
        return deleteDoc(docRef);
    };
    export const setDocument = (collectionName, docId, data) => {
        const docRef = doc(db, collectionName, docId);
        return setDoc(docRef, { ...data, atualizadoEm: serverTimestamp() }, { merge: true }); 
    };
    export const incrementField = (collectionName, docId, field, value) => {
        const docRef = doc(db, collectionName, docId);
        return updateDoc(docRef, { [field]: increment(value) });
    };
""")

ICONS_JS_CONTENT = textwrap.dedent("""
    import React from 'react';
    const Icon = ({ children, ...props }) => <span className="icon" {...props}>{children}</span>;
    export const IconeCaminhao = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM8 9h2m5-3v10l-2 2h-1" /></svg></Icon>;
    export const IconeCadastro = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></Icon>;
    export const IconeCarrinho = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.838-5.513c.279-.834-.26-1.745-1.132-1.745H4.883L3.117 3.187m15.75 11.25a3 3 0 00-3-3H7.5" /></svg></Icon>;
    export const IconeLixeira = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></Icon>;
    export const IconeEditar = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg></Icon>;
    export const IconeLogout = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg></Icon>;
    export const IconeCmv = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></svg></Icon>;
    export const IconeHistorico = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg></Icon>;
    export const IconeGrafico = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5v11.25A2.25 2.25 0 0118 16.5h-12A2.25 2.25 0 013.75 14.25V3z" /></svg></Icon>;
    export const IconeBusca = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg></Icon>;
    export const IconeCatalogo = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg></Icon>;
    export const IconeDashboard = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg></Icon>;
    export const IconeFichaTecnica = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></Icon>;
    export const IconeSalvar = (props) => <Icon {...props}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></Icon>;
""")

FORMATTERS_JS_CONTENT = textwrap.dedent("""
    export const formatarWhatsappParaLink = (numeroInput) => {
        let digitos = (numeroInput || '').replace(/\\D/g, '');
        if (!digitos) return null;
        if (digitos.length < 10) return null;
        if (digitos.length >= 12 && digitos.startsWith('55')) return digitos;
        if (digitos.length === 11 || digitos.length === 10) return `55${digitos}`;
        return null;
    };

    export const formatarWhatsappParaExibicao = (numeroSalvo) => {
        const digitos = String(numeroSalvo || '').replace(/\\D/g, '');
        if (digitos.startsWith('55')) {
            const numeroSemDDI = digitos.substring(2);
            if (numeroSemDDI.length === 11) {
                return `(${numeroSemDDI.substring(0, 2)}) ${numeroSemDDI.substring(2, 7)}-${numeroSemDDI.substring(7)}`;
            }
            if (numeroSemDDI.length === 10) {
                return `(${numeroSemDDI.substring(0, 2)}) ${numeroSemDDI.substring(2, 6)}-${numeroSemDDI.substring(6)}`;
            }
        }
        return numeroSalvo;
    };

    export const formatarValor = (valor) => {
        if (typeof valor !== 'number') return 'R$ 0,00';
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }

    export const formatarValorPreciso = (valor) => {
        if (typeof valor !== 'number') return 'R$ 0,00000';
        return `R$ ${valor.toFixed(5).replace('.', ',')}`;
    }

    export const formatarData = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return 'Data inválida';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };
""")

# --- ESTRUTURA FINAL DO PROJETO ---

PROJECT_STRUCTURE = {
    "sistema-pedidos-100": {
        "package.json": PACKAGE_JSON_CONTENT,
        ".gitignore": GITIGNORE_CONTENT,
        "README.md": README_MD_CONTENT,
        "cypress.config.js": CYPRESS_CONFIG_JS_CONTENT,
        "cypress": {
            "e2e": {
                "sistema_completo.cy.js": CYPRESS_TEST_FILE_CONTENT
            }
        },
        "public": { "index.html": INDEX_HTML_CONTENT },
        "src": {
            "App.css": APP_CSS_CONTENT,
            "App.js": APP_JS_CONTENT,
            "firebase.js": FIREBASE_JS_CONTENT,
            "index.css": INDEX_CSS_CONTENT,
            "index.js": INDEX_JS_CONTENT,
            "components": {
                "auth": { "AccessSelectionPage.js": ACCESS_SELECTION_PAGE_JS_CONTENT },
                "ui": { "Modal.js": MODAL_JS_CONTENT }
            },
            "context": {
                "AuthContext.js": AUTH_CONTEXT_JS_CONTENT,
                "DataContext.js": DATA_CONTEXT_JS_CONTENT,
                "UIContext.js": UI_CONTEXT_JS_CONTENT,
            },
            "features": {
                "dashboard": { "DashboardView.js": DASHBOARD_VIEW_JS_CONTENT },
                "cadastros": {
                    "CadastrosView.js": CADASTROS_VIEW_JS_CONTENT,
                    "GerenciarCatalogo.js": GERENCIAR_CATALOGO_JS_CONTENT,
                    "GerenciarFornecedores.js": GERENCIAR_FORNECEDORES_JS_CONTENT,
                },
                "cmv": { "CmvView.js": CMV_VIEW_JS_CONTENT },
                "historico": { "HistoricoView.js": HISTORICO_VIEW_JS_CONTENT },
                "pedidos": { "PedidosView.js": PEDIDOS_VIEW_JS_CONTENT },
                "relatorios": {
                    "RelatoriosView.js": RELATORIOS_VIEW_JS_CONTENT,
                    "AnaliseDeCustoInsumo.js": ANALISE_CUSTO_INSUMO_JS_CONTENT
                }
            },
            "services": { "firestoreService.js": FIRESTORE_SERVICE_JS_CONTENT },
            "utils": {
                "formatters.js": FORMATTERS_JS_CONTENT,
                "icons.js": ICONS_JS_CONTENT
            }
        }
    }
}


def create_project_structure(base_path, structure):
    for name, content in structure.items():
        current_path = os.path.join(base_path, name)
        if isinstance(content, dict):
            print(f"Criando diretório: {current_path}")
            os.makedirs(current_path, exist_ok=True)
            create_project_structure(current_path, content)
        else:
            print(f"Criando arquivo:   {current_path}")
            with open(current_path, 'w', encoding='utf-8') as f:
                f.write(content.strip())

def main():
    print("Iniciando a criação da estrutura do projeto React e dos testes Cypress...")
    project_root = os.getcwd()
    create_project_structure(project_root, PROJECT_STRUCTURE)

    print("\\n" + "="*50)
    print("✅ Estrutura do projeto corrigida e criada com sucesso!")
    print("="*50)
    print("\\nPróximos passos:")
    print("1. Navegue até a pasta do projeto:")
    print("   cd sistema-pedidos-100")
    print("\\n2. Instale as dependências (requer Node.js e npm):")
    print("   npm install")
    print("\\n3. Inicie o servidor de desenvolvimento:")
    print("   npm start")
    print("\\n4. Em um novo terminal, execute o comando para abrir o Cypress:")
    print("   npm run cypress:open")
    print("\\nLembre-se: Configure suas credenciais em 'src/firebase.js'!")

if __name__ == "__main__":
    main()