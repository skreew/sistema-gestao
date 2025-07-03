import os
import textwrap

# --- CONTEÚDO DOS ARQUIVOS DO PROJETO ---

# Conteúdo para .env.local
ENV_LOCAL_CONTENT = textwrap.dedent("""
REACT_APP_API_KEY="AIzaSyDrROaFFo6xjrkn4FhKWdY1c4Z0Jyy6SNw"
REACT_APP_AUTH_DOMAIN="sistema-gestao-1a0cd.firebaseapp.com"
REACT_APP_PROJECT_ID="sistema-gestao-1a0cd"
REACT_APP_STORAGE_BUCKET="sistema-gestao-1a0cd.appspot.com"
REACT_APP_MESSAGING_SENDER_ID="715681926217"
REACT_APP_APP_ID="1:715681926217:web:7b4ed090a6c2aa2afec398"
REACT_APP_MEASUREMENT_ID="G-Z2KJC3GMNE"
""")

# Conteúdo para firestore.rules
FIRESTORE_RULES_CONTENT = textwrap.dedent("""
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }

    function isGestor() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'gestor';
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isSignedIn() && isOwner(userId);
      allow create: if isGestor();
      allow update: if isGestor() || (isSignedIn() && isOwner(userId));
    }

    match /fornecedores/{docId} {
      allow read: if isSignedIn();
      allow write: if isGestor() &&
                          request.resource.data.nome is string &&
                          request.resource.data.nome.size() > 0 &&
                          request.resource.data.whatsapp is string &&
                          request.resource.data.whatsapp.size() > 0;
    }
    
    match /produtosDeCompra/{docId} {
      allow read: if isSignedIn();
      allow write: if isGestor() &&
                          request.resource.data.nome is string &&
                          request.resource.data.nome.size() > 0 &&
                          request.resource.data.unidadeAnalise is string &&
                          request.resource.data.unidadeAnalise in ['kg', 'L', 'un'];
      
      match /historicoPrecos/{priceId} {
        allow read: if isSignedIn();
        allow write: if isGestor() &&
                            request.resource.data.tipo is string &&
                            request.resource.data.tipo in ['compra', 'oferta'] &&
                            request.resource.data.fornecedorId is string &&
                            (request.resource.data.dataCompra is timestamp || request.resource.data.dataOferta is timestamp) &&
                            request.resource.data.precoPorUnidadeAnalise is number &&
                            request.resource.data.precoPorUnidadeAnalise > 0;
      }
    }
    
    match /produtosFinais/{docId} {
      allow read: if isSignedIn();
      allow write: if isGestor() &&
                          request.resource.data.nome is string &&
                          request.resource.data.nome.size() > 0 &&
                          request.resource.data.variantes is list &&
                          request.resource.data.variantes.size() > 0 &&
                          request.resource.data.variantes.all(v =>
                              v.nomeVariante is string && v.nomeVariante.size() > 0 &&
                              v.custoEmbalagem is number && v.custoEmbalagem >= 0 &&
                              v.custoOperacional is number && v.custoOperacional >= 0 &&
                              v.fichaTecnica is list
                          );
    }
    
    match /pedidosRealizados/{docId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow delete: if isGestor();
      allow update: if isGestor();
    }
    
    match /vendas/{docId} {
      allow read: if isSignedIn();
      allow write: if isGestor();
      allow delete: if isGestor();
    }
    
    match /faturamento/{docId} {
      allow read, write: if isGestor() &&
                                  request.resource.data.valor is number && request.resource.data.valor > 0 &&
                                  request.resource.data.data is timestamp;
    }
    
    match /despesas/{docId} {
      allow read, write: if isGestor() &&
                                  request.resource.data.valor is number && request.resource.data.valor > 0 &&
                                  request.resource.data.data is timestamp &&
                                  request.resource.data.categoria is string && request.resource.data.categoria.size() > 0;
    }
  }
}
""")

# Conteúdo para package.json (do projeto React)
PACKAGE_JSON_CONTENT = textwrap.dedent("""
{
  "name": "sistema-gestao-final",
  "version": "6.0.0",
  "private": true,
  "dependencies": {
    "chart.js": "^4.4.0",
    "firebase": "^9.10.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.5.25",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-csv": "^2.2.2",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.23.1",
    "lucide-react": "^0.395.0",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.7",
    "prettier": "^3.3.2",
    "tailwindcss": "^3.4.4",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "format": "prettier --write \\"src/**/*.js\\"",
    "lint": "eslint \\"src/**/*.js\\"",
    "prepare": "husky"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest",
      "plugin:prettier/recommended"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
""")

# Conteúdo para public/index.html
INDEX_HTML_CONTENT = textwrap.dedent("""
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Sistema de Gestão Empresarial completo para pequenos e médios negócios"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Sistema de Gestão Empresarial</title>
  </head>
  <body>
    <noscript>Você precisa habilitar o JavaScript para rodar esta aplicação.</noscript>
    <div id="root"></div>
  </body>
</html>
""")

# Conteúdo para src/App.css (OTIMIZADO)
APP_CSS_CONTENT = textwrap.dedent("""
/* Estilos Globais e Variáveis */
:root {
  --cor-primaria: #0033a0; /* Azul Escuro */
  --cor-primaria-escura: #002269;
  --cor-secundaria: #f0f6ff; /* Azul Claro */
  --cor-sucesso: #009e4d; /* Verde */
  --cor-perigo: #d93025; /* Vermelho */
  --cor-aviso: #fbbc05; /* Amarelo */
  --cor-texto: #333;
  --cor-texto-claro: #666;
  --cor-fundo: #f4f7f9; /* Cinza Claro */
  --cor-borda: #e0e0e0; /* Cinza Médio */
  --sombra-card: 0 4px 8px rgba(0, 0, 0, 0.08);
  --sombra-modal: 0 10px 25px rgba(0, 0, 0, 0.2);
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--cor-fundo);
  color: var(--cor-texto);
  line-height: 1.6;
}

/* Layout Principal da Aplicação */
.App {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
  overflow: hidden;
}

.main-header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background-color: #fff;
  border-bottom: 1px solid var(--cor-borda);
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.main-nav {
  grid-area: sidebar;
  background-color: #fff;
  padding: 1rem;
  border-right: 1px solid var(--cor-borda);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  text-align: left;
  width: 100%;
  transition: background-color 0.2s, color 0.2s;
  color: var(--cor-texto-claro);
  text-decoration: none;
}
.nav-link:hover {
  background-color: var(--cor-secundaria);
  color: var(--cor-primaria-escura);
}
.nav-link.active {
  background-color: var(--cor-primaria);
  color: white;
}
.nav-link.active .icon {
  color: white;
}

main.container {
  grid-area: main;
  padding: 2rem;
  overflow-y: auto;
  background-color: var(--cor-fundo);
}

/* Componentes UI Reutilizáveis */
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--sombra-card);
  margin-bottom: 1.5rem;
  position: relative;
}
.card h2, .card h3, .card h4 {
  color: var(--cor-primaria-escura);
  margin-top: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.card p {
  color: var(--cor-texto-claro);
  margin-bottom: 1rem;
}

.button-primary, .button-secondary, .button-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
}

.button-primary {
  background-color: var(--cor-primaria);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 51, 160, 0.2);
}
.button-primary:hover {
  background-color: var(--cor-primaria-escura);
  box-shadow: 0 4px 8px rgba(0, 51, 160, 0.3);
}
.button-primary:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
  box-shadow: none;
}

.button-secondary {
  background-color: #fff;
  color: var(--cor-primaria);
  border: 1px solid var(--cor-primaria);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.button-secondary:hover {
  background-color: var(--cor-secundaria);
  color: var(--cor-primaria-escura);
}
.button-secondary:disabled {
  background-color: #f0f0f0;
  color: #a0a0a0;
  border-color: #d0d0d0;
  cursor: not-allowed;
}

.button-link {
  background: none;
  border: none;
  color: var(--cor-primaria);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 0.9rem;
  margin-left: 1rem;
}
.button-link:hover {
  color: var(--cor-primaria-escura);
}

.button-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--cor-texto-claro);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
}
.button-icon:hover {
  background-color: var(--cor-secundaria);
  color: var(--cor-primaria);
  transform: scale(1.1);
}
.button-icon.danger:hover {
    color: var(--cor-perigo);
    background-color: #fce8e6;
}
.button-icon.small {
    padding: 0.3rem;
    font-size: 0.8em;
}

.btn-full-width {
    width: 100%;
}

/* Formulários */
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cor-texto);
}
.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--cor-borda);
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 1rem;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(0, 51, 160, 0.2);
}
.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.input-with-icon {
    position: relative;
}
.input-with-icon .icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--cor-texto-claro);
    pointer-events: none;
}
.input-with-icon input {
    padding-left: 40px;
}

.form-group-inline {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
}
.form-group-inline > .form-group {
  flex: 1;
  margin-bottom: 0;
}
.error-message {
  color: var(--cor-perigo);
  font-size: 0.85rem;
  margin-top: 0.4rem;
}

/* Listas */
.list-container {
  border: 1px solid var(--cor-borda);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
}
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--cor-borda);
  background-color: #fff;
}
.list-item:last-child {
  border-bottom: none;
}
.list-item:hover {
  background-color: var(--cor-secundaria);
}
.list-item-info p {
  margin: 0;
}
.sub-text {
  font-size: 0.85rem;
  color: var(--cor-texto-claro);
}
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Abas */
.variantes-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  border-bottom: 2px solid var(--cor-borda);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
}
.variantes-tabs button {
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-weight: 600;
  color: var(--cor-texto-claro);
  transition: border-color 0.2s, color 0.2s;
  border-radius: 8px 8px 0 0;
}
.variantes-tabs button.active {
  border-bottom-color: var(--cor-primaria);
  color: var(--cor-primaria);
  background-color: #fff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
}
.modal-content {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: var(--sombra-modal);
  width: 100%;
  max-width: 500px;
  animation: fadeInScale 0.3s ease-out;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content h2 {
  padding: 1.5rem 1.5rem 0.5rem;
  margin: 0;
  color: var(--cor-primaria-escura);
  border-bottom: 1px solid var(--cor-borda);
}
.modal-body {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
}
.modal-actions {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--cor-borda);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Layouts Específicos */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.left-column, .right-column {
    display: flex;
    flex-direction: column;
}
.left-column .card, .right-column .card {
    flex-grow: 1;
}

/* Login Page (Melhorado) */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--cor-primaria), var(--cor-primaria-escura));
  padding: 1rem;
}
.login-card {
  width: 100%;
  max-width: 420px;
  text-align: center;
  background-color: #fff;
  border-radius: 16px; /* Mais arredondado */
  padding: 2.5rem; /* Mais espaçoso */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* Sombra mais proeminente */
}
.login-card h1 {
  font-size: 2.5rem; /* Maior */
  color: var(--cor-primaria);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 700; /* Mais negrito */
}
.login-card p {
  color: var(--cor-texto-claro);
  margin-bottom: 2rem; /* Mais espaço */
  font-size: 1.1rem;
}
.login-card .button-primary {
  margin-top: 1.5rem; /* Espaço para o botão */
  width: 100%; /* Botão em largura total */
  padding: 0.9rem 1.5rem; /* Mais preenchimento */
  font-size: 1.1rem;
}

.loading-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--cor-fundo);
    font-size: 1.2rem;
    color: var(--cor-texto-claro);
}
.loading-screen .icon {
    font-size: 3rem;
    color: var(--cor-primaria);
    animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}


/* Empty States Acionáveis */
.empty-state {
  text-align: center;
  padding: 2rem;
  border: 2px dashed var(--cor-borda);
  border-radius: 8px;
  margin-top: 2rem;
  background-color: #fcfcfc;
}
.empty-state .icon {
  font-size: 3rem;
  color: var(--cor-borda);
  margin-bottom: 1rem;
  display: block;
  width: auto;
  height: 3rem;
  margin-left: auto;
  margin-right: auto;
}
.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--cor-texto);
}
.empty-state .button-primary {
  margin-top: 1.5rem;
}

/* Outros */
.divider {
  border-top: 1px solid var(--cor-borda);
  margin: 1.5rem 0;
}
.divider-soft {
  border-top: 1px dashed #eee;
  margin: 1rem 0;
}

.disabled-card {
    position: relative;
    opacity: 0.6;
    pointer-events: none;
}

.overlay-message {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-weight: bold;
    color: var(--cor-primaria-escura);
    font-size: 1.1rem;
    border-radius: 12px;
    z-index: 10;
    padding: 1rem;
}

/* Responsividade */
.hamburger-menu-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--cor-texto-claro);
}
.mobile-only {
    display: none;
}
.desktop-only {
    display: flex;
}

@media (max-width: 768px) {
  .App {
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;
    grid-template-areas:
      "header"
      "main";
  }
  .main-nav {
    position: fixed;
    top: 0;
    left: -240px;
    width: 240px;
    height: 100vh;
    z-index: 60;
    transition: left 0.3s ease-in-out;
    box-shadow: 2px 0 5px rgba(0,0,0,0.2);
    padding-top: 60px;
  }
  .main-nav.open {
    left: 0;
  }
  .main-nav .nav-button {
    text-align: left;
  }
  .main-header {
    padding: 0 1rem;
  }
  .main-header .user-info {
    display: none;
  }
  .hamburger-menu-button {
    display: block;
  }
  .mobile-only {
    display: flex;
    margin-top: auto;
  }
  .two-column-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  main.container {
    padding: 1rem;
  }
  .modal-content {
    max-width: 95%;
  }
}
""")

# Conteúdo para src/firebase.js
FIRESTORE_JS_CONTENT = textwrap.dedent("""
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
""")

# Conteúdo para src/index.css
INDEX_CSS_CONTENT = textwrap.dedent("""
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
""")

# Conteúdo para o README.md
README_MD_CONTENT = textwrap.dedent("""
# Sistema de Gestão Empresarial v6.0 (Versão Profissional)

Aplicação React refatorada para maior segurança, performance e manutenibilidade, utilizando React Router para navegação e variáveis de ambiente para as chaves de API.

## Funcionalidades Principais

* Dashboard: Visão geral e rápida dos indicadores do negócio.
* Vendas: Histórico de todas as vendas realizadas.
* Pedidos de Compra: Crie e envie pedidos para os seus fornecedores.
* Catálogo: Gestão centralizada de fornecedores e insumos (matérias-primas).
* Fichas Técnicas: Calcule o Custo de Mercadoria Vendida (CMV) de forma precisa para cada produto.
* Fluxo de Caixa: Controle todas as entradas e saídas financeiras.
* Análises e Relatórios: Compare preços de insumos e visualize históricos.
* Gestão de Utilizadores: Adicione e gira os acessos de colaboradores e gestores.

## Como Iniciar

1.  Criar Ficheiro de Ambiente (OBRIGATÓRIO):
    * Na raiz do projeto (`sistema-gestao-final`), crie um ficheiro chamado `.env.local`.
    * Copie o conteúdo do ficheiro `.env.example` para o `.env.local` e substitua pelas suas credenciais **reais** do Firebase.

2.  Instale as Dependências:
    ```bash
    npm install
    ```

3.  Inicie a Aplicação:
    ```bash
    npm start
    ```

4.  Configure as Regras de Segurança do Firestore:
    * Vá ao seu painel do Firebase > Firestore Database > Rules.
    * Copie o conteúdo do ficheiro `firestore.rules` (na raiz do projeto) e cole no editor de regras do Firebase.
    * Clique em "Publicar".

5.  Primeiro Acesso:
    * No painel de 'Authentication' do seu projeto Firebase, crie manualmente o seu primeiro utilizador (será o gestor principal).
    * Na base de dados 'Firestore', crie uma coleção chamada 'users'.
    * Dentro de 'users', crie um documento com o mesmo UID do utilizador que criou.
    * Dentro desse documento, adicione um campo 'role' (string) com o valor 'gestor'.
    * Agora, aceda à aplicação (http://localhost:3000) com as credenciais do gestor que criou.
""")

# Conteúdo para postcss.config.js
POSTCSS_CONFIG_JS_CONTENT = textwrap.dedent("""
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
""")

# Conteúdo para tailwind.config.js
TAILWIND_CONFIG_JS_CONTENT = textwrap.dedent("""
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
""")

# Conteúdo para src/AppRoutes.js
APP_ROUTES_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      return <Navigate to={PATHS.DASHBOARD} replace />; // Redirect to dashboard if not authorized
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
            isAuthenticated && userRole === ROLES.GESTOR && !isOnboardingComplete ? (
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
""")

# Conteúdo para src/index.js
INDEX_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Import necessary context providers
import { AuthProvider } from './context/Auth';
import { DataProvider } from './context/DataContext';
import { UIProvider } from './context/UIContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UIProvider>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </UIProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(); // Removed unused function call
""")

# Conteúdo para .gitignore
GITIGNORE_CONTENT = textwrap.dedent("""
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# editor directories and files
.idea
.vscode/*
!.vscode/extensions.json
.history
""")

# Conteúdo para src/components/auth/AccessSelectionPage.js (CORRIGIDO)
ACCESS_SELECTION_PAGE_JS_CONTENT = textwrap.dedent("""
import React, { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useUI } from '../../context/UIContext';
import { IconeUsers } from '../../utils/icons';
import InputField from '../ui/forms/InputField';

const AccessSelectionPage = () => {
  const { loginUser } = useAuth();
  const { showToast } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'E-mail é obrigatório.';
    if (!password) errors.password = 'Senha é obrigatória.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoggingIn(true);
    try {
      await loginUser(email, password);
      showToast('Login bem-sucedido!');
    } catch (error) {
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'E-mail ou senha inválidos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Formato de e-mail inválido.';
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-card card'>
        <h1>
          <IconeUsers className="text-cor-primaria" /> Sistema de Gestão
        </h1>
        <p className="text-gray-600 mb-8">Faça login para acessar o sistema.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label='E-mail'
            type='email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder='seu.email@exemplo.com'
            required
            error={formErrors.email}
            icon={IconeUsers}
          />
          {/* Reutilizando IconeUsers para senha para simplicidade, pode ser alterado para um ícone de cadeado se disponível */}
          <InputField
            label='Senha'
            type='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder='Sua senha'
            required
            error={formErrors.password}
            icon={IconeUsers} 
          />
          <button type='submit' className='button-primary w-full py-3 text-lg' disabled={isLoggingIn}>
            {isLoggingIn ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccessSelectionPage;
""")

# Conteúdo para src/components/ui/forms/InputField.js
INPUT_FIELD_JS_CONTENT = textwrap.dedent("""
import React, { forwardRef } from 'react';

const InputField = forwardRef(
  ({ label, id, type = 'text', value, onChange, placeholder, required, error, icon: Icon, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\\s/g, '-') : `input-${Math.random().toString(36).substring(7)}`);
    const inputClasses = error ? 'input-error' : '';

    return (
      <div className='form-group'>
        {label && <label htmlFor={inputId}>{label}</label>}
        <div className={`input-with-icon ${Icon ? 'has-icon' : ''}`}>
          {Icon && <Icon size={20} className="icon" />}
          {type === 'textarea' ? (
            <textarea
              id={inputId}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className={inputClasses}
              ref={ref}
              {...props}
            />
          ) : (
            <input
              id={inputId}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className={inputClasses}
              ref={ref}
              {...props}
            />
          )}
        </div>
        {error && <span className='error-message'>{error}</span>}
      </div>
    );
  }
);

export default InputField;
""")

# Conteúdo para src/components/ui/forms/SelectField.js
SELECT_FIELD_JS_CONTENT = textwrap.dedent("""
import React from 'react';

const SelectField = ({ label, id, value, onChange, options, required, error, ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\\s/g, '-') : `select-${Math.random().toString(36).substring(7)}`);
  const selectClasses = error ? 'input-error' : '';

  return (
    <div className='form-group'>
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        className={selectClasses}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className='error-message'>{error}</span>}
    </div>
  );
};

export default SelectField;
""")

# Conteúdo para src/constants/roles.js
ROLES_JS_CONTENT = textwrap.dedent("""
export const ROLES = {
  GESTOR: 'gestor',
  COLABORADOR: 'colaborador',
};
""")

# Conteúdo para src/constants/paths.js
PATHS_JS_CONTENT = textwrap.dedent("""
export const PATHS = {
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  VENDAS: '/vendas',
  PEDIDOS: '/pedidos',
  CATALOGO: '/catalogo',
  CMV: '/cmv',
  FLUXO_CAIXA: '/fluxo-de-caixa',
  ANALISES: '/analises',
  GESTAO_UTILIZADORES: '/gestao-utilizadores',
  ONBOARDING: '/onboarding',
};
""")

# Content for src/App.js
APP_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <> {/* Added React Fragment to wrap adjacent JSX elements */}
      <Toaster
        position='top-right'
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
""")

# Content for src/context/Auth.js (CORRIGIDO)
AUTH_CONTEXT_JS_CONTENT = textwrap.dedent("""
import React, { createContext, useState, useEffect, useContext, useTransition } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [, startTransition] = useTransition(); // Removed isPending as it's not used in UI

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      startTransition(() => {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          getDoc(userDocRef).then((userDocSnap) => {
            if (userDocSnap.exists()) {
              setUser(currentUser);
              const data = userDocSnap.data();
              setUserRole(data.role);
              setUserProfile(data);
            } else {
              console.error(
                'Usuário autenticado mas sem dados no Firestore. Fazendo logout.',
              );
              signOut(auth);
            }
            setLoadingAuth(false);
          }).catch((error) => {
            console.error("Erro ao buscar perfil do usuário:", error);
            setLoadingAuth(false);
          });
        } else {
          setUser(null);
          setUserRole(null);
          setUserProfile(null);
          setLoadingAuth(false);
        }
      });
    });
    return unsubscribe;
  }, []);

  const loginUser = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const registerUser = async (email, password, role) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const newUser = userCredential.user;

    const onboardingComplete = role === 'gestor' ? false : true;

    await setDoc(doc(db, 'users', newUser.uid), {
      uid: newUser.uid,
      email: newUser.email,
      role: role,
      criadoEm: new Date(),
      onboardingComplete: onboardingComplete,
    });

    await signOut(auth);

    return userCredential;
  };

  const updateOnboardingStatus = async (uid, status) => {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { onboardingComplete: status });
    startTransition(() => {
      setUserProfile((prev) => ({ ...prev, onboardingComplete: status }));
    });
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    userRole,
    userProfile,
    loadingAuth,
    loginUser,
    registerUser,
    logout,
    updateOnboardingStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
""")

# Content for src/context/DataContext.js (CORRIGIDO)
DATA_CONTEXT_JS_CONTENT = textwrap.dedent("""
import React, { createContext, useState, useEffect, useContext, useRef, useTransition } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './Auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [produtosDeCompra, setProdutosDeCompra] = useState([]); // This will hold the enriched data
  const [produtosDeCompraBase, setProdutosDeCompraBase] = useState([]); // Temporary state for products without history
  const [produtos, setProdutos] = useState([]);
  const [allPedidos, setAllPedidos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [faturamentos, setFaturamentos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [, startTransition] = useTransition(); // Removed isPending as it's not used in UI

  const loadedCollections = useRef(new Set());
  // Total collections to track for initial loading, including the enriched produtosDeCompra
  const totalCollections = 7; // fornecedores, produtosFinais, pedidosRealizados, vendas, faturamentos, despesas, produtosDeCompra (enriched)

  const checkAllLoaded = () => {
    if (loadedCollections.current.size >= totalCollections) {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const unsubscribers = [];

    if (!user) {
      // Reset all states when user logs out
      startTransition(() => {
        setFornecedores([]);
        setProdutosDeCompra([]);
        setProdutosDeCompraBase([]); // Reset this too
        setProdutos([]);
        setAllPedidos([]);
        setVendas([]);
        setFaturamentos([]);
        setDespesas([]);
        setLoadingData(false);
      });
      loadedCollections.current.clear();
      return;
    }

    setLoadingData(true);
    loadedCollections.current.clear();
    

    const createSnapshotListener = (collectionName, setStateFunc, orderField = 'nome', orderDirection = 'asc') => {
      const q = query(collection(db, collectionName), orderBy(orderField, orderDirection));
      const unsubscribe = onSnapshot(q, (s) => {
        startTransition(() => {
          setStateFunc(s.docs.map(d => ({ ...d.data(), id: d.id })));
        });
        if (!loadedCollections.current.has(collectionName)) {
          loadedCollections.current.add(collectionName);
          // Sempre chame checkAllLoaded após uma coleção ser processada, independentemente do nome.
          // O tratamento especial para 'produtosDeCompra' está em seu useEffect dedicado.
          checkAllLoaded(); 
        }
      });
      unsubscribers.push(unsubscribe);
    };

    // Standard listeners for other collections
    createSnapshotListener('fornecedores', setFornecedores, 'nome', 'asc');
    createSnapshotListener('produtosFinais', setProdutos, 'nome', 'asc');
    createSnapshotListener('pedidosRealizados', setAllPedidos, 'criadoEm', 'desc');
    createSnapshotListener('vendas', setVendas, 'dataVenda', 'desc');
    createSnapshotListener('faturamentos', setFaturamentos, 'data', 'desc');
    createSnapshotListener('despesas', setDespesas, 'data', 'desc');

    // Listener for base produtosDeCompra data (without history yet)
    // This will populate produtosDeCompraBase, and a separate effect will enrich it
    const qProdutosCompraBase = query(collection(db, 'produtosDeCompra'), orderBy('nome'));
    const unsubscribeProdutosDeCompraBase = onSnapshot(qProdutosCompraBase, (snapshot) => {
      startTransition(() => {
        setProdutosDeCompraBase(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      // Não chame checkAllLoaded aqui, pois a busca do histórico é uma etapa separada.
    });
    unsubscribers.push(unsubscribeProdutosDeCompraBase);

    // Set a timeout to eventually stop loading if something goes wrong
    const initialLoadTimeout = setTimeout(() => {
      if (loadingData) {
        setLoadingData(false);
        console.warn('O carregamento de dados expirou. Alguns dados podem não ter sido totalmente carregados.');
      }
    }, 15000); // 15 seconds timeout

    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearTimeout(initialLoadTimeout);
    };
  }, [user, loadingData]); // Depende do usuário para reexecutar quando a autenticação muda

  // Novo useEffect para buscar historicoPrecos uma vez que produtosDeCompraBase é carregado
  useEffect(() => {
    // Prossiga apenas se produtosDeCompraBase tiver dados ou se estiver vazio, mas precisamos marcá-lo como carregado
    if (produtosDeCompraBase.length > 0 || (!loadedCollections.current.has('produtosDeCompra') && loadedCollections.current.has('fornecedores'))) {
      const fetchAndEnrichProducts = async () => {
        const itemsWithPricesPromises = produtosDeCompraBase.map(async (item) => {
          const historicoRef = collection(db, 'produtosDeCompra', item.id, 'historicoPrecos');
          const historicoSnapshot = await getDocs(query(historicoRef, orderBy('dataCompra', 'desc')));

          const allPriceRecords = historicoSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

          if (allPriceRecords.length > 0) {
            const bestPriceRecord = [...allPriceRecords].sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise)[0];
            item.bestPrice = bestPriceRecord.precoPorUnidadeAnalise;
            item.bestPriceFornecedorId = bestPriceRecord.fornecedorId;
          } else {
            item.bestPrice = null;
            item.bestPriceFornecedorId = null;
          }
          item.historicoPrecos = allPriceRecords;
          return item;
        });

        // Resolve todas as promessas de busca de subcoleções
        const resolvedItems = await Promise.all(itemsWithPricesPromises);
        startTransition(() => {
          setProdutosDeCompra(resolvedItems); // Atualiza o estado principal de produtosDeCompra com dados enriquecidos
        });

        // Marca produtosDeCompra como carregado somente após seu histórico ser buscado
        if (!loadedCollections.current.has('produtosDeCompra')) {
          loadedCollections.current.add('produtosDeCompra');
          checkAllLoaded();
        }
      };
      fetchAndEnrichProducts();
    } else if (produtosDeCompraBase.length === 0 && !loadedCollections.current.has('produtosDeCompra') && loadedCollections.current.has('fornecedores')) {
        // Se produtosDeCompraBase estiver vazio, mas outras coleções estiverem carregadas, e produtosDeCompra não estiver marcado,
        // então marca produtosDeCompra como carregado (com um array vazio).
        startTransition(() => {
          setProdutosDeCompra([]);
        });
        if (!loadedCollections.current.has('produtosDeCompra')) {
            loadedCollections.current.add('produtosDeCompra');
            checkAllLoaded();
        }
    }
  }, [produtosDeCompraBase, user]); // Depende de produtosDeCompraBase e user

  const value = {
    fornecedores,
    produtosDeCompra, // Isso agora contém os dados enriquecidos
    produtos,
    allPedidos,
    vendas,
    faturamentos,
    despesas,
    loadingData,
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
""")

# Content for src/context/UIContext.js
UI_CONTEXT_JS_CONTENT = textwrap.dedent("""
import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [modal, setModal] = useState({ isOpen: false, message: '' });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message);
  };

  const showModal = (message) => setModal({ isOpen: true, message });
  const closeModal = () => setModal({ isOpen: false, message: '' });

  const showConfirmationModal = (message, onConfirm) =>
    setConfirmationModal({ isOpen: true, message, onConfirm });
  const closeConfirmationModal = () =>
    setConfirmationModal({ isOpen: false, message: '', onConfirm: () => {} });

  const handleConfirmAction = () => {
    if (typeof confirmationModal.onConfirm === 'function') {
      confirmationModal.onConfirm();
    }
    closeConfirmationModal();
  };

  const value = {
    modal,
    showModal,
    closeModal,
    confirmationModal,
    showConfirmationModal,
    closeConfirmationModal,
    handleConfirmAction,
    showToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);
""")

# Content for src/components/ui/Modal.js
MODAL_JS_CONTENT = textwrap.dedent("""
import React from 'react';

const Modal = ({
  children,
  onConfirm,
  showCancel,
  onCancel,
  title,
  confirmText = 'OK',
}) => (
  <div className='modal-overlay'>
    <div className='modal-content'>
      {title && <h2>{title}</h2>}
      <div className='modal-body'>
        {typeof children === 'string' ? <p>{children}</p> : children}
      </div>
      <div className='modal-actions'>
        {showCancel && (
          <button onClick={onCancel} className='button-secondary'>
            Cancelar
          </button>
        )}
        <button
          data-cy='modal-confirm-button'
          onClick={onConfirm}
          className='button-primary'
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);
export default Modal;
""")

# Content for src/components/layout/MainLayout.js
MAIN_LAYOUT_JS_CONTENT = textwrap.dedent("""
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
    { path: PATHS.DASHBOARD, label: 'Dashboard', icon: IconeDashboard, roles: [ROLES.GESTOR], },
    { path: PATHS.VENDAS, label: 'Vendas', icon: IconeVendas, roles: [ROLES.GESTOR], },
    { path: PATHS.PEDIDOS, label: 'Pedidos', icon: IconeCarrinho, roles: [ROLES.GESTOR, ROLES.COLABORADOR], },
    { path: PATHS.CATALOGO, label: 'Catálogo', icon: IconeCatalogo, roles: [ROLES.GESTOR, ROLES.COLABORADOR], },
    { path: PATHS.CMV, label: 'Fichas Técnicas', icon: IconeFichaTecnica, roles: [ROLES.GESTOR], },
    { path: PATHS.FLUXO_CAIXA, label: 'Fluxo de Caixa', icon: IconeDinheiro, roles: [ROLES.GESTOR], },
    { path: PATHS.ANALISES, label: 'Análises e Relatórios', icon: IconeAnalises, roles: [ROLES.GESTOR], },
    { path: PATHS.GESTAO_UTILIZADORES, label: 'Gestão de Usuários', icon: IconeUsers, roles: [ROLES.GESTOR], },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <div className='App'>
      {confirmationModal.isOpen && (
        <Modal
          title='Confirmação'
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
        <div className='mobile-only' style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button onClick={logout} className='nav-link'>
            <IconeLogout /> Sair
          </button>
        </div>
      </nav>

      {/* Main Header */}
      <header className='main-header'>
        <button
          className='hamburger-menu-button'
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
        <div className='user-info desktop-only'>
          <span>
            {user?.email} ({userRole})
          </span>
          <button
            onClick={logout}
            className='button-secondary'
            style={{ marginLeft: '1rem' }}
          >
            <IconeLogout /> Sair
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className='container'>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
""")

# Content for src/components/ui/LoadingScreen.js
LOADING_SCREEN_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import { IconeCaminhao } from '../../utils/icons';

const LoadingScreen = () => {
  return (
    <div className='loading-screen'>
      <IconeCaminhao />
      <p>Carregando sistema...</p>
    </div>
  );
};

export default LoadingScreen;
""")

# Content for src/features/dashboard/DashboardView.js (CORRIGIDO)
DASHBOARD_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatarValor } from '../../utils/formatters'; // Mantido, pois formatarValor é usado no JSX

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const DashboardView = () => {
  const { allPedidos, faturamentos, despesas, loadingData } = useData();

  const { barChartData, fluxoCaixaData } = useMemo(() => {
    if (loadingData) {
      return { barChartData: null, fluxoCaixaData: null };
    }

    const gastosPorFornecedor = allPedidos
      .filter((p) => p.status === 'finalizado' && p.valorTotal > 0)
      .reduce((acc, p) => {
        const nome = p.fornecedorNome || 'N/A';
        acc[nome] = (acc[nome] || 0) + p.valorTotal;
        return acc;
      }, {});

    const barData = {
      labels: Object.keys(gastosPorFornecedor),
      datasets: [
        {
          label: 'Gastos Totais (R$)',
          data: Object.values(gastosPorFornecedor),
          backgroundColor: 'rgba(0, 51, 160, 0.6)',
        },
      ],
    };

    const fluxoPorMes = {};
    faturamentos.forEach((f) => {
      const date = f.data.toDate ? f.data.toDate() : new Date(f.data.seconds * 1000);
      const mesAno = date.toLocaleDateString('pt-BR', {
        year: '2-digit',
        month: 'short',
      });
      fluxoPorMes[mesAno] = fluxoPorMes[mesAno] || {
        faturamento: 0,
        despesa: 0,
      };
      fluxoPorMes[mesAno].faturamento += f.valor;
    });
    despesas.forEach((d) => {
      const date = d.data.toDate ? d.data.toDate() : new Date(d.data.seconds * 1000);
      const mesAno = date.toLocaleDateString('pt-BR', {
        year: '2-digit',
        month: 'short',
      });
      fluxoPorMes[mesAno] = fluxoPorMes[mesAno] || {
        faturamento: 0,
        despesa: 0,
      };
      fluxoPorMes[mesAno].despesa += d.valor;
    });

    const sortedMonthsFluxo = Object.keys(fluxoPorMes).sort((a, b) => {
      const dateA = new Date('01 ' + a.replace('/', ' '));
      const dateB = new Date('01 ' + b.replace('/', ' '));
      return dateA - dateB;
    });

    const fluxoData = {
      labels: sortedMonthsFluxo,
      datasets: [
        {
          label: 'Faturamento (R$)',
          data: sortedMonthsFluxo.map((m) => fluxoPorMes[m].faturamento),
          borderColor: 'var(--cor-sucesso)',
          backgroundColor: 'rgba(0, 158, 77, 0.2)',
          fill: true,
          tension: 0.1,
        },
        {
          label: 'Despesas (R$)',
          data: sortedMonthsFluxo.map((m) => fluxoPorMes[m].despesa),
          borderColor: 'var(--cor-perigo)',
          backgroundColor: 'rgba(217, 48, 37, 0.2)',
          fill: true,
          tension: 0.1,
        },
      ],
    };

    return { barChartData: barData, fluxoCaixaData: fluxoData };
  }, [allPedidos, faturamentos, despesas, loadingData]);

  if (loadingData)
    return (
      <div className='card'>
        <h2>Carregando Dashboard...</h2>
      </div>
    );

  return (
    <div>
      <div className='card'>
        <h2>
          <IconeGrafico /> Dashboard Gerencial
        </h2>
        <p>Visão geral do desempenho e custos do seu negócio.</p>
      </div>
      <div className='two-column-layout'>
        {barChartData && Object.keys(barChartData.labels).length > 0 ? (
          <div className='card'>
            <h3>Gastos por Fornecedor</h3>
            <div style={{ height: '300px' }}>
              <Bar
                data={barChartData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        ) : (
          <div className='empty-state'>
            <IconeGrafico />
            <h3>Nenhum Gasto por Fornecedor</h3>
            <p className='sub-text'>
              Registre pedidos e marque-os como finalizados para ver este
              gráfico.
            </p>
          </div>
        )}

        {fluxoCaixaData && Object.keys(fluxoCaixaData.labels).length > 0 ? (
          <div className='card'>
            <h3>Fluxo de Caixa Mensal</h3>
            <div style={{ height: '300px' }}>
              <Line
                data={fluxoCaixaData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        ) : (
          <div className='empty-state'>
            <IconeGrafico />
            <h3>Nenhum Dado de Fluxo de Caixa</h3>
            <p className='sub-text'>
              Registre faturamentos e despesas na aba 'Fluxo de Caixa' para ver
              este gráfico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardView;
""")

# Content for src/features/cadastros/CatalogoView.js (CORRIGIDO)
CADASTROS_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useTransition } from 'react';
import { IconeCatalogo } from '../../utils/icons';
import GerenciarFornecedoresTab from './tabs/GerenciarFornecedoresTab';
import GerenciarInsumosTab from './tabs/GerenciarInsumosTab';
import RegistrarCompraTab from './tabs/RegistrarCompraTab';
import GerenciarPrecosInsumosTab from './tabs/GerenciarPrecosInsumosTab';

const CatalogoView = () => {
    const [activeTab, setActiveTab] = useState('fornecedores');
    const [, startTransition] = useTransition(); // Removido isPending, pois não é usado na UI
    
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'fornecedores':
                return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
            case 'insumos':
                return <GerenciarInsumosTab setActiveTab={setActiveTab} />;
            case 'registrarCompra':
                return <RegistrarCompraTab />;
            case 'gerenciarPrecos':
                return <GerenciarPrecosInsumosTab />;
            default:
                return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div>
            <div className="card">
                <h2>
                    <IconeCatalogo /> Catálogo de Itens e Fornecedores
                </h2>
                <p>
                    Gerencie seus fornecedores, registre seus insumos e registre todas
                    as compras para manter o controle de custos.
                </p>
            </div>

            <div className="variantes-tabs">
                <button
                  className={activeTab === 'fornecedores' ? 'active' : ''}
                  onClick={() => startTransition(() => setActiveTab('fornecedores'))}
                >
                    Gerenciar Fornecedores
                </button>
                <button
                  className={activeTab === 'insumos' ? 'active' : ''}
                  onClick={() => startTransition(() => setActiveTab('insumos'))}
                >
                    Gerenciar Insumos
                </button>
                <button
                  className={activeTab === 'registrarCompra' ? 'active' : ''}
                  onClick={() => startTransition(() => setActiveTab('registrarCompra'))}
                >
                    Registrar Nova Compra
                </button>
                <button
                  className={activeTab === 'gerenciarPrecos' ? 'active' : ''}
                  onClick={() => startTransition(() => setActiveTab('gerenciarPrecos'))}
                >
                    Gerenciar Preços de Insumos
                </button>
            </div>

            {renderActiveTab()}
        </div>
    );
};

export default CatalogoView;
""")

# Content for src/features/cadastros/tabs/GerenciarFornecedoresTab.js
GERENCIAR_FORNECEDORES_TAB_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  checkIfDocumentExists,
} from '../../../services/firestoreService';
import { IconeCaminhao, IconeBusca, IconeEditar, IconeLixeira } from '../../../utils/icons';
import { formatarWhatsappParaLink, formatarWhatsappParaExibicao } from '../../../utils/formatters';
import InputField from '../../../components/ui/forms/InputField';

const GerenciarFornecedoresTab = ({ setActiveTab }) => {
  const { showConfirmationModal, showToast } = useUI();
  const { fornecedores } = useData();
  const [editing, setEditing] = useState(null);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [busca, setBusca] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const nomeInputRef = useRef(null);

  useEffect(() => {
    if (editing && nomeInputRef.current) {
      nomeInputRef.current.focus();
    }
  }, [editing]);

  const filtered = useMemo(
    () =>
      fornecedores.filter((f) =>
        f.nome.toLowerCase().includes(busca.toLowerCase()),
      ),
    [fornecedores, busca],
  );

  const validateForm = async () => {
    const errors = {};
    if (!nome.trim()) {
      errors.nome = 'O nome é obrigatório.';
    } else {
      const exists = await checkIfDocumentExists(
        'fornecedores',
        'nome',
        nome.trim(),
        editing ? editing.id : null,
      );
      if (exists) {
        errors.nome = 'Já existe um fornecedor com este nome.';
      }
    }
    if (!whatsapp.trim()) errors.whatsapp = 'O WhatsApp é obrigatório.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const isValid = await validateForm();
    if (!isValid) return;

    setIsSaving(true);
    const formattedNumber = formatarWhatsappParaLink(whatsapp);
    const data = {
      nome: nome.trim(),
      whatsapp: formattedNumber,
      observacoes: observacoes || null,
    };
    try {
      if (editing) {
        await updateDocument('fornecedores', editing.id, data);
        showToast('Fornecedor atualizado!');
      } else {
        await addDocument('fornecedores', data);
        showToast('Fornecedor salvo!');
      }
      resetForm();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (f) => {
    setEditing(f);
    setNome(f.nome);
    setWhatsapp(f.whatsapp);
    setObservacoes(f.observacoes || '');
    setFormErrors({});
  };
  const handleDelete = (id) => {
    showConfirmationModal(
      'Tem certeza que deseja apagar este fornecedor?',
      async () => {
        try {
          await deleteDocument('fornecedores', id);
          showToast('Fornecedor apagado.');
        } catch (error) {
          showToast('Erro ao apagar: ' + error.message, 'error');
        }
      },
    );
  };
  const resetForm = () => {
    setEditing(null);
    setNome('');
    setWhatsapp('');
    setObservacoes('');
    setFormErrors({});
  };

  return (
    <div className='card' data-cy='card-gerenciar-fornecedores'>
      <h2>
        <IconeCaminhao /> Gerenciar Fornecedores
      </h2>
      <form onSubmit={handleSave}>
        <InputField
          data-cy='input-fornecedor-nome'
          label='Nome'
          type='text'
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setFormErrors((prev) => ({ ...prev, nome: '' }));
          }}
          placeholder='Nome da empresa'
          required
          error={formErrors.nome}
          ref={nomeInputRef}
        />
        <InputField
          data-cy='input-fornecedor-whatsapp'
          label='WhatsApp'
          type='text'
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(e.target.value);
            setFormErrors((prev) => ({ ...prev, whatsapp: '' }));
          }}
          placeholder='(XX) XXXXX-XXXX'
          required
          error={formErrors.whatsapp}
        />
        <InputField
          data-cy='input-fornecedor-obs'
          label='Observações'
          type='text'
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder='Ex: Entregas às terças'
        />
        <button
          data-cy='btn-adicionar-fornecedor'
          type='submit'
          className='button-primary'
          disabled={isSaving}
        >
          {isSaving
            ? editing
              ? 'Atualizando...'
              : 'Adicionando...'
            : editing
              ? 'Atualizar'
              : 'Adicionar'}
        </button>
        {editing && (
          <button type='button' onClick={resetForm} className='button-link'>
            Cancelar Edição
          </button>
        )}
      </form>
      <div className='divider' />
      <div className='form-group'>
        <InputField
          label='Procurar fornecedor'
          type='text'
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder='Procurar fornecedor...'
          icon={IconeBusca}
        />
      </div>
      <div className='list-container'>
        {filtered.length > 0 ? (
          filtered.map((f) => (
            <div key={f.id} className='list-item'>
              <div className='list-item-info'>
                <p>
                  <strong>{f.nome}</strong>
                </p>
                <a
                  href={`https://wa.me/${f.whatsapp}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {formatarWhatsappParaExibicao(f.whatsapp)}
                </a>
                {f.observacoes && (
                  <p className='sub-text'>Obs: {f.observacoes}</p>
                )}
              </div>
              <div className='list-item-actions'>
                <button
                  className='button-icon'
                  onClick={() => handleEdit(f)}
                  aria-label={`Editar ${f.nome}`}
                >
                  <IconeEditar />
                </button>
                <button
                  className='button-icon danger'
                  onClick={() => handleDelete(f.id)}
                  aria-label={`Apagar ${f.nome}`}
                >
                  <IconeLixeira />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className='empty-state'>
            <IconeCaminhao />
            <h3>Nenhum Fornecedor Registrado</h3>
            <p className='sub-text'>
              Registre seu primeiro fornecedor no formulário acima.
            </p>
            <button className='button-primary' onClick={() => setActiveTab('insumos')}>
              Agora, registre um insumo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default GerenciarFornecedoresTab;
""")

# Content for src/features/cadastros/tabs/GerenciarInsumosTab.js (CORRIGIDO)
GERENCIAR_INSUMOS_TAB_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  checkIfDocumentExists,
} from '../../../services/firestoreService';
import {
  IconeCaixa,
  IconeBusca,
  IconeEditar,
  IconeLixeira,
  IconeCarrinho,
} from '../../../utils/icons';
import { formatarValorPreciso } from '../../../utils/formatters';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';
// import { useNavigate } from 'react-router-dom'; // Removido import não utilizado
// import { PATHS } from '../../../constants/paths'; // Removido import não utilizado

const GerenciarInsumosTab = ({ setActiveTab }) => {
  const { showConfirmationModal, showToast } = useUI();
  const { produtosDeCompra, fornecedores } = useData();
  const [insumoForm, setInsumoForm] = useState({
    id: null,
    nome: '',
    unidadeAnalise: 'kg',
  });
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [buscaInsumo, setBuscaInsumo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // const navigate = useNavigate(); // Removida variável não utilizada
  const nomeInsumoInputRef = useRef(null);

  useEffect(() => {
    if (editingInsumo && nomeInsumoInputRef.current) {
      nomeInsumoInputRef.current.focus();
    }
  }, [editingInsumo]);

  const filteredItensDeCompra = useMemo(() => {
    const products = Array.isArray(produtosDeCompra) ? produtosDeCompra : [];
    return products
      .filter((p) => p.nome.toLowerCase().includes(buscaInsumo.toLowerCase()))
      .map((p) => ({
        ...p,
        bestPriceFornecedorName: p.bestPriceFornecedorId
          ? fornecedores.find((f) => f.id === p.bestPriceFornecedorId)?.nome ||
            'N/A'
          : null,
      }));
  }, [produtosDeCompra, buscaInsumo, fornecedores]);

  const validateForm = async () => {
    const errors = {};
    if (!insumoForm.nome.trim()) {
      errors.nome = 'O nome do insumo é obrigatório.';
    } else {
      const exists = await checkIfDocumentExists(
        'produtosDeCompra',
        'nome',
        insumoForm.nome.trim(),
        editingInsumo,
      );
      if (exists) {
        errors.nome = 'Já existe um insumo com este nome.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveInsumo = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const isValid = await validateForm();
    if (!isValid) return;

    setIsSaving(true);
    try {
      if (editingInsumo) {
        await updateDocument('produtosDeCompra', editingInsumo, {
          nome: insumoForm.nome.trim(),
          unidadeAnalise: insumoForm.unidadeAnalise,
        });
        showToast('Insumo atualizado!');
      } else {
        await addDocument('produtosDeCompra', {
          nome: insumoForm.nome.trim(),
          unidadeAnalise: insumoForm.unidadeAnalise,
        });
        showToast('Insumo registrado!');
      }
      resetInsumoForm();
    } catch (error) {
      showToast('Erro ao salvar insumo: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInsumo = (id) => {
    showConfirmationModal(
      'Tem certeza que deseja apagar este insumo e todo o seu histórico de preços?',
      async () => {
        try {
          await deleteDocument('produtosDeCompra', id);
          showToast('Insumo apagado.');
        } catch (error) {
          showToast('Erro ao apagar: ' + error.message, 'error');
        }
      },
    );
  };

  const resetInsumoForm = () => {
    setInsumoForm({ id: null, nome: '', unidadeAnalise: 'kg' });
    setEditingInsumo(null);
    setFormErrors({});
  };

  const handleEdit = (insumo) => {
    setInsumoForm({
      id: insumo.id,
      nome: insumo.nome,
      unidadeAnalise: insumo.unidadeAnalise,
    });
    setEditingInsumo(insumo.id);
    setFormErrors({});
  };

  const handleRegisterPurchaseClick = (insumoId) => {
    setActiveTab('registrarCompra');
  };

  return (
    <div className='card'>
      <h3>
        <IconeCaixa /> Gerenciar Insumos
      </h3>
      <form onSubmit={handleSaveInsumo}>
        <InputField
          label='Nome do Insumo'
          type='text'
          value={insumoForm.nome}
          onChange={(e) => {
            setInsumoForm({ ...insumoForm, nome: e.target.value });
            setFormErrors((prev) => ({ ...prev, nome: '' }));
          }}
          placeholder='Ex: Farinha de Trigo'
          required
          error={formErrors.nome}
          ref={nomeInsumoInputRef}
        />
        <SelectField
          label='Unidade para Análise de Custo'
          value={insumoForm.unidadeAnalise}
          onChange={(e) =>
            setInsumoForm({ ...insumoForm, unidadeAnalise: e.target.value })
          }
          options={[
            { value: 'kg', label: 'Quilograma (kg)' },
            { value: 'L', label: 'Litro (L)' },
            { value: 'un', label: 'Unidade (un)' },
          ]}
          required
        />
        <button type='submit' className='button-primary' disabled={isSaving}>
          {isSaving
            ? editingInsumo
              ? 'Atualizando...'
              : 'Registrando...'
            : editingInsumo
              ? 'Atualizar Insumo'
              : 'Registrar Novo Insumo'}
        </button>
        {editingInsumo && (
          <button
            type='button'
            onClick={resetInsumoForm}
            className='button-link'
          >
            Cancelar Edição
          </button>
        )}
      </form>
      <div className='divider' />
      <div className='form-group'>
        <InputField
          label='Procurar insumo'
          type='text'
          value={buscaInsumo}
          onChange={(e) => setBuscaInsumo(e.target.value)}
          placeholder='Procurar insumo...'
          icon={IconeBusca}
        />
      </div>
      <div className='list-container'>
        {filteredItensDeCompra.length > 0 ? (
          filteredItensDeCompra.map((p) => (
            <div key={p.id} className='list-item'>
              <div className='list-item-info'>
                <p>
                  <strong>{p.nome}</strong> (Análise p/ {p.unidadeAnalise})
                </p>
                {p.bestPrice ? (
                  <p className='sub-text' style={{ color: 'var(--cor-sucesso)' }}>
                    Melhor Preço:{' '}
                    <strong>
                      {formatarValorPreciso(p.bestPrice)}/{p.unidadeAnalise}
                    </strong>{' '}
                    (Fornecedor: {p.bestPriceFornecedorName})
                  </p>
                ) : (
                  <p className='sub-text'>Nenhum custo registrado.</p>
                )}
              </div>
              <div className='list-item-actions'>
                <button
                  className='button-icon'
                  onClick={() => handleEdit(p)}
                  aria-label={`Editar ${p.nome}`}
                >
                  <IconeEditar />
                </button>
                <button
                  className='button-icon danger'
                  onClick={() => handleDeleteInsumo(p.id)}
                  aria-label={`Apagar item ${p.nome}`}
                >
                  <IconeLixeira />
                </button>
                <button
                  className='button-icon'
                  onClick={() => handleRegisterPurchaseClick(p.id)}
                  aria-label={`Registrar compra para ${p.nome}`}
                  title='Registrar Compra'
                >
                  <IconeCarrinho />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className='empty-state'>
            <IconeCaixa />
            <h3>Nenhum Insumo Registrado</h3>
            <p className='sub-text'>
              Registre seu primeiro insumo acima para poder registrar compras.
            </p>
            <button className='button-primary' onClick={() => setActiveTab('registrarCompra')}>
              Ir para Registrar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default GerenciarInsumosTab;
""")

# Content for src/features/cadastros/tabs/RegistrarCompraTab.js (CORRIGIDO)
REGISTRAR_COMPRA_TAB_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react'; // Removido import useEffect não utilizado
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import {
  // addDocumentToSubcollection, // Removido import não utilizado
  addDocument,
  addPurchaseTransaction,
} from '../../../services/firestoreService';
import { formatarValorPreciso } from '../../../utils/formatters';
import Modal from '../../../components/ui/Modal';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

const QuickAddFornecedorModal = ({ onClose, onFornecedorAdded }) => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useUI();

  const validateForm = () => {
    const errors = {};
    if (!nome.trim()) errors.nome = 'O nome é obrigatório.';
    if (!whatsapp.trim()) errors.whatsapp = 'O WhatsApp é obrigatório.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    const formattedNumber = whatsapp.replace(/\\D/g, '');
    try {
      const docRef = await addDocument('fornecedores', {
        nome,
        whatsapp: formattedNumber,
        observacoes: null,
      });
      showToast('Fornecedor salvo!');
      onFornecedorAdded(docRef.id);
      onClose();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title='Novo Fornecedor'
      onConfirm={handleSave}
      showCancel={true}
      onCancel={onClose}
      confirmText="Salvar"
    >
      <form onSubmit={handleSave}>
        <InputField
          label='Nome'
          type='text'
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setFormErrors((prev) => ({ ...prev, nome: '' }));
          }}
          placeholder='Nome da empresa'
          required
          error={formErrors.nome}
        />
        <InputField
          label='WhatsApp'
          type='text'
          value={whatsapp}
          onChange={(e) => {
            setWhatsapp(e.target.value);
            setFormErrors((prev) => ({ ...prev, whatsapp: '' }));
          }}
          placeholder='(XX) XXXXX-XXXX'
          required
          error={formErrors.whatsapp}
        />
        <button type='submit' className='button-primary' disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
};

const QuickAddInsumoModal = ({ onClose, onInsumoAdded }) => {
  const [nome, setNome] = useState('');
  const [unidadeAnalise, setUnidadeAnalise] = useState('kg');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useUI();

  const validateForm = () => {
    const errors = {};
    if (!nome.trim()) errors.nome = 'O nome do insumo é obrigatório.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      const docRef = await addDocument('produtosDeCompra', {
        nome,
        unidadeAnalise,
      });
      showToast('Insumo registrado!');
      onInsumoAdded(docRef.id);
      onClose();
    } catch (error) {
      showToast('Erro ao registrar insumo: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title='Novo Insumo'
      onConfirm={handleSave}
      showCancel={true}
      onCancel={onClose}
      confirmText="Salvar"
    >
      <form onSubmit={handleSave}>
        <InputField
          label='Nome do Insumo'
          type='text'
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setFormErrors((prev) => ({ ...prev, nome: '' }));
          }}
          placeholder='Ex: Farinha de Trigo'
          required
          error={formErrors.nome}
        />
        <SelectField
          label='Unidade para Análise de Custo'
          value={unidadeAnalise}
          onChange={(e) => setUnidadeAnalise(e.target.value)}
          options={[
            { value: 'kg', label: 'Quilograma (kg)' },
            { value: 'L', label: 'Litro (L)' },
            { value: 'un', label: 'Unidade (un)' },
          ]}
          required
        />
        <button type='submit' className='button-primary' disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
};

const RegistrarCompraTab = () => {
  const { showToast } = useUI();
  const { fornecedores, produtosDeCompra } = useData();
  const [purchaseForm, setPurchaseForm] = useState({
    insumoId: '',
    fornecedorId: '',
    dataCompra: new Date().toISOString().split('T')[0],
    quantidadeComprada: '',
    precoTotalNota: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showQuickAddFornecedor, setShowQuickAddFornecedor] = useState(false);
  const [showQuickAddInsumo, setShowQuickAddInsumo] = useState(false);

  const selectedInsumo = useMemo(
    () => produtosDeCompra.find((p) => p.id === purchaseForm.insumoId),
    [produtosDeCompra, purchaseForm.insumoId],
  );
  const lastPriceForSelectedInsumo = useMemo(() => {
    if (
      !selectedInsumo ||
      !selectedInsumo.historicoPrecos ||
      selectedInsumo.historicoPrecos.length === 0
    )
      return null;
    const latestPurchase = selectedInsumo.historicoPrecos
      .filter((rec) => rec.tipo === 'compra')
      .sort((a, b) => {
        const dateA = a.dataCompra.toDate
          ? a.dataCompra.toDate()
          : new Date(a.dataCompra.seconds * 1000);
        const dateB = b.dataCompra.toDate
          ? b.dataCompra.toDate()
          : new Date(b.dataCompra.seconds * 1000);
        return dateB - dateA;
      })[0];
    return latestPurchase;
  }, [selectedInsumo]);

  const resetPurchaseForm = () => {
    setPurchaseForm({
      insumoId: '',
      fornecedorId: '',
      dataCompra: new Date().toISOString().split('T')[0],
      quantidadeComprada: '',
      precoTotalNota: '',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!purchaseForm.insumoId) errors.insumoId = 'Selecione um insumo.';
    if (!purchaseForm.fornecedorId)
      errors.fornecedorId = 'Selecione um fornecedor.';
    if (
      isNaN(parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.'))) ||
      parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.')) <= 0
    )
      errors.quantidadeComprada = 'Quantidade inválida.';
    if (
      isNaN(parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.'))) ||
      parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.')) <= 0
    )
      errors.precoTotalNota = 'Preço total inválido.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    const { insumoId, fornecedorId, dataCompra, quantidadeComprada, precoTotalNota } =
      purchaseForm;
    const qtd = parseFloat(String(quantidadeComprada).replace(',', '.'));
    const precoTotal = parseFloat(String(precoTotalNota).replace(',', '.'));

    try {
      const precoPorUnidadeAnalise = precoTotal / qtd;
      const purchaseRecord = {
        tipo: 'compra',
        fornecedorId,
        dataCompra: new Date(dataCompra),
        precoTotalNota: precoTotal,
        quantidadeComprada: qtd,
        unidadeComprada: selectedInsumo.unidadeAnalise,
        precoPorUnidadeAnalise,
      };

      const expenseRecord = {
        valor: precoTotal,
        data: new Date(dataCompra),
        descricao: `Compra de ${selectedInsumo.nome}`,
        categoria: 'Insumos',
      };

      await addPurchaseTransaction(insumoId, purchaseRecord, expenseRecord);

      showToast(
        `Compra registrada para ${selectedInsumo.nome} e despesa no Fluxo de Caixa!`,
      );

      resetPurchaseForm();
    } catch (error) {
      showToast('Erro ao registrar compra: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='card'>
      <h3>Registrar Nova Compra</h3>
      <form onSubmit={handleSavePurchase}>
        <SelectField
          label='Insumo'
          name='insumoId'
          value={purchaseForm.insumoId}
          onChange={handlePurchaseFormChange}
          options={[
            { value: '', label: 'Selecione um insumo...', disabled: true },
            ...produtosDeCompra.map((p) => ({
              value: p.id,
              label: `${p.nome} (${p.unidadeAnalise})`,
            })),
          ]}
          required
          error={formErrors.insumoId}
        />
        <button
          type='button'
          className='button-link'
          onClick={() => setShowQuickAddInsumo(true)}
          style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}
        >
          + Novo Insumo
        </button>
        {selectedInsumo && lastPriceForSelectedInsumo && (
          <p className='sub-text' style={{ marginTop: '0.5rem', color: 'var(--cor-primaria-escura)' }}>
            Último preço pago:{' '}
            <strong>
              {formatarValorPreciso(lastPriceForSelectedInsumo.precoPorUnidadeAnalise)}/
              {selectedInsumo.unidadeAnalise}
            </strong>{' '}
            (Fornecedor:{' '}
            {fornecedores.find(
              (f) => f.id === lastPriceForSelectedInsumo.fornecedorId,
            )?.nome || 'N/A'}
            )
          </p>
        )}

        <SelectField
          label='Fornecedor'
          name='fornecedorId'
          value={purchaseForm.fornecedorId}
          onChange={handlePurchaseFormChange}
          options={[
            { value: '', label: 'Selecione um fornecedor...', disabled: true },
            ...fornecedores.map((f) => ({ value: f.id, label: f.nome })),
          ]}
          required
          error={formErrors.fornecedorId}
        />
        <button
          type='button'
          className='button-link'
          onClick={() => setShowQuickAddFornecedor(true)}
          style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}
        >
          + Novo Fornecedor
        </button>

        <InputField
          label='Data da Compra'
          name='dataCompra'
          type='date'
          value={purchaseForm.dataCompra}
          onChange={handlePurchaseFormChange}
          required
          error={formErrors.dataCompra}
        />

        <div className='form-group-inline'>
          <InputField
            label={`Quantidade Comprada (${selectedInsumo?.unidadeAnalise || 'un'})`}
            name='quantidadeComprada'
            type='text'
            value={purchaseForm.quantidadeComprada}
            onChange={handlePurchaseFormChange}
            placeholder={`Ex: 25`}
            required
            error={formErrors.quantidadeComprada}
          />
          <InputField
            label='Preço Total na Nota (R$)'
            name='precoTotalNota'
            type='text'
            value={purchaseForm.precoTotalNota}
            onChange={handlePurchaseFormChange}
            placeholder='Ex: 120.00'
            required
            error={formErrors.precoTotalNota}
          />
        </div>

        {purchaseForm.quantidadeComprada &&
          purchaseForm.precoTotalNota &&
          !isNaN(
            parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.')),
          ) &&
          !isNaN(parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.'))) && (
            <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '1rem' }}>
              Custo por {selectedInsumo?.unidadeAnalise || 'un'}:{' '}
              {formatarValorPreciso(
                parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.')) /
                  parseFloat(
                    String(purchaseForm.quantidadeComprada).replace(',', '.'),
                  ),
              )}
            </p>
          )}

        <button type='submit' className='button-primary' disabled={isSaving}>
          {isSaving ? 'Registrando...' : 'Registrar Compra'}
        </button>
        <button
          type='button'
          onClick={resetPurchaseForm}
          className='button-link'
        >
          Limpar Formulário
        </button>
      </form>

      {showQuickAddFornecedor && (
        <QuickAddFornecedorModal
          onClose={() => setShowQuickAddFornecedor(false)}
          onFornecedorAdded={(id) =>
            setPurchaseForm((prev) => ({ ...prev, fornecedorId: id }))
          }
        />
      )}
      {showQuickAddInsumo && (
        <QuickAddInsumoModal
          onClose={() => setShowQuickAddInsumo(false)}
          onInsumoAdded={(id) =>
            setPurchaseForm((prev) => ({ ...prev, insumoId: id }))
          }
        />
      )}
    </div>
  );
};

export default RegistrarCompraTab;
""")

# Content for src/features/cadastros/tabs/GerenciarPrecosInsumosTab.js
GERENCIAR_PRECOS_INSUMOS_TAB_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { addDocumentToSubcollection } from '../../../services/firestoreService';
import { IconeCaixa, IconeBusca, IconeMais } from '../../../utils/icons';
import { formatarValorPreciso, formatarData } from '../../../utils/formatters';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

const GerenciarPrecosInsumosTab = () => {
  const { showToast } = useUI();
  const { produtosDeCompra, fornecedores } = useData();
  const [formState, setFormState] = useState({
    insumoId: '',
    fornecedorId: '',
    dataOferta: new Date().toISOString().split('T')[0],
    precoPorUnidadeAnalise: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [buscaPreco, setBuscaPreco] = useState('');

  const filteredInsumos = useMemo(() => {
    return produtosDeCompra.filter((p) =>
      p.nome.toLowerCase().includes(buscaPreco.toLowerCase()),
    );
  }, [produtosDeCompra, buscaPreco]);

  const validateForm = () => {
    const errors = {};
    if (!formState.insumoId) errors.insumoId = 'Selecione um insumo.';
    if (!formState.fornecedorId)
      errors.fornecedorId = 'Selecione um fornecedor.';
    if (
      isNaN(parseFloat(String(formState.precoPorUnidadeAnalise).replace(',', '.'))) ||
      parseFloat(String(formState.precoPorUnidadeAnalise).replace(',', '.')) <= 0
    )
      errors.precoPorUnidadeAnalise = 'Preço inválido.';
    if (!formState.dataOferta)
      errors.dataOferta = 'Data da oferta é obrigatória.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSavePreco = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    const { insumoId, fornecedorId, dataOferta, precoPorUnidadeAnalise } =
      formState;
    const preco = parseFloat(String(precoPorUnidadeAnalise).replace(',', '.'));

    try {
      const offerRecord = {
        tipo: 'oferta',
        fornecedorId,
        dataOferta: new Date(dataOferta),
        precoPorUnidadeAnalise: preco,
      };
      await addDocumentToSubcollection(
        'produtosDeCompra',
        insumoId,
        'historicoPrecos',
        offerRecord,
      );
      showToast(
        `Preço de oferta registrado para ${produtosDeCompra.find((p) => p.id === insumoId)?.nome}!`,
      );
      resetForm();
    } catch (error) {
      showToast('Erro ao registrar preço de oferta: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormState({
      insumoId: '',
      fornecedorId: '',
      dataOferta: new Date().toISOString().split('T')[0],
      precoPorUnidadeAnalise: '',
    });
    setFormErrors({});
  };

  return (
    <div className='card'>
      <h3>
        <IconeMais /> Registrar Preço de Insumo (Oferta)
      </h3>
      <form onSubmit={handleSavePreco}>
        <SelectField
          label='Insumo'
          name='insumoId'
          value={formState.insumoId}
          onChange={handleFormChange}
          options={[
            { value: '', label: 'Selecione um insumo...', disabled: true },
            ...produtosDeCompra.map((p) => ({
              value: p.id,
              label: `${p.nome} (${p.unidadeAnalise})`,
            })),
          ]}
          required
          error={formErrors.insumoId}
        />
        <SelectField
          label='Fornecedor'
          name='fornecedorId'
          value={formState.fornecedorId}
          onChange={handleFormChange}
          options={[
            { value: '', label: 'Selecione um fornecedor...', disabled: true },
            ...fornecedores.map((f) => ({ value: f.id, label: f.nome })),
          ]}
          required
          error={formErrors.fornecedorId}
        />
        <InputField
          label='Data da Oferta'
          name='dataOferta'
          type='date'
          value={formState.dataOferta}
          onChange={handleFormChange}
          required
          error={formErrors.dataOferta}
        />
        <InputField
          label='Preço por Unidade de Análise (R$)'
          name='precoPorUnidadeAnalise'
          type='text'
          value={formState.precoPorUnidadeAnalise}
          onChange={(e) => handleFormChange(e)}
          placeholder='Ex: 2.50'
          required
          error={formErrors.precoPorUnidadeAnalise}
        />
        <button type='submit' className='button-primary' disabled={isSaving}>
          {isSaving ? 'Registrando...' : 'Registrar Preço'}
        </button>
        <button type='button' onClick={resetForm} className='button-link'>
          Limpar Formulário
        </button>
      </form>

      <div className='divider' />

      <h3>
        <IconeBusca /> Histórico de Preços de Insumos
      </h3>
      <div className='form-group'>
        <InputField
          label='Procurar Insumo no Histórico'
          type='text'
          value={buscaPreco}
          onChange={(e) => setBuscaPreco(e.target.value)}
          placeholder='Procurar insumo...'
          icon={IconeBusca}
        />
      </div>
      <div className='list-container'>
        {filteredInsumos.length > 0 ? (
          filteredInsumos.map((insumo) => (
            <div key={insumo.id} className='card' style={{ marginBottom: '1rem' }}>
              <h4>
                {insumo.nome} ({insumo.unidadeAnalise})
              </h4>
              {insumo.historicoPrecos && insumo.historicoPrecos.length > 0 ? (
                insumo.historicoPrecos.map((precoRec, idx) => (
                  <div key={idx} className='list-item'>
                    <div className='list-item-info'>
                      <p>
                        Fornecedor:{' '}
                        <strong>
                          {fornecedores.find(
                            (f) => f.id === precoRec.fornecedorId,
                          )?.nome || 'Desconhecido'}
                        </strong>
                      </p>
                      <p className='sub-text'>
                        Tipo:{' '}
                        {precoRec.tipo === 'compra' ? 'Compra' : 'Oferta'}
                      </p>
                      <p className='sub-text'>
                        Data:{' '}
                        {formatarData(precoRec.dataCompra || precoRec.dataOferta)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p>
                        <strong>
                          {formatarValorPreciso(
                            precoRec.precoPorUnidadeAnalise,
                          )}/
                          {insumo.unidadeAnalise}
                        </strong>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='empty-state' style={{ border: 'none', padding: '1rem', marginTop: '0.5rem' }}>
                  <p className='sub-text'>Nenhum preço registrado para este insumo.</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='empty-state'>
            <IconeCaixa />
            <h3>Nenhum Insumo com Preços Registrados</h3>
            <p className='sub-text'>
              Registre novos preços de oferta ou compras para ver o histórico
              aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciarPrecosInsumosTab;
""")

# Content for src/features/cmv/CmvView.js (CORRIGIDO)
CMV_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
import {
  IconeFichaTecnica,
  IconeEditar,
  IconeLixeira,
  IconeMais,
  IconeRemover,
} from '../../utils/icons';
import { formatarValor, formatarValorPreciso } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const GerenciarProdutosFinais = ({ isDisabled }) => {
  const { produtosDeCompra, produtos } = useData();
  const { showConfirmationModal, showToast } = useUI();
  const initialState = {
    nome: '',
    categoria: '',
    variantes: [
      { nomeVariante: 'Padrão', custoEmbalagem: '0', custoOperacional: '0', fichaTecnica: [] },
    ],
  };
  const [formState, setFormState] = useState(initialState);
  const [editing, setEditing] = useState(null);
  const [varianteAtiva, setVarianteAtiva] = useState(0);
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [qtdInsumo, setQtdInsumo] = useState('');
  const [margemLucroPercentual, setMargemLucroPercentual] = useState(100);
  const [margemLucroMonetaria, setMargemLucroMonetaria] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const selectedInsumo = useMemo(() => {
    return produtosDeCompra.find((p) => p.id === selectedInsumoId);
  }, [selectedInsumoId, produtosDeCompra]);

  const resetForm = () => {
    setEditing(null);
    setFormState(initialState);
    setVarianteAtiva(0);
    setFormErrors({});
    setMargemLucroPercentual(100);
    setMargemLucroMonetaria(0);
  };

  const validateForm = () => {
    const errors = {};
    if (!formState.nome.trim()) errors.nome = 'O nome do produto é obrigatório.';

    formState.variantes.forEach((variante, index) => {
      if (!variante.nomeVariante.trim()) {
        errors[`varianteNome${index}`] = 'O nome da variante é obrigatório.';
      }
      if (isNaN(parseFloat(String(variante.custoEmbalagem).replace(',', '.')))) {
        errors[`custoEmbalagem${index}`] = 'Custo de embalagem inválido.';
      }
      if (isNaN(parseFloat(String(variante.custoOperacional).replace(',', '.')))) {
        errors[`custoOperacional${index}`] = 'Outros custos inválidos.';
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      const produtoData = {
        ...formState,
        variantes: formState.variantes.map((v) => {
          const custoTotalItens = v.fichaTecnica.reduce(
            (acc, item) => acc + item.custo,
            0,
          );
          const custoEmbalagem = parseFloat(
            String(v.custoEmbalagem || '0').replace(',', '.'),
          );
          const custoOperacional = parseFloat(
            String(v.custoOperacional || '0').replace(',', '.'),
          );
          const cmvCalculado = custoTotalItens + custoEmbalagem + custoOperacional;
          return { ...v, cmvCalculado };
        }),
      };
      if (editing) {
        await updateDocument('produtosFinais', editing.id, produtoData);
        showToast('Produto atualizado!');
      } else {
        await addDocument('produtosFinais', produtoData);
        showToast('Produto salvo!');
      }
      resetForm();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = () => {
    const insumo = produtosDeCompra.find((p) => p.id === selectedInsumoId);
    const qtd = parseFloat(String(qtdInsumo).replace(',', '.'));
    if (!insumo || isNaN(qtd) || qtd <= 0 || !insumo.bestPrice) {
      showToast('Selecione um insumo com preço e quantidade válidos.', 'error');
      return;
    }

    let displayUnit = insumo.unidadeAnalise;
    let conversionFactor = 1;

    if (insumo.unidadeAnalise === 'kg') {
      displayUnit = 'g';
      conversionFactor = 1000;
    } else if (insumo.unidadeAnalise === 'L') {
      displayUnit = 'ml';
      conversionFactor = 1000;
    }
    const quantidadeEmUnidadeAnalise = qtd / conversionFactor;

    const novoItem = {
      itemDeCompraId: insumo.id,
      nome: insumo.nome,
      quantidade: qtd,
      unidade: displayUnit,
      custo: quantidadeEmUnidadeAnalise * insumo.bestPrice,
    };
    const novasVariantes = [...formState.variantes];
    novasVariantes[varianteAtiva].fichaTecnica.push(novoItem);
    setFormState({ ...formState, variantes: novasVariantes });
    setSelectedInsumoId('');
    setQtdInsumo('');
  };

  const handleRemoveItem = (index) => {
    const novasVariantes = [...formState.variantes];
    novasVariantes[varianteAtiva].fichaTecnica.splice(index, 1);
    setFormState({ ...formState, variantes: novasVariantes });
  };

  const handleEdit = (p) => {
    setEditing(p);
    setFormState(p);
    setVarianteAtiva(0);
    setFormErrors({});
  };
  const handleDelete = (id) =>
    showConfirmationModal('Apagar este produto?', async () => {
      try {
        await deleteDocument('produtosFinais', id);
        showToast('Produto apagado.');
      } catch (error) {
        showToast('Erro ao apagar: ' + error.message, 'error');
      }
    });

  // const handleVarianteFieldChange = (field, value) => { // Removida função não utilizada
  //   const novasVariantes = [...formState.variantes];
  //   novasVariantes[varianteAtiva][field] = value;
  //   setFormState({ ...formState, variantes: novasVariantes });
  //   setFormErrors((prev) => ({ ...prev, [`${field}${varianteAtiva}`]: '' }));
  // };

  const handleAddVariante = () => {
    setFormState((prev) => ({
      ...prev,
      variantes: [
        ...prev.variantes,
        {
          nomeVariante: `Nova Variante ${prev.variantes.length + 1}`,
          custoEmbalagem: '0',
          custoOperacional: '0',
          fichaTecnica: [],
        },
      ],
    }));
    setVarianteAtiva(formState.variantes.length);
  };

  const handleRemoveVariante = (index) => {
    if (formState.variantes.length === 1) {
      showToast('É necessário ter pelo menos uma variante.', 'error');
      return;
    }
    showConfirmationModal('Apagar esta variante?', () => {
      const novasVariantes = [...formState.variantes];
      novasVariantes.splice(index, 1);
      setFormState((prev) => ({ ...prev, variantes: novasVariantes }));
      setVarianteAtiva(0);
      showToast('Variante removida.');
    });
  };

  const currentCmv = useMemo(() => {
    if (!formState.variantes[varianteAtiva]) return 0;
    const v = formState.variantes[varianteAtiva];
    const custoItens = v.fichaTecnica.reduce((acc, item) => acc + item.custo, 0);
    const custoEmb = parseFloat(String(v.custoEmbalagem || '0').replace(',', '.'));
    const custoOp = parseFloat(String(v.custoOperacional || '0').replace(',', '.'));
    return custoItens + custoEmb + custoOp;
  }, [formState, varianteAtiva]);

  useEffect(() => {
    if (currentCmv > 0) {
      setMargemLucroMonetaria(currentCmv * (margemLucroPercentual / 100));
    } else {
      setMargemLucroMonetaria(0);
    }
  }, [margemLucroPercentual, currentCmv]);

  useEffect(() => {
    if (currentCmv > 0 && margemLucroMonetaria >= 0) {
      setMargemLucroPercentual((margemLucroMonetaria / currentCmv) * 100);
    } else if (currentCmv === 0 && margemLucroMonetaria > 0) {
      setMargemLucroPercentual(Infinity);
    } else {
      setMargemLucroPercentual(0);
    }
  }, [margemLucroMonetaria, currentCmv]);

  return (
    <div className={`card ${isDisabled ? 'disabled-card' : ''}`} data-cy='card-gerenciar-produtos-finais'>
      {isDisabled && (
        <div className='overlay-message'>
          <p>Registre insumos com preço em 'Catálogo' para criar fichas técnicas.</p>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className='form-group-inline'>
          <InputField
            label='Nome do Produto'
            type='text'
            value={formState.nome}
            onChange={(e) => {
              setFormState({ ...formState, nome: e.target.value });
              setFormErrors((prev) => ({ ...prev, nome: '' }));
            }}
            placeholder='Ex: Pizza'
            required
            error={formErrors.nome}
          />
          <InputField
            label='Categoria'
            type='text'
            value={formState.categoria}
            onChange={(e) =>
              setFormState({ ...formState, categoria: e.target.value })
            }
            placeholder='Ex: Pizzas Salgadas'
          />
        </div>

        <div className='variantes-tabs' style={{ marginTop: '1.5rem', borderBottom: 'none', paddingBottom: 0 }}>
          {formState.variantes.map((v, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type='button'
                className={varianteAtiva === index ? 'active' : ''}
                onClick={() => setVarianteAtiva(index)}
              >
                {v.nomeVariante}
              </button>
              {formState.variantes.length > 1 && (
                <button type='button' className='button-icon small danger' onClick={() => handleRemoveVariante(index)} aria-label='Remover Variante'>
                  <IconeRemover />
                </button>
              )}
            </div>
          ))}
          <button
            type='button'
            className='button-secondary'
            onClick={handleAddVariante}
          >
            <IconeMais /> Adicionar Variante
          </button>
        </div>

        <div className='variantes-manager'>
          <h4>
            Detalhes da Variante:{' '}
            {formState.variantes[varianteAtiva].nomeVariante}
          </h4>
          <div className='form-group-inline'>
            <SelectField
              label='Insumo'
              value={selectedInsumoId}
              onChange={(e) => setSelectedInsumoId(e.target.value)}
              options={[
                { value: '', label: 'Selecione...', disabled: true },
                ...produtosDeCompra
                  .filter((p) => p.bestPrice)
                  .map((p) => ({
                    value: p.id,
                    label: `${p.nome} - ${formatarValorPreciso(p.bestPrice)}/${p.unidadeAnalise}`,
                  })),
              ]}
              aria-label='Selecione um item de compra'
            />
            <InputField
              label={`Qtd (${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un') : 'un'})`}
              type='text'
              value={qtdInsumo}
              onChange={(e) => setQtdInsumo(e.target.value)}
              placeholder={`Ex: 150 ${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un') : ''}`}
              aria-label='Quantidade do item de compra'
            />
            <button
              type='button'
              onClick={handleAddItem}
              className='button-secondary'
              disabled={!selectedInsumoId || !qtdInsumo}
              aria-label='Adicionar item à ficha técnica'
            >
              +
            </button>
          </div>

          <div className='list-container' style={{ maxHeight: '150px', borderTop: 'none', marginTop: 0 }}>
            {formState.variantes[varianteAtiva].fichaTecnica.length > 0 ? (
              formState.variantes[varianteAtiva].fichaTecnica.map((item, i) => (
                <div key={i} className='list-item'>
                  <p>
                    {item.nome} - {item.quantidade} {item.unidade} ({formatarValor(item.custo)})
                  </p>
                  <button type='button' className='button-icon danger' onClick={() => handleRemoveItem(i)}>
                    <IconeLixeira />
                  </button>
                </div>
              ))
            ) : (
              <div className='empty-state' style={{ border: 'none', padding: '1rem', marginTop: '0.5rem' }}>
                <p className='sub-text'>
                  Adicione insumos à ficha técnica desta variante.
                </p>
              </div>
            )}
          </div>
          <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>
            CMV Total da Variante: {formatarValor(currentCmv)}
          </p>

          <div
            style={{
              backgroundColor: 'var(--cor-secundaria)',
              color: 'var(--cor-primaria)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '1.5rem',
            }}
          >
            <label htmlFor='margemLucroPercentual'>Margem de Lucro Desejada:</label>
            <input
              type='range'
              id='margemLucroPercentual'
              min='0'
              max='500'
              value={margemLucroPercentual}
              onChange={(e) => setMargemLucroPercentual(parseFloat(e.target.value))}
            />
            <span> {margemLucroPercentual.toFixed(0)}%</span>

            <InputField
              label='Margem de Lucro (R$)'
              type='number'
              value={margemLucroMonetaria.toFixed(2)}
              onChange={(e) => setMargemLucroMonetaria(parseFloat(e.target.value) || 0)}
              step='0.01'
              placeholder='0.00'
            />

            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              Preço de Venda Sugerido:
            </h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {formatarValor(currentCmv + margemLucroMonetaria)}
            </p>
          </div>
        </div>

        <button type='submit' className='button-primary' style={{ marginTop: '1rem' }} disabled={isSaving}>
          {isSaving
            ? editing
              ? 'Atualizando...'
              : 'Salvando...'
            : editing
              ? 'Atualizar Produto'
              : 'Salvar Novo Produto'}
        </button>
        {editing && (
          <button type='button' onClick={resetForm} className='button-link'>
            Cancelar
          </button>
        )}
      </form>

      <div className='divider' />
      <h3>
        <IconeFichaTecnica /> Produtos Finais Registrados
      </h3>
      <div className='list-container'>
        {produtos.length > 0 ? (
          produtos.map((p) => (
            <div key={p.id} className='card' style={{ marginBottom: '1rem' }}>
              <div className='list-item' style={{ paddingBottom: 0 }}>
                <h4 className='truncate-text'>
                  {p.nome} <span className='sub-text'>{p.categoria}</span>
                </h4>
                <div>
                  <button className='button-icon' onClick={() => handleEdit(p)}>
                    <IconeEditar />
                  </button>
                  <button className='button-icon danger' onClick={() => handleDelete(p.id)}>
                    <IconeLixeira />
                  </button>
                </div>
              </div>
              {p.variantes.map((v, i) => (
                <div key={i} className='list-item'>
                  <strong>{v.nomeVariante}</strong>
                  <div>
                    <p>
                      CMV: <strong>{formatarValor(v.cmvCalculado)}</strong>
                    </p>
                    <p className='sub-text'>
                      Preço Sugerido (Lucro 100%): {formatarValor(v.cmvCalculado * 2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className='empty-state'>
            <IconeFichaTecnica />
            <h3>Nenhum Produto Final Registrado</h3>
            <p className='sub-text'>Crie sua primeira ficha técnica acima.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CmvView = () => {
  const { produtosDeCompra } = useData();
  const isDisabled = !produtosDeCompra.some((item) => item.bestPrice);

  return (
    <div>
      <div className='card'>
        <h2>
          <IconeFichaTecnica /> Gerenciar Produtos Finais (Fichas Técnicas)
        </h2>
        <p>
          Crie e gerencie as receitas dos seus produtos vendidos. O sistema
          usará o <strong>melhor preço</strong> registrado de cada insumo para
          calcular o Custo de Mercadoria Vendida (CMV) de forma automática.
        </p>
      </div>
      <GerenciarProdutosFinais isDisabled={isDisabled} />
    </div>
  );
};

export default CmvView;
""")

# Content for src/features/fluxoDeCaixa/FluxoDeCaixaView.js
FLUXO_DE_CAIXA_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument, deleteDocument } from '../../services/firestoreService';
import {
  IconeDinheiro,
  IconeMais,
  IconeLixeira,
  IconeBusca,
  IconeCalendario, // eslint-disable-line no-unused-vars -- Usado como prop para InputField
  IconeGrafico,
} from '../../utils/icons';
import { formatarValor, formatarData } from '../../utils/formatters';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const FluxoDeCaixaView = () => {
  const { faturamentos, despesas, loadingData } = useData();
  const { showToast, showConfirmationModal } = useUI();

  const [activeTab, setActiveTab] = useState('lancamento');
  const [tipoLancamento, setTipoLancamento] = useState('faturamento');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');
  const [categoriaDespesa, setCategoriaDespesa] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const categoriasDespesa = [
    'Aluguel',
    'Salários',
    'Contas de Consumo',
    'Insumos',
    'Marketing',
    'Outros',
  ];

  const [relatorioSearchTerm, setRelatorioSearchTerm] = useState('');
  const [relatorioFilterDateStart, setRelatorioFilterDateStart] = useState('');
  const [relatorioFilterDateEnd, setRelatorioFilterDateEnd] = useState('');
  const [relatorioFilterPeriod, setRelatorioFilterPeriod] = useState('all');

  const applyDateFilter = (startDate, endDate) => {
    setRelatorioFilterDateStart(startDate);
    setRelatorioFilterDateEnd(endDate);
  };

  const handlePeriodChange = (e) => {
    const period = e.target.value;
    setRelatorioFilterPeriod(period);
    const today = new Date();
    let startDate = '';
    let endDate = '';

    switch (period) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'last7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        startDate = sevenDaysAgo.toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        break;
      case 'thismonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'thisyear':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      case 'all':
      default:
        startDate = '';
        endDate = '';
        break;
    }
    applyDateFilter(startDate, endDate);
  };

  const validateLancamentoForm = () => {
    const errors = {};
    if (
      isNaN(parseFloat(String(valor).replace(',', '.'))) ||
      parseFloat(String(valor).replace(',', '.')) <= 0
    )
      errors.valor = 'Valor inválido.';
    if (!data) errors.data = 'Data é obrigatória.';
    if (tipoLancamento === 'despesa' && !categoriaDespesa)
      errors.categoriaDespesa = 'Selecione uma categoria.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLancamento = async (e) => {
    e.preventDefault();
    if (!validateLancamentoForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    const valorNumerico = parseFloat(String(valor).replace(',', '.'));

    const lancamentoData = {
      valor: valorNumerico,
      data: new Date(data),
      descricao: descricao || null,
    };

    try {
      if (tipoLancamento === 'faturamento') {
        await addDocument('faturamento', lancamentoData);
        showToast('Faturamento registrado com sucesso!');
      } else {
        await addDocument('despesas', {
          ...lancamentoData,
          categoria: categoriaDespesa,
        });
        showToast('Despesa registrada com sucesso!');
      }
      resetForm();
    } catch (error) {
      showToast('Erro ao registrar lançamento: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setValor('');
    setData(new Date().toISOString().split('T')[0]);
    setDescricao('');
    setCategoriaDespesa('');
    setFormErrors({});
  };

  const handleDeleteLancamento = (collectionName, id) => {
    showConfirmationModal(
      'Tem certeza que deseja apagar este lançamento?',
      async () => {
        try {
          await deleteDocument(collectionName, id);
          showToast('Lançamento apagado.');
        } catch (error) {
          showToast('Erro ao apagar: ' + error.message, 'error');
        }
      },
    );
  };

  const combinedLancamentos = useMemo(() => {
    const all = [
      ...faturamentos.map((item) => ({ ...item, tipo: 'faturamento', categoria: 'Faturamento' })),
      ...despesas.map((item) => ({ ...item, tipo: 'despesa' })),
    ].sort((a, b) => {
      const dateA = a.data.toDate ? a.data.toDate() : new Date(a.data.seconds * 1000);
      const dateB = b.data.toDate ? b.data.toDate() : new Date(b.data.seconds * 1000);
      return dateB - dateA;
    });

    let filtered = all;

    if (relatorioSearchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.descricao?.toLowerCase().includes(relatorioSearchTerm.toLowerCase()) ||
          item.categoria?.toLowerCase().includes(relatorioSearchTerm.toLowerCase()),
      );
    }

    if (relatorioFilterDateStart) {
      const startDate = new Date(relatorioFilterDateStart);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((item) => {
        const itemDate = item.data.toDate ? item.data.toDate() : new Date(item.data.seconds * 1000);
        return itemDate >= startDate;
      });
    }

    if (relatorioFilterDateEnd) {
      const endDate = new Date(relatorioFilterDateEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const itemDate = item.data.toDate ? item.data.toDate() : new Date(item.data.seconds * 1000);
        return itemDate <= endDate;
      });
    }

    return filtered;
  }, [
    faturamentos,
    despesas,
    relatorioSearchTerm,
    relatorioFilterDateStart,
    relatorioFilterDateEnd,
  ]);

  const totalFaturamento = useMemo(
    () =>
      combinedLancamentos
        .filter((l) => l.tipo === 'faturamento')
        .reduce((sum, l) => sum + l.valor, 0),
    [combinedLancamentos],
  );
  const totalDespesas = useMemo(
    () =>
      combinedLancamentos
        .filter((l) => l.tipo === 'despesa')
        .reduce((sum, l) => sum + l.valor, 0),
    [combinedLancamentos],
  );
  const resultadoLiquido = totalFaturamento - totalDespesas;

  const getResultadoColor = (valor) => {
    if (valor > 0) return 'var(--cor-sucesso)';
    if (valor < 0) return 'var(--cor-perigo)';
    return 'var(--cor-texto)';
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Fluxo de Caixa', 14, 16);

    const tableColumn = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)'];
    const tableRows = [];

    combinedLancamentos.forEach((lancamento) => {
      const dataFormatada = formatarData(lancamento.data);
      const tipo = lancamento.tipo === 'faturamento' ? 'Faturamento' : 'Despesa';
      const categoria = lancamento.categoria || 'N/A';
      const descricao = lancamento.descricao || 'N/A';
      const valorFormatado = formatarValor(lancamento.valor);
      tableRows.push([dataFormatada, tipo, categoria, descricao, valorFormatado]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [0, 51, 160] },
      margin: { top: 15, left: 14, right: 14, bottom: 10 },
      didDrawPage: function (data) {
        let str = 'Página ' + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          str,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10,
        );
      },
    });

    let finalY = doc.autoTable.previous.finalY;
    doc.setFontSize(10);
    doc.text(
      `Total Faturamento: ${formatarValor(totalFaturamento)}`,
      14,
      finalY + 10,
    );
    doc.text(
      `Total Despesas: ${formatarValor(totalDespesas)}`,
      14,
      finalY + 17,
    );
    doc.text(
      `Resultado Líquido: ${formatarValor(resultadoLiquido)}`,
      14,
      finalY + 24,
    );
    doc.save('fluxo_de_caixa.pdf');
  };

  const csvHeaders = [
    { label: 'Data', key: 'data' },
    { label: 'Tipo', key: 'tipo' },
    { label: 'Categoria', key: 'categoria' },
    { label: 'Descrição', key: 'descricao' },
    { label: 'Valor', key: 'valor' },
  ];

  const csvData = combinedLancamentos.map((lancamento) => ({
    data: formatarData(lancamento.data),
    tipo: lancamento.tipo === 'faturamento' ? 'Faturamento' : 'Despesa',
    categoria: lancamento.categoria || '',
    descricao: lancamento.descricao || '',
    valor: lancamento.valor,
  }));

  if (loadingData)
    return (
      <div className='card'>
        <h3>Carregando Fluxo de Caixa...</h3>
      </div>
    );

  return (
    <div>
      <div className='card'>
        <h2>
          <IconeDinheiro /> Fluxo de Caixa
        </h2>
        <p>
          Controle suas entradas e saídas para ter uma visão clara da saúde
          financeira do seu negócio.
        </p>
      </div>

      <div className='variantes-tabs'>
        <button
          className={activeTab === 'lancamento' ? 'active' : ''}
          onClick={() => setActiveTab('lancamento')}
        >
          Lançar
        </button>
        <button
          className={activeTab === 'relatorio' ? 'active' : ''}
          onClick={() => setActiveTab('relatorio')}
        >
          Relatório
        </button>
      </div>

      {activeTab === 'lancamento' && (
        <div className='card'>
          <h3>
            <IconeMais /> Novo Lançamento
          </h3>
          <form onSubmit={handleSaveLancamento}>
            <div className='form-group-inline'>
              <SelectField
                label='Tipo de Lançamento'
                value={tipoLancamento}
                onChange={(e) => {
                  setTipoLancamento(e.target.value);
                  setFormErrors({});
                }}
                options={[
                  { value: 'faturamento', label: 'Faturamento' },
                  { value: 'despesa', label: 'Despesa' },
                ]}
              />
              <InputField
                label='Valor (R$)'
                type='text'
                value={valor}
                onChange={(e) => {
                  setValor(e.target.value);
                  setFormErrors((prev) => ({ ...prev, valor: '' }));
                }}
                placeholder='0.00'
                required
                error={formErrors.valor}
              />
            </div>
            <div className='form-group-inline'>
              <InputField
                label='Data'
                type='date'
                value={data}
                onChange={(e) => {
                  setData(e.target.value);
                  setFormErrors((prev) => ({ ...prev, data: '' }));
                }}
                required
                error={formErrors.data}
              />
              {tipoLancamento === 'despesa' && (
                <SelectField
                  label='Categoria da Despesa'
                  value={categoriaDespesa}
                  onChange={(e) => {
                    setCategoriaDespesa(e.target.value);
                    setFormErrors((prev) => ({
                      ...prev,
                      categoriaDespesa: '',
                    }));
                  }}
                  options={[
                    { value: '', label: 'Selecione...', disabled: true },
                    ...categoriasDespesa.map((cat) => ({ value: cat, label: cat })),
                  ]}
                  required
                  error={formErrors.categoriaDespesa}
                />
              )}
            </div>
            <InputField
              label='Descrição (Opcional)'
              type='textarea'
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder='Ex: Venda do dia, Aluguel do mês'
            />
            <button type='submit' className='button-primary' disabled={isSaving}>
              {isSaving ? 'Registrando...' : 'Registrar'}
            </button>
            <button type='button' onClick={resetForm} className='button-link'>
              Limpar
            </button>
          </form>
        </div>
      )}

      {activeTab === 'relatorio' && (
        <div className='card'>
          <h3>
            <IconeGrafico /> Relatório de Fluxo de Caixa
          </h3>
          <div className='form-group-inline'>
            <InputField
              label='Procurar'
              type='text'
              value={relatorioSearchTerm}
              onChange={(e) => setRelatorioSearchTerm(e.target.value)}
              placeholder='Procurar por descrição ou categoria...'
              icon={IconeBusca}
            />
            <SelectField
              label='Período'
              value={relatorioFilterPeriod}
              onChange={handlePeriodChange}
              options={[
                { value: 'all', label: 'Todo o Período' },
                { value: 'today', label: 'Hoje' },
                { value: 'last7days', label: 'Últimos 7 dias' },
                { value: 'thismonth', label: 'Este Mês' },
                { value: 'thisyear', label: 'Este Ano' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={generatePdf}
              className='button-secondary'
              disabled={combinedLancamentos.length === 0}
            >
              Exportar PDF
            </button>
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={'fluxo_de_caixa.csv'}
              className='button-secondary'
              disabled={combinedLancamentos.length === 0}
            >
              {combinedLancamentos.length === 0 ? (
                'Exportar CSV'
              ) : (
                <span style={{ color: 'var(--cor-primaria)' }}>Exportar CSV</span>
              )}
            </CSVLink>
          </div>

          <div className='list-container'>
            {combinedLancamentos.length > 0 ? (
              combinedLancamentos.map((lancamento) => (
                <div
                  key={lancamento.id}
                  className='list-item'
                  style={{
                    borderLeft: `5px solid ${lancamento.tipo === 'faturamento' ? 'var(--cor-sucesso)' : 'var(--cor-perigo)'}`,
                  }}
                >
                  <div className='list-item-info'>
                    <p>
                      <strong>
                        {lancamento.descricao ||
                          (lancamento.tipo === 'faturamento'
                            ? 'Faturamento'
                            : 'Despesa')}
                      </strong>
                    </p>
                    <p className='sub-text'>
                      {lancamento.tipo === 'despesa' && `Categoria: ${lancamento.categoria} | `}
                      Data: {formatarData(lancamento.data)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        color:
                          lancamento.tipo === 'faturamento'
                            ? 'var(--cor-sucesso)'
                            : 'var(--cor-perigo)',
                        fontWeight: 'bold',
                      }}
                    >
                      {formatarValor(lancamento.valor)}
                    </p>
                    <button
                      className='button-icon danger'
                      onClick={() =>
                        handleDeleteLancamento(
                          lancamento.tipo === 'faturamento'
                            ? 'faturamento'
                            : 'despesas',
                          lancamento.id,
                        )
                      }
                      aria-label='Apagar lançamento'
                    >
                      <IconeLixeira />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='empty-state'>
                <IconeDinheiro />
                <h3>Nenhum Lançamento Encontrado</h3>
                <p className='sub-text'>
                  Registre faturamentos e despesas na aba 'Lançar' para ver o
                  relatório.
                </p>
              </div>
            )}
          </div>
          <div className='divider' />
          <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <p>
              Total Faturamento:{' '}
              <span style={{ color: 'var(--cor-sucesso)' }}>
                {formatarValor(totalFaturamento)}
              </span>
            </p>
            <p>
              Total Despesas:{' '}
              <span style={{ color: 'var(--cor-perigo)' }}>
                {formatarValor(totalDespesas)}
              </span>
            </p>
            <p>
              Resultado Líquido:{' '}
              <span style={{ color: getResultadoColor(resultadoLiquido) }}>
                {formatarValor(resultadoLiquido)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default FluxoDeCaixaView;
""")

# Content for src/features/pedidos/PedidosView.js
PEDIDOS_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/Auth';
import { addDocument } from '../../services/firestoreService';
import { formatarWhatsappParaLink, formatarValorPreciso, formatarValor } from '../../utils/formatters';
import { IconeCarrinho, IconeLixeira, IconeBusca, IconeCaixa } from '../../utils/icons';
import ComparativePricesModal from '../../components/ComparativePricesModal/ComparativePricesModal';
import InputField from '../../components/ui/forms/InputField';

const PedidosView = () => {
    const { fornecedores, produtosDeCompra } = useData();
    const { showToast } = useUI();
    const { user } = useAuth();
    
    const [carrinho, setCarrinho] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemData, setItemData] = useState({ qtd: 1, observacao: '', fornecedorId: '' });
    const [showPricesModal, setShowPricesModal] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [itemFormErrors, setItemFormErrors] = useState({});

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return produtosDeCompra
            .filter((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((p) => ({
                ...p,
                bestPriceFornecedorName: p.bestPriceFornecedorId 
                    ? (fornecedores.find((f) => f.id === p.bestPriceFornecedorId)?.nome || 'N/A') 
                    : 'N/A',
            }));
    }, [produtosDeCompra, searchTerm, fornecedores]);
    
    const validateItemForm = () => {
        const errors = {};
        if (!itemData.fornecedorId) errors.fornecedorId = 'Selecione um fornecedor.';
        if (itemData.qtd <= 0) errors.qtd = 'Quantidade deve ser maior que zero.';
        setItemFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!validateItemForm()) return;
        if (isAddingToCart) return;

        setIsAddingToCart(true);

        const fornecedor = fornecedores.find((f) => f.id === itemData.fornecedorId);
        const itemOriginal = produtosDeCompra.find((p) => p.id === selectedItem.id);

        if (!selectedItem || !fornecedor || itemData.qtd <= 0 || !itemOriginal.bestPrice) {
            showToast('Erro: Item, fornecedor ou preço inválido.', 'error');
            setIsAddingToCart(false);
            return;
        }
        
        const novoCarrinho = { ...carrinho };
        if (!novoCarrinho[fornecedor.id]) {
            novoCarrinho[fornecedor.id] = [];
        }
        
        const custoUnitario = itemOriginal.bestPrice;
        const custoTotalItem = custoUnitario * Number(itemData.qtd);

        novoCarrinho[fornecedor.id].push({
            id: selectedItem.id,
            nome: selectedItem.nome,
            qtd: Number(itemData.qtd),
            observacao: itemData.observacao,
            unidade: selectedItem.unidadeAnalise,
            fornecedorItem: fornecedor.nome,
            precoUnitario: custoUnitario,
            custoTotal: custoTotalItem,
        });
        setCarrinho(novoCarrinho);
        resetItemSelection();
        showToast('Item adicionado ao carrinho!');
        setIsAddingToCart(false);
    };
    
    const handleSendOrder = async (fornecedorId) => {
        const fornecedor = fornecedores.find((f) => f.id === fornecedorId);
        const itens = carrinho[fornecedorId];
        if (!fornecedor || !itens || itens.length === 0) {
            showToast('Não há itens no pedido para este fornecedor.', 'error');
            return;
        }

        let mensagem = `Olá, *${fornecedor.nome}*!%0AGostaria de fazer o seguinte pedido:%0A%0A`;
        let valorTotalPedido = 0;
        itens.forEach((item) => {
            mensagem += `- ${item.qtd}x ${item.nome} (${item.unidade})`;
            if (item.observacao) {
                mensagem += ` (Obs: ${item.observacao})`;
            }
            mensagem += `%0A`;
            valorTotalPedido += item.custoTotal;
        });
        mensagem += `%0A*Valor Total Estimado: ${formatarValor(valorTotalPedido)}*`;

        window.open(
          `https://wa.me/${formatarWhatsappParaLink(fornecedor.whatsapp)}?text=${mensagem}`,
          '_blank',
        );
        
        try {
            await addDocument('pedidosRealizados', {
                fornecedorId,
                fornecedorNome: fornecedor.nome,
                itens,
                solicitanteEmail: user.email,
                status: 'enviado',
                valorTotal: valorTotalPedido,
                criadoEm: new Date(),
            });
            showToast('Pedido enviado e salvo no histórico!');
        } catch (error) {
            showToast('Erro ao salvar pedido no histórico: ' + error.message, 'error');
        }
        
        const novoCarrinho = { ...carrinho };
        delete novoCarrinho[fornecedorId];
        setCarrinho(novoCarrinho);
    };
    
    const handleProductClick = (product) => {
        setSelectedItem(product);
        setItemData((prev) => ({ ...prev, fornecedorId: product.bestPriceFornecedorId || '' }));
        setShowPricesModal(true);
        setSearchTerm('');
        setItemFormErrors({});
    };
    
    const handlePriceSelected = (priceRecord) => {
        setItemData((prev) => ({ ...prev, fornecedorId: priceRecord.fornecedorId }));
        setShowPricesModal(false);
    };
    
    const resetItemSelection = () => {
        setSelectedItem(null);
        setSearchTerm('');
        setItemData({ qtd: 1, observacao: '', fornecedorId: '' });
        setItemFormErrors({});
    };

    return (
        <div className='card'>
            <h2><IconeCarrinho /> Fazer um Pedido</h2>
            <div className='two-column-layout'>
                <div className='left-column'>
                    <div className='form-group'>
                        <InputField
                            id='product-search-input'
                            data-cy='search-input-pedidos'
                            label='Procurar Item de Compra'
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Digite para procurar (ex: Farinha, Queijo)...'
                            aria-label='Procurar item de compra no catálogo'
                            icon={IconeBusca}
                        />
                    </div>

                    {searchTerm && filteredProducts.length > 0 ? (
                        <div
                          className="list-container"
                          style={{
                            maxHeight: '400px',
                            border: '1px solid var(--cor-borda)',
                            borderRadius: '4px',
                            marginTop: '0.5rem',
                          }}
                        >
                            {filteredProducts.map((p) => (
                                <div
                                  key={p.id}
                                  className="list-item"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleProductClick(p)}
                                  data-cy='product-list-item'
                                  aria-label={`Selecionar item ${p.nome}`}
                                >
                                    <div className="list-item-info">
                                        <p>
                                            <strong className="truncate-text">{p.nome}</strong>
                                        </p>
                                        {p.bestPrice ? (
                                            <p className="sub-text" style={{ color: 'var(--cor-sucesso)' }}>
                                                Melhor Preço: {formatarValorPreciso(p.bestPrice)}/
                                                {p.unidadeAnalise} (Fornecedor: {p.bestPriceFornecedorName})
                                            </p>
                                        ) : (
                                            <p className='sub-text'>Sem preço registrado.</p>
                                        )}
                                    </div>
                                    <button
                                      type="button"
                                      className="button-primary small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductClick(p);
                                      }}
                                      aria-label={`Ver preços para ${p.nome}`}
                                    >
                                        Ver Preços
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm && filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <IconeBusca />
                            <h3>Nenhum Item Encontrado</h3>
                            <p className="sub-text">
                                Verifique o nome ou registre o insumo na aba 'Catálogo'.
                            </p>
                        </div>
                    ) : (
                        produtosDeCompra.length === 0 && (
                            <div className="empty-state">
                                <IconeCaixa />
                                <h3>Nenhum Insumo Registrado</h3>
                                <p className="sub-text">
                                    Registre seus insumos na aba 'Catálogo' para começar a fazer pedidos.
                                </p>
                            </div>
                        )
                    )}
                </div>

                <div className='right-column'>
                    {showPricesModal && selectedItem && (
                        <ComparativePricesModal
                            item={selectedItem}
                            onSelectPrice={handlePriceSelected}
                            onClose={() => setShowPricesModal(false)}
                        />
                    )}

                    {selectedItem && (
                        <form className='card' style={{ padding: '1rem', marginBottom: '1.5rem' }} onSubmit={handleAddItem}>
                            <h4 data-cy='selected-item-info'>Item Selecionado: {selectedItem.nome}</h4>
                            <p className='sub-text' data-cy='selected-item-supplier'>
                                Fornecedor escolhido:{' '}
                                <strong>
                                    {fornecedores.find((f) => f.id === itemData.fornecedorId)
                                        ?.nome || 'Nenhum selecionado'}
                                </strong>
                            </p>
                            
                            <div className='form-group-inline'>
                                <InputField
                                    id='item-qtd-input'
                                    data-cy='item-qtd-input'
                                    label='Quantidade'
                                    type='number'
                                    value={itemData.qtd}
                                    onChange={(e) => {
                                        setItemData({ ...itemData, qtd: e.target.value });
                                        setItemFormErrors((prev) => ({ ...prev, qtd: '' }));
                                    }}
                                    min='1'
                                    required
                                    error={itemFormErrors.qtd}
                                    aria-label='Quantidade do item de compra'
                                />
                                <InputField
                                    id='item-obs-input'
                                    label='Observação (Opcional)'
                                    type='text'
                                    value={itemData.observacao}
                                    onChange={(e) => setItemData({ ...itemData, observacao: e.target.value })}
                                    placeholder='Ex: Sem cebola'
                                    aria-label='Observação para o item'
                                />
                            </div>
                            <button type='button' onClick={() => setShowPricesModal(true)} className='button-secondary'>
                                Comparar Preços
                            </button>
                            <button type='submit' data-cy='add-to-cart-button' className='button-primary' style={{ marginLeft: '1rem' }} disabled={!itemData.fornecedorId || isAddingToCart}>
                                {isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                            </button>
                            <button type='button' onClick={resetItemSelection} className='button-link'>
                                Cancelar
                            </button>
                        </form>
                    )}

                    <h3>Itens no Carrinho</h3>
                    <div className='list-container' style={{ maxHeight: 'auto', border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
                        {Object.keys(carrinho).length > 0 ? (
                            Object.keys(carrinho).map((fornecedorId) => {
                                const fornecedor = fornecedores.find(
                                    (f) => f.id === fornecedorId,
                                );
                                return (
                                    <div key={fornecedorId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                                        <h4>
                                            Pedido para: {fornecedor?.nome || 'Fornecedor Desconhecido'}
                                        </h4>
                                        {carrinho[fornecedorId].map((item, index) => (
                                            <div key={index} className='list-item'>
                                                <span>
                                                    {item.qtd}x {item.nome}{' '}
                                                    {item.observacao && (
                                                        <em className='sub-text'>({item.observacao})</em>
                                                    )}
                                                </span>
                                                <button
                                                    className="button-icon danger"
                                                    onClick={() => {
                                                        const newCart = { ...carrinho };
                                                        newCart[fornecedorId].splice(index, 1);
                                                        if (newCart[fornecedorId].length === 0) {
                                                            delete newCart[fornecedorId];
                                                        }
                                                        setCarrinho(newCart);
                                                    }}
                                                    aria-label={`Remover ${item.nome} do carrinho`}
                                                >
                                                    <IconeLixeira />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            className="button-primary"
                                            onClick={() => handleSendOrder(fornecedorId)}
                                            style={{ marginTop: '1rem' }}
                                            aria-label={`Enviar pedido para ${fornecedor?.nome}`}
                                        >
                                            Enviar Pedido via WhatsApp
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className='empty-state' style={{ border: 'none' }}>
                                <IconeCarrinho />
                                <h3>Seu Carrinho Está Vazio</h3>
                                <p className='sub-text'>Selecione itens na lista ao lado para adicionar ao carrinho.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PedidosView;
""")

# Content for src/features/relatorios/RelatoriosView.js (CORRIGIDO)
RELATORIOS_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useTransition } from 'react';
import { IconeAnalises } from '../../utils/icons';
import AnaliseDeCustoInsumo from './AnaliseDeCustoInsumo';
import HistoricoView from './HistoricoView';
import HistoricoComprasFornecedorView from './HistoricoComprasFornecedorView';

const RelatoriosView = () => {
    const [activeTab, setActiveTab] = useState('analiseCusto');
    const [, startTransition] = useTransition(); // Removido isPending, pois não é usado na UI

    return (
        <div>
            <div className="card">
                <h2>
                    <IconeAnalises /> Análises e Histórico
                </h2>
                <p>
                    Analise os dados do seu negócio para tomar decisões mais inteligentes
                    e visualize históricos importantes.
                </p>
            </div>

            <div className="variantes-tabs">
                <button
                  className={activeTab === 'analiseCusto' ? 'active' : ''}
                  onClick={() => startTransition(() => setActiveTab('analiseCusto'))}
                >
                    Análise de Custo de Insumos
                </button>
                <button
                  className={activeTab === 'historicoPedidos' ? 'active' : ''}
                  onClick={() => startTransition(() => setActiveTab('historicoPedidos'))}
                >
                    Histórico de Pedidos
                </button>
                <button
                  className={activeTab === 'historicoComprasFornecedor' ? 'active' : ''}
                  onClick={() => startTransition(() => setActiveTab('historicoComprasFornecedor'))}
                >
                    Histórico de Compras por Fornecedor
                </button>
            </div>

            {activeTab === 'analiseCusto' && <AnaliseDeCustoInsumo />}
            {activeTab === 'historicoPedidos' && <HistoricoView />}
            {activeTab === 'historicoComprasFornecedor' && (
                <HistoricoComprasFornecedorView />
            )}
        </div>
    );
};
export default RelatoriosView;
""")

# Content for src/features/relatorios/AnaliseDeCustoInsumo.js
ANALISE_CUSTO_INSUMO_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SelectField from '../../components/ui/forms/SelectField';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const AnaliseDeCustoInsumo = () => {
  const { produtosDeCompra, fornecedores, loadingData } = useData();
  const [selectedItemId, setSelectedItemId] = useState('');

  const itemsWithHistory = useMemo(
    () => produtosDeCompra.filter((p) => p.historicoPrecos && p.historicoPrecos.length > 0),
    [produtosDeCompra],
  );

  const selectedItem = useMemo(
    () => itemsWithHistory.find((i) => i.id === selectedItemId),
    [itemsWithHistory, selectedItemId],
  );

  const chartData = useMemo(() => {
    if (!selectedItem) return null;

    const latestPrices = {};
    selectedItem.historicoPrecos.forEach((rec) => {
      const recordDate =
        rec.tipo === 'compra' ? rec.dataCompra : rec.dataOferta;
      const timestamp = recordDate.seconds
        ? recordDate.seconds
        : recordDate instanceof Date
          ? recordDate.getTime() / 1000
          : recordDate;

      if (
        !latestPrices[rec.fornecedorId] ||
        timestamp > latestPrices[rec.fornecedorId].timestamp
      ) {
        latestPrices[rec.fornecedorId] = { ...rec, timestamp: timestamp };
      }
    });
    const dataPoints = Object.values(latestPrices)
      .map((rec) => ({
        ...rec,
        fornecedorNome:
          fornecedores.find((f) => f.id === rec.fornecedorId)?.nome || 'N/A',
      }))
      .sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise);

    return {
      labels: dataPoints.map((d) => d.fornecedorNome),
      datasets: [
        {
          label: `Custo por ${selectedItem.unidadeAnalise}`,
          data: dataPoints.map((d) => d.precoPorUnidadeAnalise),
          backgroundColor: 'rgba(0, 51, 160, 0.6)',
        },
      ],
    };
  }, [selectedItem, fornecedores]);

  if (loadingData)
    return (
      <div className='card'>
        <h3>Carregando análise...</h3>
      </div>
    );

  return (
    <div className='card'>
      <h3>
        <IconeGrafico /> Análise Comparativa de Custos
      </h3>
      <SelectField
        label='Selecione um item para comparar preços entre fornecedores'
        id='item-select'
        value={selectedItemId}
        onChange={(e) => setSelectedItemId(e.target.value)}
        options={[
          { value: '', label: 'Escolha um item...', disabled: true },
          ...itemsWithHistory.map((item) => ({ value: item.id, label: item.nome })),
        ]}
      />
      {itemsWithHistory.length === 0 && (
        <div className='empty-state'>
          <IconeGrafico />
          <h3>Nenhum Item com Histórico de Preços</h3>
          <p className='sub-text'>
            Registre compras ou ofertas para seus insumos na aba 'Catálogo' para
            ver este gráfico.
          </p>
        </div>
      )}

      {selectedItem && chartData && (
        <div style={{ height: '300px', position: 'relative', marginTop: '2rem' }}>
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: `Comparativo para ${selectedItem.nome}` },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: `Preço por ${selectedItem.unidadeAnalise}`,
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};
export default AnaliseDeCustoInsumo;
""")

# Content for src/features/relatorios/HistoricoView.js
HISTORICO_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { deleteDocument } from '../../services/firestoreService';
import { formatarData, formatarValor } from '../../utils/formatters';
import { IconeCarrinho, IconeLixeira, IconeBusca, IconeCalendario } from '../../utils/icons';
import InputField from '../../components/ui/forms/InputField';

const HistoricoView = () => {
    const { allPedidos, loadingData } = useData();
    const { showConfirmationModal, showToast } = useUI();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');

    const filteredPedidos = useMemo(() => {
        let filtered = allPedidos;

        if (searchTerm) {
            filtered = filtered.filter(
              (pedido) =>
                pedido.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pedido.itens.some((item) =>
                  item.nome.toLowerCase().includes(searchTerm.toLowerCase()),
                ),
            );
        }
        
        if (filterDateStart) {
            const startDate = new Date(filterDateStart);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter((pedido) => {
                const pedidoDate = pedido.criadoEm.toDate ? pedido.criadoEm.toDate() : new Date(pedido.criadoEm.seconds * 1000);
                return pedidoDate >= startDate;
            });
        }

        if (filterDateEnd) {
            const endDate = new Date(filterDateEnd);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((pedido) => {
                const pedidoDate = pedido.criadoEm.toDate ? pedido.criadoEm.toDate() : new Date(pedido.criadoEm.seconds * 1000);
                return pedidoDate <= endDate;
            });
        }

        return filtered;
    }, [allPedidos, searchTerm, filterDateStart, filterDateEnd]);

    const handleDeletePedido = (id) => {
        showConfirmationModal(
          'Tem certeza que deseja apagar este pedido do histórico?',
          async () => {
            try {
              await deleteDocument('pedidosRealizados', id);
              showToast('Pedido apagado do histórico.');
            } catch (error) {
              showToast('Erro ao apagar: ' + error.message, 'error');
            }
          },
        );
    };

    if (loadingData && allPedidos.length === 0)
      return (
        <div className='card'>
          <h3>Carregando Histórico...</h3>
        </div>
      );

    return (
        <div className='card'>
            <h3><IconeCarrinho /> Histórico de Pedidos</h3>
            <div className='form-group-inline'>
                <InputField
                    label='Procurar'
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Procurar por fornecedor ou item...'
                    icon={IconeBusca}
                />
                <InputField
                    label='De:'
                    type='date'
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    icon={IconeCalendario}
                />
                <InputField
                    label='Até:'
                    type='date'
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    icon={IconeCalendario}
                />
            </div>
            <div className='list-container'>
                {filteredPedidos.length > 0 ? (
                    filteredPedidos.map((pedido) => (
                        <div key={pedido.id} className='list-item' style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <strong>{pedido.fornecedorNome}</strong>
                                <span className='sub-text'>{formatarData(pedido.criadoEm)}</span>
                            </div>
                            <ul style={{ paddingLeft: '1rem', margin: '0.5rem 0' }}>
                                {pedido.itens.map((item, idx) => (
                                    <li key={idx} className='sub-text'>
                                        {item.qtd}x {item.nome}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                                <span>Total: {formatarValor(pedido.valorTotal)}</span>
                                <button className='button-icon danger' onClick={() => handleDeletePedido(pedido.id)}><IconeLixeira /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <IconeCarrinho />
                        <h3>Nenhum Pedido no Histórico</h3>
                        <p className="sub-text">
                            Faça pedidos na aba 'Fazer um Pedido' para ver o histórico aqui.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default HistoricoView;
""")

# Content for src/features/relatorios/HistoricoComprasFornecedorView.js
HISTORICO_COMPRAS_FORNECEDOR_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeCaminhao, IconeBusca } from '../../utils/icons';
import { formatarData, formatarValor, formatarValorPreciso } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const HistoricoComprasFornecedorView = () => {
    const { produtosDeCompra, fornecedores, loadingData } = useData();
    const [selectedFornecedorId, setSelectedFornecedorId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredCompras = useMemo(() => {
        if (!selectedFornecedorId) return [];

        const comprasDoFornecedor = [];
        produtosDeCompra.forEach((insumo) => {
            insumo.historicoPrecos.forEach((compra) => {
                if (compra.fornecedorId === selectedFornecedorId) {
                    comprasDoFornecedor.push({
                        ...compra,
                        insumoNome: insumo.nome,
                        insumoUnidadeAnalise: insumo.unidadeAnalise,
                        id: `${insumo.id}-${compra.id || Math.random()}`,
                    });
                }
            });
        });

        let filtered = comprasDoFornecedor.sort((a, b) => {
            const dateA = a.dataCompra?.toDate ? a.dataCompra.toDate() : (a.dataCompra || a.dataOferta);
            const dateB = b.dataCompra?.toDate ? b.dataCompra.toDate() : (b.dataCompra || b.dataOferta);
            return dateB - dateA;
        });

        if (searchTerm) {
            filtered = filtered.filter((compra) =>
                compra.insumoNome.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }
        return filtered;
    }, [produtosDeCompra, selectedFornecedorId, searchTerm]);

    if (loadingData)
      return (
        <div className='card'>
          <h3>Carregando Histórico de Compras...</h3>
        </div>
      );

    return (
        <div className='card'>
            <h3><IconeCaminhao /> Histórico de Compras por Fornecedor</h3>
            <div className='form-group'>
                <SelectField
                    label='Selecione um Fornecedor'
                    value={selectedFornecedorId}
                    onChange={(e) => setSelectedFornecedorId(e.target.value)}
                    options={[
                        { value: '', label: 'Selecione...', disabled: true },
                        ...fornecedores.map((f) => ({ value: f.id, label: f.nome })),
                    ]}
                />
            </div>

            {selectedFornecedorId && (
                <>
                    <InputField
                        label='Procurar'
                        type='text'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder='Procurar insumo na compra...'
                        icon={IconeBusca}
                    />

                    <div className='list-container'>
                        {filteredCompras.length > 0 ? (
                            filteredCompras.map((compra) => (
                                <div key={compra.id} className='list-item'>
                                    <div className='list-item-info'>
                                        <p><strong>{compra.insumoNome}</strong></p>
                                        <p className='sub-text'>
                                            {compra.tipo === 'compra' ? 
                                                `Qtd: ${compra.quantidadeComprada} ${compra.unidadeComprada} | Preço Total: ${formatarValor(compra.precoTotalNota)} | ` :
                                                `Tipo: Oferta | `
                                            }
                                            Custo Unitário: {formatarValorPreciso(compra.precoPorUnidadeAnalise)}/{compra.insumoUnidadeAnalise}
                                        </p>
                                        <p className='sub-text'>Data: {formatarData(compra.dataCompra || compra.dataOferta)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <IconeBusca />
                                <h3>Nenhuma Compra/Oferta Registrada</h3>
                                <p className="sub-text">
                                    Nenhuma compra ou oferta encontrada para este fornecedor.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
export default HistoricoComprasFornecedorView;
""")

# Content for src/features/onboarding/OnboardingView.js
ONBOARDING_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useTransition } from 'react';
import { useAuth } from '../../context/Auth';
import { useData } from '../../context/DataContext';
import { IconeCaminhao, IconeCheck, IconeCirculo } from '../../utils/icons';

const OnboardingView = () => {
    const { user, updateOnboardingStatus } = useAuth();
    const { fornecedores, produtosDeCompra, produtos } = useData();
    const [isPending, startTransition] = useTransition();

    const checklist = [
        { text: 'Registrar seu primeiro fornecedor', isComplete: fornecedores.length > 0 },
        { text: 'Registrar um item de compra (insumo)', isComplete: produtosDeCompra.length > 0 },
        { text: 'Registrar uma compra para ter um custo', isComplete: produtosDeCompra.some((p) => p.bestPrice) },
        { text: 'Criar sua primeira Ficha Técnica', isComplete: produtos.length > 0 },
    ];
    const allComplete = checklist.every((item) => item.isComplete);

    return (
        <div className='login-container'>
            <div className='login-card card' style={{ maxWidth: '600px' }}>
                <h1>
                    <IconeCaminhao /> Primeiros Passos!
                </h1>
                <p>
                    Bem-vindo(a)! Complete os passos abaixo para configurar o sistema.
                </p>
                <div className='divider' />
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
                  onClick={() => startTransition(() => updateOnboardingStatus(user.uid, true))}
                  className="button-primary btn-full-width"
                  style={{ marginTop: '1rem' }}
                  disabled={!allComplete || isPending}
                >
                    {isPending ? 'Processando...' : (allComplete ? 'Vamos Começar!' : 'Complete os passos para continuar')}
                </button>
            </div>
        </div>
    );
};
export default OnboardingView;
""")

# Content for src/features/userManagement/UserManagementView.js (CORRIGIDO)
USER_MANAGEMENT_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useUI } from '../../context/UIContext';
import { IconeUsers } from '../../utils/icons';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';
// import { getAuth } from 'firebase/auth'; // Removido import não utilizado

function getFriendlyRegistrationError(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está sendo utilizado por outra conta.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Utilize pelo menos 6 caracteres.';
    default:
      return 'Ocorreu um erro desconhecido ao registrar o usuário.';
  }
}

const UserManagementView = () => {
  const { registerUser } = useAuth();
  const { showToast } = useUI();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('colaborador');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'O e-mail é obrigatório.';
    if (!password) errors.password = 'A senha é obrigatória.';
    if (password.length < 6)
      errors.password = 'A senha deve ter no mínimo 6 caracteres.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      await registerUser(email, password, role);
      showToast(`Usuário ${email} (${role}) criado com sucesso!`, 'success');

      setEmail('');
      setPassword('');
      setRole('colaborador');
      setFormErrors({});
    } catch (error) {
      showToast(getFriendlyRegistrationError(error.code), 'error');
    } finally {
      console.log('Sessão do gestor mantida.');
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className='card'>
        <h2>
          <IconeUsers /> Gestão de Usuários
        </h2>
        <p>
          Registre novos colaboradores ou gestores para o sistema. Eles poderão
          acessar utilizando o e-mail e a senha definidos aqui.
        </p>
      </div>
      <div className='card'>
        <h3>Registrar Novo Usuário</h3>
        <form onSubmit={handleRegister}>
          <InputField
            label='E-mail do Novo Usuário'
            type='email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors((p) => ({ ...p, email: '' }));
            }}
            placeholder='email@exemplo.com'
            required
            error={formErrors.email}
          />
          <InputField
            label='Senha Provisória'
            type='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder='Mínimo 6 caracteres'
            required
            error={formErrors.password}
          />
          <SelectField
            label='Perfil de Acesso'
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'colaborador', label: 'Colaborador (Acesso a Pedidos e Catálogo)' },
              { value: 'gestor', label: 'Gestor (Acesso a todas as áreas)' },
            ]}
            required
          />
          <button type='submit' className='button-primary' disabled={isSaving}>
            {isSaving ? 'Registrando...' : 'Registrar Usuário'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserManagementView;
""")

# Content for src/features/vendas/VendasView.js
VENDAS_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { deleteDocument } from '../../services/firestoreService';
import { IconeVendas, IconeLixeira, IconeBusca, IconeCalendario, IconeOlho } from '../../utils/icons';
import { formatarData, formatarValor } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SaleDetailModal from './SaleDetailModal';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const VendasView = () => {
    const { vendas, loadingData } = useData();
    const { showConfirmationModal, showToast } = useUI();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);

    const filteredVendas = useMemo(() => {
        let filtered = vendas;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter((venda) =>
                venda.id.toLowerCase().includes(lowerCaseSearchTerm) ||
                (venda.itensVendidos && venda.itensVendidos.some((item) => item.productName.toLowerCase().includes(lowerCaseSearchTerm))),
            );
        }
        
        if (filterDateStart) {
            const startDate = new Date(filterDateStart);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter((venda) => {
                const vendaDate = venda.dataVenda.toDate ? venda.dataVenda.toDate() : new Date(venda.dataVenda.seconds * 1000);
                return vendaDate >= startDate;
            });
        }

        if (filterDateEnd) {
            const endDate = new Date(filterDateEnd);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((venda) => {
                const vendaDate = venda.dataVenda.toDate ? venda.dataVenda.toDate() : new Date(venda.dataVenda.seconds * 1000);
                return vendaDate <= endDate;
            });
        }

        return filtered;
    }, [vendas, searchTerm, filterDateStart, filterDateEnd]);

    const handleDeleteVenda = (id) => {
        showConfirmationModal(
          'Tem certeza que deseja apagar esta venda do histórico?',
          async () => {
            try {
              await deleteDocument('vendas', id);
              showToast('Venda apagada do histórico.');
            } catch (error) {
              showToast('Erro ao apagar venda: ' + error.message, 'error');
            }
          },
        );
    };

    const generatePdf = () => {
        const doc = new jsPDF();
        doc.text('Relatório de Vendas', 14, 16);

        const tableColumn = ['ID da Venda', 'Data', 'Itens', 'Valor Total (R$)'];
        const tableRows = [];

        filteredVendas.forEach((venda) => {
            const dataFormatada = formatarData(venda.dataVenda);
            const valorFormatado = formatarValor(venda.valorTotal);
            const itens = venda.itensVendidos.map((item) => `${item.quantity}x ${item.productName}`).join(', ');
            tableRows.push([venda.id, dataFormatada, itens, valorFormatado]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        doc.save('relatorio_vendas.pdf');
    };

    const csvData = filteredVendas.map((venda) => ({
        id: venda.id,
        data: formatarData(venda.dataVenda),
        valorTotal: venda.valorTotal,
        itens: venda.itensVendidos.map((item) => `${item.quantity}x ${item.productName}`).join('; '),
    }));

    if (loadingData && vendas.length === 0)
      return (
        <div className='card'>
          <h3>Carregando Vendas...</h3>
        </div>
      );

    return (
        <div>
            {selectedSale && <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
            <div className='card'>
                <h2><IconeVendas /> Histórico de Vendas</h2>
                <p>Consulte todas as vendas registradas no sistema. Utilize os filtros para refinar sua pesquisa.</p>
            </div>
            <div className='card'>
                <h3>Filtros e Exportação</h3>
                <div className='form-group-inline'>
                    <InputField
                        label='Procurar'
                        type='text'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder='Procurar por ID ou item...'
                        icon={IconeBusca}
                    />
                    <InputField
                        label='De:'
                        type='date'
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        icon={IconeCalendario}
                    />
                    <InputField
                        label='Até:'
                        type='date'
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        icon={IconeCalendario}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={generatePdf} className='button-secondary' disabled={filteredVendas.length === 0}>
                        Exportar PDF
                    </button>
                    <CSVLink
                        data={csvData}
                        headers={[
                            { label: 'ID', key: 'id' },
                            { label: 'Data', key: 'data' },
                            { label: 'Valor Total', key: 'valorTotal' },
                            { label: 'Itens', key: 'itens' },
                        ]}
                        filename={'relatorio_vendas.csv'}
                        className='button-secondary'
                        target='_blank'
                    >
                        {filteredVendas.length === 0 ? (
                            'Exportar CSV'
                        ) : (
                            <span style={{ color: 'var(--cor-primaria)' }}>Exportar CSV</span>
                        )}
                    </CSVLink>
                </div>
            </div>
            <div className='list-container'>
                {filteredVendas.length > 0 ? (
                    filteredVendas.map((venda) => (
                        <div key={venda.id} className='list-item'>
                            <div className='list-item-info'>
                                <p>
                                    <strong>ID da Venda:</strong> {venda.id.substring(0, 8)}...
                                </p>
                                <p className='sub-text'>
                                    <strong>Data:</strong> {formatarData(venda.dataVenda)}
                                </p>
                                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                                    {venda.itensVendidos.map((item, idx) => (
                                        <li key={idx} className='sub-text'>
                                            {item.quantity}x {item.productName}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: 'var(--cor-sucesso)', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatarValor(venda.valorTotal)}</p>
                                <div>
                                    <button className='button-icon' onClick={() => setSelectedSale(venda)} aria-label='Ver Detalhes'>
                                        <IconeOlho />
                                    </button>
                                    <button className='button-icon danger' onClick={() => handleDeleteVenda(venda.id)} aria-label='Apagar Venda'>
                                        <IconeLixeira />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='empty-state'>
                        <IconeVendas />
                        <h3>Nenhuma Venda Encontrada</h3>
                        <p className='sub-text'>Não há vendas registradas que correspondam aos filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendasView;
""")

# Content for src/features/vendas/SaleDetailModal.js
SALE_DETAIL_MODAL_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import Modal from '../../components/ui/Modal';
import { formatarData, formatarValor } from '../../utils/formatters';
import { IconeVendas } from '../../utils/icons';

const SaleDetailModal = ({ sale, onClose }) => {
    
    const handlePrint = () => {
        const printContent = document.getElementById('sale-detail-printable');
        if (printContent) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write('<html><head><title>Detalhe da Venda</title>');
            printWindow.document.write(
              '<style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } h2, h3 { color: #0033a0; }</style>',
            );
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Modal title='Detalhes da Venda' onConfirm={onClose} confirmText='Fechar' showCancel={true} onCancel={handlePrint}>
            <div id='sale-detail-printable'>
                <h2><IconeVendas /> Detalhes da Venda</h2>
                <p><strong>ID da Venda:</strong> {sale.id}</p>
                <p><strong>Data:</strong> {formatarData(sale.dataVenda)}</p>
                <h3 style={{ marginTop: '1.5rem' }}>Itens Vendidos</h3>
                <table
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    borderCollapse: 'collapse',
                  }}
                >
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                Produto
                            </th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>
                                Qtd.
                            </th>
                            <th
                              style={{
                                borderBottom: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'right',
                              }}
                            >
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    {sale.itensVendidos.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '8px' }}>{item.productName} ({item.variantName})</td>
                            <td style={{ padding: '8px' }}>{item.quantity}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>{formatarValor(item.totalItemPrice)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <h3 style={{ textAlign: 'right', marginTop: '1.5rem' }}>Total da Venda: {formatarValor(sale.valorTotal)}</h3>
            </div>
        </Modal>
    );
};

export default SaleDetailModal;
""")

# Content for src/components/ComparativePricesModal/ComparativePricesModal.js
COMPARATIVE_PRICES_MODAL_JS_CONTENT = textwrap.dedent("""
import React, { useMemo } from 'react';
import Modal from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { formatarValorPreciso, formatarData } from '../../utils/formatters';
import { IconeBusca } from '../../utils/icons';

const ComparativePricesModal = ({ item, onSelectPrice, onClose }) => {
  const { fornecedores } = useData();

  const pricesBySupplier = useMemo(() => {
    if (!item?.historicoPrecos) return [];
    const latestPrices = {};
    item.historicoPrecos.forEach((rec) => {
      const recordDate =
        rec.tipo === 'compra' ? rec.dataCompra : rec.dataOferta;
      const timestamp = recordDate.seconds
        ? recordDate.seconds
        : recordDate instanceof Date
          ? recordDate.getTime() / 1000
          : recordDate;

      if (
        !latestPrices[rec.fornecedorId] ||
        timestamp > latestPrices[rec.fornecedorId].timestamp
      ) {
        latestPrices[rec.fornecedorId] = { ...rec, timestamp: timestamp };
      }
    });
    return Object.values(latestPrices)
      .map((rec) => ({
        ...rec,
        fornecedorNome:
          fornecedores.find((f) => f.id === rec.fornecedorId)?.nome || 'N/A',
      }))
      .sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise);
  }, [item, fornecedores]);

  return (
    <Modal title={`Preços para: "${item.nome}"`} onConfirm={onClose} confirmText="Fechar">
      <div className='list-container' style={{ maxHeight: '300px' }}>
        {pricesBySupplier.length > 0 ? (
          pricesBySupplier.map((price) => (
            <div key={price.id} className='list-item'>
              <div>
                <p>
                  <strong>{price.fornecedorNome}</strong>
                </p>
                <p className='sub-text'>
                  Última {price.tipo === 'compra' ? 'compra' : 'oferta'}:{' '}
                  {formatarData(price.dataCompra || price.dataOferta)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>
                  <strong>
                    {formatarValorPreciso(price.precoPorUnidadeAnalise)}/
                    {item.unidadeAnalise}
                  </strong>
                </p>
                <button
                  type='button'
                  className='button-primary'
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => onSelectPrice(price)}
                >
                  Selecionar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className='empty-state' style={{ border: 'none' }}>
            <IconeBusca />
            <h3>Nenhum Histórico de Preços</h3>
            <p className='sub-text'>
              Registre compras ou ofertas para este insumo na aba 'Catálogo' para
              comparar preços.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default ComparativePricesModal;
""")

# Content for src/services/firestoreService.js
FIRESTORE_SERVICE_JS_CONTENT = textwrap.dedent("""
import { db } from '../firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  query,
  where,
  getDocs,
  runTransaction,
} from 'firebase/firestore';

export const addDocument = (collectionName, data) =>
  addDoc(collection(db, collectionName), {
    ...data,
    criadoEm: serverTimestamp(),
  });
export const updateDocument = (collectionName, docId, data) =>
  updateDoc(doc(db, collectionName, docId), {
    ...data,
    atualizadoEm: serverTimestamp(),
  });
export const deleteDocument = (collectionName, docId) =>
  deleteDoc(doc(db, collectionName, docId));
export const setDocument = (collectionName, docId, data) =>
  setDoc(
    doc(db, collectionName, docId),
    { ...data, atualizadoEm: serverTimestamp() },
    { merge: true },
  );
export const addDocumentToSubcollection = (parent, parentId, sub, data) =>
  addDoc(collection(db, parent, parentId, sub), {
    ...data,
    criadoEm: serverTimestamp(),
  });

export const checkIfDocumentExists = async (collectionName, field, value, excludeId = null) => {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const querySnapshot = await getDocs(q);
  let exists = false;
  querySnapshot.forEach((doc) => {
    if (doc.id !== excludeId) {
      exists = true;
    }
  });
  return exists;
};

export const addPurchaseTransaction = async (insumoId, purchaseRecord, expenseRecord) => {
  const insumoRef = doc(db, 'produtosDeCompra', insumoId);
  const historicoRef = collection(insumoRef, 'historicoPrecos');
  const despesasRef = collection(db, 'despesas');

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(doc(historicoRef), {
        ...purchaseRecord,
        criadoEm: serverTimestamp(),
      });

      transaction.set(doc(despesasRef), {
        ...expenseRecord,
        criadoEm: serverTimestamp(),
      });
    });
    console.log('Transação de compra e despesa concluída com sucesso!');
  } catch (e) {
    console.error('Erro na transação de compra e despesa: ', e);
    throw new Error('Falha na transação de compra e despesa: ' + e.message);
  }
};
""")

# Content for src/utils/icons.js
ICONS_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import {
  Truck,
  ShoppingCart,
  Trash2,
  Pencil,
  LogOut,
  Search,
  LayoutDashboard,
  FileText,
  Settings,
  DollarSign,
  Calendar,
  Box,
  Menu,
  X,
  BarChart,
  CheckCircle,
  Circle,
  Plus,
  Minus,
  BookOpen,
  Users,
  Store,
  Eye,
} from 'lucide-react';

const Icon = ({ children, ...props }) => (
  <span className='icon' {...props}>
    {children}
  </span>
);

export const IconeCaminhao = (props) => (
  <Icon {...props}>
    <Truck size={24} />
  </Icon>
);
export const IconeCarrinho = (props) => (
  <Icon {...props}>
    <ShoppingCart size={24} />
  </Icon>
);
export const IconeLixeira = (props) => (
  <Icon {...props}>
    <Trash2 size={24} />
  </Icon>
);
export const IconeEditar = (props) => (
  <Icon {...props}>
    <Pencil size={24} />
  </Icon>
);
export const IconeLogout = (props) => (
  <Icon {...props}>
    <LogOut size={24} />
  </Icon>
);
export const IconeBusca = (props) => (
  <Icon {...props}>
    <Search size={24} />
  </Icon>
);
export const IconeCatalogo = (props) => (
  <Icon {...props}>
    <BookOpen size={24} />
  </Icon>
);
export const IconeDashboard = (props) => (
  <Icon {...props}>
    <LayoutDashboard size={24} />
  </Icon>
);
export const IconeFichaTecnica = (props) => (
  <Icon {...props}>
    <FileText size={24} />
  </Icon>
);
export const IconeConfiguracoes = (props) => (
  <Icon {...props}>
    <Settings size={24} />
  </Icon>
);
export const IconeCheck = (props) => (
  <Icon {...props}>
    <CheckCircle size={24} />
  </Icon>
);
export const IconeCirculo = (props) => (
  <Icon {...props}>
    <Circle size={24} />
  </Icon>
);
export const IconeMais = (props) => (
  <Icon {...props}>
    <Plus size={24} />
  </Icon>
);
export const IconeRemover = (props) => (
  <Icon {...props}>
    <Minus size={24} />
  </Icon>
);
export const IconeAnalises = (props) => (
  <Icon {...props}>
    <BarChart size={24} />
  </Icon>
);
export const IconeGrafico = (props) => (
  <Icon {...props}>
    <BarChart size={24} />
  </Icon>
);
export const IconeDinheiro = (props) => (
  <Icon {...props}>
    <DollarSign size={24} />
  </Icon>
);
export const IconeCalendario = (props) => (
  <Icon {...props}>
    <Calendar size={24} />
  </Icon>
);
export const IconeCaixa = (props) => (
  <Icon {...props}>
    <Box size={24} />
  </Icon>
);
export const IconeMenu = (props) => (
  <Icon {...props}>
    <Menu size={24} />
  </Icon>
);
export const IconeFechar = (props) => (
  <Icon {...props}>
    <X size={24} />
  </Icon>
);
export const IconeUsers = (props) => (
  <Icon {...props}>
    <Users size={24} />
  </Icon>
);
export const IconeVendas = (props) => (
  <Icon {...props}>
    <Store size={24} />
  </Icon>
);
export const IconeOlho = (props) => (
  <Icon {...props}>
    <Eye size={24} />
  </Icon>
);
""")

# Content for src/utils/formatters.js
FORMATTERS_JS_CONTENT = textwrap.dedent("""
export const formatarWhatsappParaLink = (numeroInput) => {
  let digitos = (numeroInput || '').replace(/\\D/g, '');
  if (!digitos) return '';
  if (digitos.length >= 12 && digitos.startsWith('55')) return digitos;
  if (digitos.length === 11 && digitos.startsWith('9', 2)) return `55${digitos}`;
  if (digitos.length === 10) return `55${digitos}`;
  return `55${digitos}`;
};
export const formatarWhatsappParaExibicao = (numeroSalvo) => {
  const digitos = String(numeroSalvo || '').replace(/\\D/g, '');
  const num = digitos.startsWith('55') ? digitos.substring(2) : digitos;
  if (num.length === 11)
    return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
  if (num.length === 10)
    return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
  return numeroSalvo;
};
export const formatarValor = (valor) =>
  typeof valor === 'number' ? `R$ ${valor.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
export const formatarValorPreciso = (valor) =>
  typeof valor === 'number' ? `R$ ${valor.toFixed(5).replace('.', ',')}` : 'N/A';
export const formatarData = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('pt-BR');
};
""")

# --- ESTRUTURA DO PROJETO ---

PROJECT_STRUCTURE = {
    "sistema-gestao-final": {
        "package.json": PACKAGE_JSON_CONTENT,
        ".gitignore": GITIGNORE_CONTENT,
        "README.md": README_MD_CONTENT,
        "postcss.config.js": POSTCSS_CONFIG_JS_CONTENT,
        "tailwind.config.js": TAILWIND_CONFIG_JS_CONTENT,
        ".env.local": ENV_LOCAL_CONTENT,
        "firestore.rules": FIRESTORE_RULES_CONTENT,
        "public": {
            "index.html": INDEX_HTML_CONTENT,
            "favicon.ico": "", # Placeholder, you might want to add a real one
            "logo192.png": "", # Placeholder
            "logo512.png": "", # Placeholder
            "manifest.json": '{"short_name":"GestãoPRO","name":"Sistema de Gestão PRO","start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}',
        },
        "src": {
            "App.css": APP_CSS_CONTENT,
            "App.js": APP_JS_CONTENT,
            "firebase.js": FIRESTORE_JS_CONTENT,
            "index.css": INDEX_CSS_CONTENT,
            "index.js": INDEX_JS_CONTENT,
            "components": {
                "auth": { "AccessSelectionPage.js": ACCESS_SELECTION_PAGE_JS_CONTENT },
                "ui": {
                    "Modal.js": MODAL_JS_CONTENT,
                    "LoadingScreen.js": LOADING_SCREEN_JS_CONTENT,
                    "forms": {
                        "InputField.js": INPUT_FIELD_JS_CONTENT,
                        "SelectField.js": SELECT_FIELD_JS_CONTENT,
                    }
                },
                "layout": { "MainLayout.js": MAIN_LAYOUT_JS_CONTENT },
                "ComparativePricesModal": { "ComparativePricesModal.js": COMPARATIVE_PRICES_MODAL_JS_CONTENT }
            },
            "context": {
                "Auth.js": AUTH_CONTEXT_JS_CONTENT,
                "DataContext.js": DATA_CONTEXT_JS_CONTENT,
                "UIContext.js": UI_CONTEXT_JS_CONTENT,
            },
            "features": {
                "dashboard": { "DashboardView.js": DASHBOARD_VIEW_JS_CONTENT },
                "cadastros": {
                    "CatalogoView.js": CADASTROS_VIEW_JS_CONTENT,
                    "tabs": {
                        "GerenciarFornecedoresTab.js": GERENCIAR_FORNECEDORES_TAB_JS_CONTENT,
                        "GerenciarInsumosTab.js": GERENCIAR_INSUMOS_TAB_JS_CONTENT,
                        "RegistrarCompraTab.js": REGISTRAR_COMPRA_TAB_JS_CONTENT,
                        "GerenciarPrecosInsumosTab.js": GERENCIAR_PRECOS_INSUMOS_TAB_JS_CONTENT,
                    }
                },
                "cmv": { "CmvView.js": CMV_VIEW_JS_CONTENT },
                "fluxoDeCaixa": { "FluxoDeCaixaView.js": FLUXO_DE_CAIXA_VIEW_JS_CONTENT },
                "pedidos": { "PedidosView.js": PEDIDOS_VIEW_JS_CONTENT },
                "vendas": {
                    "VendasView.js": VENDAS_VIEW_JS_CONTENT,
                    "SaleDetailModal.js": SALE_DETAIL_MODAL_JS_CONTENT
                },
                "relatorios": {
                    "RelatoriosView.js": RELATORIOS_VIEW_JS_CONTENT,
                    "AnaliseDeCustoInsumo.js": ANALISE_CUSTO_INSUMO_JS_CONTENT,
                    "HistoricoView.js": HISTORICO_VIEW_JS_CONTENT,
                    "HistoricoComprasFornecedorView.js": HISTORICO_COMPRAS_FORNECEDOR_VIEW_JS_CONTENT
                },
                "onboarding": { "OnboardingView.js": ONBOARDING_VIEW_JS_CONTENT },
                "userManagement": { "UserManagementView.js": USER_MANAGEMENT_VIEW_JS_CONTENT },
            },
            "services": { "firestoreService.js": FIRESTORE_SERVICE_JS_CONTENT },
            "utils": {
                "formatters.js": FORMATTERS_JS_CONTENT,
                "icons.js": ICONS_JS_CONTENT,
            },
            "AppRoutes.js": APP_ROUTES_JS_CONTENT,
            "constants": {
                "roles.js": ROLES_JS_CONTENT,
                "paths.js": PATHS_JS_CONTENT,
            }
        }
    }
}


def create_project_structure(base_path, structure):
    """
    Cria recursivamente diretórios e arquivos com base na estrutura de dicionário fornecida.
    """
    for name, content in structure.items():
        current_path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(current_path, exist_ok=True)
            create_project_structure(current_path, content)
        else:
            try:
                with open(current_path, 'w', encoding='utf-8') as f:
                    f.write(content.strip())
            except Exception as e:
                print(f"Erro ao escrever o arquivo {current_path}: {e}")


def main():
    """
    Função principal para iniciar a criação da estrutura do projeto.
    """
    print("Iniciando a criação da estrutura completa do projeto...")
    
    create_project_structure('.', PROJECT_STRUCTURE)
    
    print("\n" + "="*60)
    print("✅ ESTRUTURA DO PROJETO E ARQUIVOS CRIADOS COM SUCESSO!")
    print("="*60)
    
    print("\n### GUIA DE IMPLANTAÇÃO ###")
    
    print("\n--- PASSO 1: CONFIGURAR E EXECUTAR O PROJETO ---")
    print("1. Navegue até a pasta do projeto React:")
    print("    cd sistema-gestao-final")
    print("\n2. Instale as dependências (requer Node.js e npm):")
    print("    npm install")
    print("\n3. Inicie o servidor de desenvolvimento:")
    print("    npm start")
    print("    (A aplicação estará disponível em http://localhost:3000)")
    
    print("\n--- PASSO 2: PRIMEIRO ACESSO E GESTÃO DE USUÁRIOS ---")
    print("1. No painel de 'Authentication' do seu projeto Firebase, crie manualmente seu primeiro usuário (será o gestor principal).")
    print("2. No banco de dados 'Firestore', crie uma coleção chamada 'users'.")
    print("3. Dentro de 'users', crie um documento com o mesmo UID do usuário que você criou no passo 1.")
    print("4. Dentro desse documento, adicione um campo 'role' (string) com o valor 'gestor'.")
    print("5. Agora, acesse a aplicação (http://localhost:3000) com as credenciais do gestor que você criou.")
    print("6. No menu lateral, a opção 'Gestão de Usuários' estará visível. Utilize-a para registrar novos colaboradores e gestores.")

    print("\n" + "="*60)
    print("✨ Seu sistema está pronto para ser utilizado! ✨")
    print("="*60)


if __name__ == "__main__":
    main()
