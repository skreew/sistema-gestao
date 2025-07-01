import os
import textwrap

# --- CONTEÚDO DOS ARQUIVOS DO PROJETO ---

# Conteúdo para package.json (do projeto React)
PACKAGE_JSON_CONTENT = textwrap.dedent("""
{
  "name": "sistema-gestao-final",
  "version": "2.0.0",
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
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "cypress": "^12.0.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "jest": "^27.5.1",
    "tailwindcss": "^3.4.4",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19",
    "@tailwindcss/postcss": "^4.0.0",
    "lucide-react": "^0.395.0"
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

# Conteúdo para src/App.css (NOVO CSS)
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
  overflow: hidden; /* Evita scroll indesejado no layout principal */
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
  z-index: 50; /* Abaixo do modal */
}

.main-nav {
  grid-area: sidebar;
  background-color: #fff;
  padding: 1rem;
  border-right: 1px solid var(--cor-borda);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto; /* Permite scroll na navegação se houver muitos itens */
}

.nav-button {
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
}
.nav-button:hover {
  background-color: var(--cor-secundaria);
  color: var(--cor-primaria-escura);
}
.nav-button.active {
  background-color: var(--cor-primaria);
  color: white;
}
.nav-button.active .icon {
  color: white; /* Ícone branco quando ativo */
}

main.container {
  grid-area: main;
  padding: 2rem;
  overflow-y: auto; /* Permite scroll no conteúdo principal */
  background-color: var(--cor-fundo);
}

/* Componentes UI Reutilizáveis */
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--sombra-card);
  margin-bottom: 1.5rem;
  position: relative; /* Para overlay de disabled-card */
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
  text-decoration: none; /* Para links que parecem botões */
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
  transition: background-color 0.2s, color 0.2s;
}
.button-icon:hover {
  background-color: var(--cor-secundaria);
  color: var(--cor-primaria);
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
    padding-left: 40px; /* Make space for the icon */
}

.form-group-inline {
  display: flex;
  gap: 1rem;
  align-items: flex-end; /* Alinha os campos na base */
  margin-bottom: 1rem;
}
.form-group-inline > .form-group {
  flex: 1;
  margin-bottom: 0; /* Remove margin-bottom from nested form-groups */
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
  max-height: 500px; /* Altura máxima para listas roláveis */
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
  max-width: 200px; /* Limita a largura para truncar */
}

/* Abas */
.variantes-tabs {
  display: flex;
  flex-wrap: wrap; /* Permite que as abas quebrem a linha */
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
  border-radius: 8px 8px 0 0; /* Cantos arredondados no topo */
}
.variantes-tabs button.active {
  border-bottom-color: var(--cor-primaria);
  color: var(--cor-primaria);
  background-color: #fff; /* Fundo branco para a aba ativa */
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
  z-index: 100; /* Acima de tudo */
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
  max-height: 90vh; /* Para modais com conteúdo longo */
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

/* Animação para o modal */
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
    flex-grow: 1; /* Faz os cards preencherem a altura disponível */
}

/* Login Page */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--cor-fundo);
  padding: 1rem;
}
.login-card {
  width: 100%;
  max-width: 420px;
  text-align: center;
}
.login-card h1 {
  font-size: 2.2rem;
  color: var(--cor-primaria);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.login-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: var(--cor-texto);
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
  width: auto; /* Override default icon width */
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
    pointer-events: none; /* Desabilita interações com o conteúdo do card */
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
    z-index: 10; /* Garante que a mensagem esteja acima do conteúdo do card */
    padding: 1rem;
}

/* Responsividade */
.hamburger-menu-button {
  display: none; /* Esconde por padrão em desktop */
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
    grid-template-rows: 60px 1fr; /* Header e depois o conteúdo principal */
    grid-template-areas:
      "header"
      "main";
  }
  .main-nav {
    position: fixed; /* Fixa a navegação lateral */
    top: 0;
    left: -240px; /* Esconde a navegação para a esquerda */
    width: 240px;
    height: 100vh;
    z-index: 60; /* Acima do header, abaixo do modal */
    transition: left 0.3s ease-in-out;
    box-shadow: 2px 0 5px rgba(0,0,0,0.2);
    padding-top: 60px; /* Espaço para o header */
  }
  .main-nav.open {
    left: 0; /* Mostra a navegação */
  }
  .main-nav .nav-button {
    text-align: left;
  }
  .main-header {
    padding: 0 1rem;
  }
  .main-header .user-info {
    display: none; /* Esconde info do usuário no mobile */
  }
  .hamburger-menu-button {
    display: block; /* Mostra o botão de menu em mobile */
  }
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: flex;
    margin-top: auto; /* Empurra para o final da navegação */
  }
  .two-column-layout {
    grid-template-columns: 1fr; /* Colunas empilhadas em mobile */
    gap: 1.5rem;
  }
  main.container {
    padding: 1rem;
  }
  .modal-content {
      max-width: 95%; /* Ocupa mais largura em telas pequenas */
  }
}
""")

# Conteúdo para src/firebase.js
FIREBASE_JS_CONTENT = textwrap.dedent("""
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrROaFFo6xjrkn4FhKWdY1c4Z0Jyy6SNw", // Substitua com sua chave API real
  authDomain: "sistema-gestao-1a0cd.firebaseapp.com", // Substitua com seu domínio de autenticação real
  projectId: "sistema-gestao-1a0cd", // Substitua com seu ID de projeto real
  storageBucket: "sistema-gestao-1a0cd.appspot.com",
  messagingSenderId: "715681926217",
  appId: "1:715681926217:web:7b4ed090a6c2aa2afec398",
  measurementId: "G-Z2KJC3GMNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
""")

# Conteúdo para src/index.css
INDEX_CSS_CONTENT = textwrap.dedent("""
/* Importa a fonte Inter do Google Fonts */
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

# Conteúdo para o teste do InputField.js
INPUT_FIELD_TEST_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from '../InputField';

describe('InputField', () => {
  it('renders a standard text input', () => {
    render(<InputField label="Nome" />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('renders a textarea when type is textarea', () => {
    render(<InputField label="Descrição" type="textarea" />);
    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA');
  });

  it('calls onChange when text is typed', async () => {
    const handleChange = jest.fn();
    render(<InputField label="Email" onChange={handleChange} />);
    await userEvent.type(screen.getByLabelText('Email'), 'teste@email.com');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays an error message', () => {
    render(<InputField label="Senha" error="Senha é obrigatória" />);
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
  });
});
""")

# Conteúdo para o teste do SelectField.js
SELECT_FIELD_TEST_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectField from '../SelectField';

const options = [
  { value: 'kg', label: 'Kilograma (kg)' },
  { value: 'L', label: 'Litro (L)' },
];

describe('SelectField', () => {
  it('renders a select element with options', () => {
    render(<SelectField label="Unidade" options={options} />);
    expect(screen.getByLabelText('Unidade')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBe(2);
  });

  it('calls onChange when an option is selected', async () => {
    const handleChange = jest.fn();
    render(<SelectField label="Unidade" options={options} onChange={handleChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Unidade'), 'L');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Unidade')).toHaveValue('L');
  });

  it('displays an error message', () => {
    render(<SelectField label="Unidade" options={options} error="Seleção inválida" />);
    expect(screen.getByText('Seleção inválida')).toBeInTheDocument();
  });
});
""")

# Conteúdo para o teste do formatters.js
FORMATTERS_TEST_JS_CONTENT = textwrap.dedent("""
import { formatarValor, formatarData, formatarWhatsappParaLink, formatarWhatsappParaExibicao } from '../formatters';

describe('Formatters', () => {
  // Testes para formatarValor
  it('formatarValor should format number to BRL currency', () => {
    expect(formatarValor(123.45)).toBe('R$ 123,45');
    expect(formatarValor(0)).toBe('R$ 0,00');
  });

  it('formatarValor should return R$ 0,00 for non-number input', () => {
    expect(formatarValor(null)).toBe('R$ 0,00');
    expect(formatarValor(undefined)).toBe('R$ 0,00');
  });

  // Testes para formatarData
  it('formatarData should format Firestore timestamp to pt-BR date', () => {
    const timestamp = { seconds: 1672531200, nanoseconds: 0 }; // 2023-01-01
    expect(formatarData(timestamp)).toBe('01/01/2023');
  });

  it('formatarData should return N/A for invalid timestamp', () => {
    expect(formatarData(null)).toBe('N/A');
    expect(formatarData({})).toBe('N/A');
  });

  // Testes para WhatsApp
  it('formatarWhatsappParaLink should format number to a WhatsApp link format', () => {
    expect(formatarWhatsappParaLink('11987654321')).toBe('5511987654321');
    expect(formatarWhatsappParaLink('(11) 98765-4321')).toBe('5511987654321');
  });

  it('formatarWhatsappParaExibicao should format number for display', () => {
    expect(formatarWhatsappParaExibicao('5511987654321')).toBe('(11) 98765-4321');
  });
});
""")

# Conteúdo para o README.md
README_MD_CONTENT = textwrap.dedent("""
# Sistema de Gestão Empresarial v2.0 (Versão Final Consolidada)

Aplicação React completa para gestão de pedidos, fornecedores, catálogo, cálculo de Custo de Mercadoria Vendida (CMV), fluxo de caixa, gestão de estoque e ponto de venda (PDV). Esta versão foi refatorada para máxima usabilidade, robustez e escalabilidade.

## Como Iniciar

1.  **Instale as Dependências:**
    ```bash
    npm install
    ```

2.  **Configure o Firebase (OBRIGATÓRIO):**
    Abra o ficheiro `src/firebase.js` e preencha com as suas credenciais **reais** do Firebase.

3.  **Configure as Regras de Segurança e Funções (CRÍTICO PARA PRODUÇÃO):**
    * **Firestore Security Rules:** A segurança da sua aplicação depende disso. As regras padrão são inseguras. Adapte as regras sugeridas no `README.md` original ou crie as suas próprias baseadas na sua lógica de negócio (ex: apenas 'gestores' podem apagar dados).
    * **Cloud Functions:** Para automações essenciais como baixa de estoque após uma venda no PDV, recálculo automático de CMV e lançamento de despesas, é altamente recomendável implementar Cloud Functions. O ficheiro `src/services/firestoreService.js` contém comentários sobre as funções recomendadas.

4.  **Inicie a Aplicação:**
    ```bash
    npm start
    ```
    
5.  **Execute os Testes (Opcional):**
    ```bash
    # Testes unitários
    npm test

    # Testes End-to-End (requer a aplicação a rodar)
    npm run cypress:open
    ```
""")

# Conteúdo para cypress.config.js
CYPRESS_CONFIG_JS_CONTENT = textwrap.dedent("""
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: false,
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
});
""")

# Conteúdo para cypress/e2e/full_system_flow.cy.js (Cypress Test Atualizado)
FULL_SYSTEM_FLOW_CY_JS_CONTENT = textwrap.dedent("""
describe('Fluxo Completo do Sistema de Gestão', () => {
    const userEmail = 'gestor@exemplo.com';
    const userPassword = 'password123';

    beforeEach(() => {
        cy.visit('/');
        cy.get('[data-cy=input-email-login]').type(userEmail);
        cy.get('[data-cy=input-senha-login]').type(userPassword);
        cy.get('[data-cy=btn-login-submit]').click();
        cy.contains('Dashboard Gerencial', { timeout: 10000 }).should('be.visible');
    });

    it('Deve permitir o fluxo completo de gestão: Fornecedor -> Insumo -> Compra -> Ficha Técnica -> Estoque -> PDV -> Fluxo de Caixa -> Relatórios', () => {
        // 1. Gerenciar Fornecedores
        cy.get('[data-cy=nav-catalogo]').click();
        cy.contains('Gerenciar Fornecedores').click();
        cy.get('[data-cy=input-fornecedor-nome]').type('Fornecedor de Teste');
        cy.get('[data-cy=input-fornecedor-whatsapp]').type('11987654321');
        cy.get('[data-cy=input-fornecedor-obs]').type('Fornecedor para testes Cypress');
        cy.get('[data-cy=btn-adicionar-fornecedor]').click();
        cy.contains('Fornecedor salvo!').should('be.visible');
        cy.contains('Fornecedor de Teste').should('be.visible');

        // 2. Gerenciar Insumos
        cy.contains('Gerenciar Insumos').click();
        cy.get('h3').contains('Gerenciar Insumos').should('be.visible');
        cy.get('input[label="Nome do Insumo"]').type('Farinha de Teste');
        cy.get('select[label="Unidade para Análise de Custo"]').select('kg');
        cy.contains('Registar Novo Insumo').click();
        cy.contains('Insumo registado!').should('be.visible');
        cy.contains('Farinha de Teste').should('be.visible');

        // 3. Registrar Nova Compra (para ter um preço)
        cy.contains('Registar Nova Compra').click();
        cy.get('h3').contains('Registar Nova Compra').should('be.visible');
        cy.get('select[name="insumoId"]').select('Farinha de Teste (kg)');
        cy.get('select[name="fornecedorId"]').select('Fornecedor de Teste');
        cy.get('input[name="dataCompra"]').type('2024-06-01');
        cy.get('input[name="quantidadeComprada"]').type('10');
        cy.get('input[name="precoTotalNota"]').type('20');
        cy.contains('Registar Compra').click();
        cy.contains('Compra registada para Farinha de Teste!').should('be.visible');

        // 4. Criar Ficha Técnica (CMV)
        cy.get('[data-cy=nav-fichas-tecnicas]').click();
        cy.contains('Gerenciar Produtos Finais (Fichas Técnicas)').should('be.visible');
        cy.get('input[label="Nome do Produto"]').type('Bolo de Teste');
        cy.get('input[label="Categoria"]').type('Sobremesas');
        cy.get('input[label="Nome da Variante"]').type('Pequeno');
        cy.get('input[label="Custo Embalagem (R$)"]').type('0.50');
        cy.get('input[label="Outros Custos (R$)"]').type('1.00');
        
        // Adicionar insumo à ficha técnica
        cy.get('select[label="Insumo"]').select('Farinha de Teste - R$ 2,00000/kg');
        cy.get('input[label="Qtd (g)"]').type('500'); // 500g de farinha
        cy.contains('Adicionar item à ficha técnica').click();
        cy.contains('Farinha de Teste - 500 g').should('be.visible');
        cy.contains('CMV Total da Variante: R$').should('be.visible');
        cy.contains('Salvar Novo Produto').click();
        cy.contains('Produto salvo!').should('be.visible');

        // 5. Gerenciar Estoque
        cy.get('[data-cy=nav-estoque]').click();
        cy.contains('Gestão de Estoque').should('be.visible');
        cy.contains('Adicionar Item ao Estoque').should('be.visible');
        cy.get('select[label="Insumo"]').select('Farinha de Teste (kg)');
        cy.get('input[label="Quantidade em Estoque (kg)"]').type('5');
        cy.contains('Registar Estoque').click();
        cy.contains('Estoque registado!').should('be.visible');
        cy.contains('Farinha de Teste').should('be.visible');
        cy.contains('Quantidade: 5 kg').should('be.visible');

        // 6. Ponto de Venda (PDV)
        cy.get('[data-cy=nav-pdv]').click();
        cy.contains('Ponto de Venda (PDV)').should('be.visible');
        cy.get('select[label="Produto Final"]').select('Bolo de Teste');
        cy.get('select[label="Variante"]').select('Pequeno - R$'); // Seleciona a variante
        cy.get('input[label="Quantidade"]').clear().type('2');
        cy.contains('Adicionar ao Carrinho').click();
        cy.contains('2x Bolo de Teste (Pequeno) adicionado ao carrinho.').should('be.visible');
        cy.contains('Total: R$').should('be.visible');
        cy.contains('Finalizar Venda').click();
        cy.get('[data-cy=modal-confirm-button]').click(); // Confirmação do modal
        cy.contains('Venda finalizada com sucesso!').should('be.visible');
        cy.contains('Carrinho Vazio').should('be.visible');

        // 7. Fluxo de Caixa
        cy.get('[data-cy=nav-fluxo-caixa]').click();
        cy.contains('Fluxo de Caixa').should('be.visible');
        cy.contains('Lançar').click();
        cy.get('select[label="Tipo de Lançamento"]').select('despesa');
        cy.get('input[label="Valor (R$)"]').type('50');
        cy.get('input[label="Data"]').type('2024-06-20');
        cy.get('select[label="Categoria da Despesa"]').select('Marketing');
        cy.get('textarea[label="Descrição (Opcional)"]').type('Campanha de marketing');
        cy.contains('Registar').click();
        cy.contains('Despesa registada com sucesso!').should('be.visible');
        
        cy.contains('Relatório').click();
        cy.contains('Total Faturação:').should('be.visible');
        cy.contains('Total Despesas:').should('be.visible');
        cy.contains('Resultado Líquido:').should('be.visible');
        cy.contains('Campanha de marketing').should('be.visible');
        cy.contains('Marketing').should('be.visible');
        cy.contains('R$ 50,00').should('be.visible');

        // 8. Análises e Relatórios
        cy.get('[data-cy=nav-analises]').click();
        cy.contains('Análises e Histórico').should('be.visible');
        cy.contains('Análise Comparativa de Custos').click();
        cy.get('select[label="Selecione um item para comparar preços entre fornecedores"]').select('Farinha de Teste');
        cy.contains('Comparativo para Farinha de Teste').should('be.visible');
        cy.contains('Histórico de Pedidos').click();
        cy.contains('Histórico de Pedidos').should('be.visible');
        cy.contains('Fornecedor de Teste').should('be.visible');
        cy.contains('Histórico de Compras por Fornecedor').click();
        cy.contains('Histórico de Compras por Fornecedor').should('be.visible');
        cy.get('select[label="Selecione um Fornecedor"]').select('Fornecedor de Teste');
        cy.contains('Farinha de Teste').should('be.visible');
    });
});
""")

# Conteúdo para .gitignore
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

# Test reports
/coverage
/test-results
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

# Conteúdo para functions/package.json
FUNCTIONS_PACKAGE_JSON_CONTENT = textwrap.dedent("""
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "20"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "eslint": "^8.9.0",
    "eslint-config-google": "^0.14.0",
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
""")

# --- CONTEÚDO DOS FICHEIROS REACT ---

# App.js - Componente Principal da Aplicação
APP_JS_CONTENT = textwrap.dedent("""
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
""")

# index.js
INDEX_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/Auth';
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

# InputField.js
INPUT_FIELD_JS_CONTENT = textwrap.dedent("""
import React from 'react';

const InputField = ({ label, type = 'text', value, onChange, placeholder, required, error, icon: Icon, ...props }) => {
    const InputComponent = type === 'textarea' ? 'textarea' : 'input';

    return (
        <div className="form-group">
            {label && <label>{label}</label>}
            <div className={Icon ? "input-with-icon" : ""}>
                {Icon && <span className="icon"><Icon /></span>}
                <InputComponent
                    type={type !== 'textarea' ? type : undefined}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    {...props}
                />
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default InputField;
""")

# SelectField.js
SELECT_FIELD_JS_CONTENT = textwrap.dedent("""
import React from 'react';

const SelectField = ({ label, value, onChange, options, required, error, ...props }) => (
    <div className="form-group">
        {label && <label>{label}</label>}
        <select
            value={value}
            onChange={onChange}
            required={required}
            {...props}
        >
            {options.map((option, index) => (
                <option key={index} value={option.value} disabled={option.disabled}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className="error-message">{error}</p>}
    </div>
);

export default SelectField;
""")

# AccessSelectionPage.js
ACCESS_SELECTION_PAGE_JS_CONTENT = textwrap.dedent("""
import React, { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useUI } from '../../context/UIContext';
import { IconeCaminhao } from '../../utils/icons';
import InputField from '../ui/forms/InputField';

function getFriendlyAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'E-mail ou palavra-passe inválidos.';
        case 'auth/invalid-email':
            return 'O formato do e-mail é inválido.';
        default:
            return 'Ocorreu um erro. Verifique a sua conexão e as credenciais do Firebase.';
    }
}

const AccessSelectionPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const { loginUser } = useAuth();
    const { showToast } = useUI();

    const validateLoginForm = () => {
        const errors = {};
        if (!email) errors.email = "O e-mail é obrigatório.";
        if (!password) errors.password = "A palavra-passe é obrigatória.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateLoginForm()) return;
        setIsSaving(true);
        try {
            await loginUser(email, password);
            // O login bem-sucedido irá redirecionar automaticamente através do AuthProvider
        } catch (error) {
            showToast(getFriendlyAuthError(error.code), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <h1><IconeCaminhao /> Sistema de Gestão</h1>
                <form onSubmit={handleLogin}>
                    <h3>Aceder ao Sistema</h3>
                    <InputField
                        data-cy="input-email-login"
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setFormErrors(prev => ({ ...prev, email: '' })); }}
                        placeholder="seu-email@exemplo.com"
                        required
                        error={formErrors.email}
                    />
                    <InputField
                        data-cy="input-senha-login"
                        label="Palavra-passe"
                        type="password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setFormErrors(prev => ({ ...prev, password: '' })); }}
                        placeholder="Sua palavra-passe"
                        required
                        error={formErrors.password}
                    />
                    <button data-cy="btn-login-submit" type="submit" className="button-primary" style={{width: '100%', marginTop: '1rem'}} disabled={isSaving}>
                        {isSaving ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
    
export default AccessSelectionPage;
""")

# Auth.js
AUTH_CONTEXT_JS_CONTENT = textwrap.dedent("""
import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUser(currentUser);
                    const data = userDocSnap.data();
                    setUserRole(data.role);
                    setUserProfile(data);
                } else {
                    console.error("Utilizador autenticado mas sem dados no Firestore. A fazer logout.");
                    await signOut(auth);
                }
            } else {
                setUser(null);
                setUserRole(null);
                setUserProfile(null);
            }
            setLoadingAuth(false);
        });
        return unsubscribe;
    }, []);

    const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const registerUser = async (email, password, role) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const onboardingComplete = role === 'gestor' ? false : true;
        await setDoc(doc(db, "users", newUser.uid), {
            uid: newUser.uid,
            email: newUser.email,
            role: role,
            criadoEm: new Date(),
            onboardingComplete: onboardingComplete
        });
        return userCredential;
    };
    
    const updateOnboardingStatus = async (uid, status) => {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, { onboardingComplete: status });
        setUserProfile(prev => ({ ...prev, onboardingComplete: status }));
    };

    const logout = () => signOut(auth);

    const value = { user, userRole, userProfile, loadingAuth, loginUser, registerUser, logout, updateOnboardingStatus };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
""")

# DataContext.js
DATA_CONTEXT_JS_CONTENT = textwrap.dedent("""
import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './Auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [fornecedores, setFornecedores] = useState([]);
    const [produtosDeCompra, setProdutosDeCompra] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [allPedidos, setAllPedidos] = useState([]);
    const [faturamentos, setFaturamentos] = useState([]);
    const [despesas, setDespesas] = useState([]);
    const [estoque, setEstoque] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) {
            setFornecedores([]);
            setProdutosDeCompra([]);
            setProdutos([]);
            setAllPedidos([]);
            setFaturamentos([]);
            setDespesas([]);
            setEstoque([]);
            setLoadingData(false);
            return;
        }

        setLoadingData(true);
        const unsubscribers = [];
        
        // Fornecedores
        unsubscribers.push(onSnapshot(query(collection(db, "fornecedores"), orderBy("nome")), (s) => setFornecedores(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Produtos Finais
        unsubscribers.push(onSnapshot(query(collection(db, "produtosFinais"), orderBy("nome")), (s) => setProdutos(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Pedidos
        unsubscribers.push(onSnapshot(query(collection(db, "pedidosRealizados"), orderBy("criadoEm", "desc")), (s) => setAllPedidos(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Financeiro
        unsubscribers.push(onSnapshot(query(collection(db, "faturamento"), orderBy("data", "desc")), (s) => setFaturamentos(s.docs.map(d => ({...d.data(), id: d.id})))));
        unsubscribers.push(onSnapshot(query(collection(db, "despesas"), orderBy("data", "desc")), (s) => setDespesas(s.docs.map(d => ({...d.data(), id: d.id})))));
        // Estoque
        unsubscribers.push(onSnapshot(query(collection(db, "estoque"), orderBy("nome")), (s) => setEstoque(s.docs.map(d => ({...d.data(), id: d.id})))));

        // Insumos com subcoleção de preços
        const qProdutosCompra = query(collection(db, "produtosDeCompra"), orderBy("nome"));
        unsubscribers.push(onSnapshot(qProdutosCompra, async (snapshot) => {
            const itemsWithPrices = await Promise.all(snapshot.docs.map(async (doc) => {
                const item = { id: doc.id, ...doc.data() };
                const historicoRef = collection(db, "produtosDeCompra", doc.id, "historicoPrecos");
                // NOTA: orderBy e limit podem ser usados aqui, mas para simplificar, estamos pegando tudo
                const historicoSnapshot = await getDocs(query(historicoRef, orderBy("dataCompra", "desc")));
                
                // Filtra apenas os registros de 'compra' para o bestPrice inicial, mas considera 'oferta' também
                const allPriceRecords = historicoSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                if (allPriceRecords.length > 0) {
                    // Encontra o melhor preço (menor precoPorUnidadeAnalise) entre compras e ofertas
                    const bestPriceRecord = [...allPriceRecords].sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise)[0];
                    item.bestPrice = bestPriceRecord.precoPorUnidadeAnalise;
                    item.bestPriceFornecedorId = bestPriceRecord.fornecedorId;
                } else {
                    item.bestPrice = null;
                    item.bestPriceFornecedorId = null;
                }
                item.historicoPrecos = allPriceRecords; // Armazena todos os registros (compras e ofertas)
                return item;
            }));
            setProdutosDeCompra(itemsWithPrices);
            setLoadingData(false);
        }));

        const initialLoadTimeout = setTimeout(() => {
            setLoadingData(false); // Fallback para garantir que o loading termine mesmo sem dados
        }, 10000); // 10 segundos de timeout

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(initialLoadTimeout);
        };
    }, [user]);

    const value = { fornecedores, produtosDeCompra, produtos, allPedidos, faturamentos, despesas, estoque, loadingData };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
export const useData = () => useContext(DataContext);
""")

# UIContext.js
UI_CONTEXT_JS_CONTENT = textwrap.dedent("""
import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [modal, setModal] = useState({ isOpen: false, message: '' });
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: () => {} });
    
    const showToast = (message, type = 'success') => {
        if (type === 'success') toast.success(message);
        else if (type === 'error') toast.error(message);
        else toast(message);
    };

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

    const value = { modal, showModal, closeModal, confirmationModal, showConfirmationModal, closeConfirmationModal, handleConfirmAction, showToast };
    
    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => useContext(UIContext);
""")

# Modal.js
MODAL_JS_CONTENT = textwrap.dedent("""
import React from 'react';

const Modal = ({ children, onConfirm, showCancel, onCancel, title, confirmText = "OK" }) => (
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

# DashboardView.js
DASHBOARD_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatarValor } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const DashboardView = () => {
    const { allPedidos, faturamentos, despesas, loadingData } = useData();

    const { barChartData, lineChartData, fluxoCaixaData } = useMemo(() => {
        if (loadingData) {
            return { barChartData: null, lineChartData: null, fluxoCaixaData: null };
        }

        // Gastos por Fornecedor (Pedidos finalizados)
        const gastosPorFornecedor = allPedidos.filter(p => p.status === 'finalizado' && p.valorTotal > 0).reduce((acc, p) => {
            const nome = p.fornecedorNome || 'N/A';
            acc[nome] = (acc[nome] || 0) + p.valorTotal;
            return acc;
        }, {});

        const barData = {
            labels: Object.keys(gastosPorFornecedor),
            datasets: [{ label: 'Gastos Totais (R$)', data: Object.values(gastosPorFornecedor), backgroundColor: 'rgba(0, 51, 160, 0.6)' }],
        };
        
        // Evolução de Gastos Mensais (Pedidos finalizados)
        const gastosPorMes = allPedidos.filter(p => p.status === 'finalizado' && p.criadoEm).reduce((acc, p) => {
            const date = p.criadoEm.toDate ? p.criadoEm.toDate() : new Date(p.criadoEm.seconds * 1000);
            const mesAno = date.toLocaleDateString('pt-BR', { year: '2-digit', month: 'short' });
            acc[mesAno] = (acc[mesAno] || 0) + p.valorTotal;
            return acc;
        }, {});
        
        const sortedMonthsGastos = Object.keys(gastosPorMes).sort((a,b) => {
            const dateA = new Date('01 ' + a.replace('/',' '));
            const dateB = new Date('01 ' + b.replace('/',' '));
            return dateA - dateB;
        });

        const lineData = {
            labels: sortedMonthsGastos,
            datasets: [{ label: 'Evolução de Gastos (R$)', data: sortedMonthsGastos.map(m => gastosPorMes[m]), borderColor: '#d93025', tension: 0.1 }]
        };

        // Fluxo de Caixa Mensal (Novo)
        const fluxoPorMes = {};
        faturamentos.forEach(f => {
            const date = f.data.toDate ? f.data.toDate() : new Date(f.data.seconds * 1000);
            const mesAno = date.toLocaleDateString('pt-BR', { year: '2-digit', month: 'short' });
            fluxoPorMes[mesAno] = (fluxoPorMes[mesAno] || { faturamento: 0, despesa: 0 });
            fluxoPorMes[mesAno].faturamento += f.valor;
        });
        despesas.forEach(d => {
            const date = d.data.toDate ? d.data.toDate() : new Date(d.data.seconds * 1000);
            const mesAno = date.toLocaleDateString('pt-BR', { year: '2-digit', month: 'short' });
            fluxoPorMes[mesAno] = (fluxoPorMes[mesAno] || { faturamento: 0, despesa: 0 });
            fluxoPorMes[mesAno].despesa += d.valor;
        });

        const sortedMonthsFluxo = Object.keys(fluxoPorMes).sort((a,b) => {
            const dateA = new Date('01 ' + a.replace('/',' '));
            const dateB = new Date('01 ' + b.replace('/',' '));
            return dateA - dateB;
        });

        const fluxoData = {
            labels: sortedMonthsFluxo,
            datasets: [
                { label: 'Faturamento (R$)', data: sortedMonthsFluxo.map(m => fluxoPorMes[m].faturamento), borderColor: 'var(--cor-sucesso)', backgroundColor: 'rgba(0, 158, 77, 0.2)', fill: true, tension: 0.1 },
                { label: 'Despesas (R$)', data: sortedMonthsFluxo.map(m => fluxoPorMes[m].despesa), borderColor: 'var(--cor-perigo)', backgroundColor: 'rgba(217, 48, 37, 0.2)', fill: true, tension: 0.1 }
            ]
        };


        return { barChartData: barData, lineChartData: lineData, fluxoCaixaData: fluxoData };
    }, [allPedidos, faturamentos, despesas, loadingData]);

    if (loadingData) return <div className="card"><h2>A carregar Dashboard...</h2></div>;

    return (
        <div>
            <div className="card"><h2><IconeGrafico /> Dashboard Gerencial</h2><p>Visão geral do desempenho e custos do seu negócio.</p></div>
            <div className="two-column-layout">
                {barChartData && Object.keys(barChartData.labels).length > 0 ? (
                    <div className="card"><h3>Gastos por Fornecedor</h3><div style={{ height: '300px' }}><Bar data={barChartData} options={{ maintainAspectRatio: false }} /></div></div>
                ) : (
                    <div className="empty-state">
                        <IconeGrafico />
                        <h3>Nenhum Gasto por Fornecedor</h3>
                        <p className="sub-text">Registe pedidos e marque-os como finalizados para ver este gráfico.</p>
                    </div>
                )}
                
                {lineChartData && Object.keys(lineChartData.labels).length > 0 ? (
                    <div className="card"><h3>Evolução de Gastos Mensais</h3><div style={{ height: '300px' }}><Line data={lineChartData} options={{ maintainAspectRatio: false }} /></div></div>
                ) : (
                    <div className="empty-state">
                        <IconeGrafico />
                        <h3>Nenhuma Evolução de Gastos</h3>
                        <p className="sub-text">Registe pedidos e marque-os como finalizados para ver este gráfico.</p>
                    </div>
                )}

                {fluxoCaixaData && Object.keys(fluxoCaixaData.labels).length > 0 ? (
                    <div className="card"><h3>Fluxo de Caixa Mensal</h3><div style={{ height: '300px' }}><Line data={fluxoCaixaData} options={{ maintainAspectRatio: false }} /></div></div>
                ) : (
                    <div className="empty-state">
                        <IconeGrafico />
                        <h3>Nenhum Dado de Fluxo de Caixa</h3>
                        <p className="sub-text">Registe faturações e despesas na aba "Fluxo de Caixa" para ver este gráfico.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default DashboardView;
""")

# CatalogoView.js
CADASTROS_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState } from 'react';
import { IconeCatalogo } from '../../utils/icons';
import GerenciarFornecedoresTab from './tabs/GerenciarFornecedoresTab';
import GerenciarInsumosTab from './tabs/GerenciarInsumosTab';
import RegistrarCompraTab from './tabs/RegistrarCompraTab';
import GerenciarPrecosInsumosTab from './tabs/GerenciarPrecosInsumosTab'; // Nova importação

const CatalogoView = () => {
    const [activeTab, setActiveTab] = useState('fornecedores');
    
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'fornecedores': return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
            case 'insumos': return <GerenciarInsumosTab setActiveTab={setActiveTab} />;
            case 'registrarCompra': return <RegistrarCompraTab />;
            case 'gerenciarPrecos': return <GerenciarPrecosInsumosTab />; // Nova aba
            default: return <GerenciarFornecedoresTab setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div>
            <div className="card">
                <h2><IconeCatalogo /> Catálogo de Itens e Fornecedores</h2>
                <p>Gerencie os seus fornecedores, registe os seus insumos e registe todas as compras para manter o controlo de custos.</p>
            </div>

            {/* Abas de navegação */}
            <div className="variantes-tabs">
                <button className={activeTab === 'fornecedores' ? 'active' : ''} onClick={() => setActiveTab('fornecedores')}>
                    Gerenciar Fornecedores
                </button>
                <button className={activeTab === 'insumos' ? 'active' : ''} onClick={() => setActiveTab('insumos')}>
                    Gerenciar Insumos
                </button>
                <button className={activeTab === 'registrarCompra' ? 'active' : ''} onClick={() => setActiveTab('registrarCompra')}>
                    Registar Nova Compra
                </button>
                <button className={activeTab === 'gerenciarPrecos' ? 'active' : ''} onClick={() => setActiveTab('gerenciarPrecos')}>
                    Gerenciar Preços de Insumos
                </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            {renderActiveTab()}
        </div>
    );
};

export default CatalogoView;
""")

# GerenciarFornecedoresTab.js
GERENCIAR_FORNECEDORES_TAB_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { addDocument, updateDocument, deleteDocument } from '../../../services/firestoreService';
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

    const filtered = useMemo(() =>
        fornecedores.filter(f => f.nome.toLowerCase().includes(busca.toLowerCase())),
        [fornecedores, busca]
    );

    const validateForm = () => {
        const errors = {};
        if (!nome.trim()) errors.nome = "O nome é obrigatório.";
        if (!whatsapp.trim()) errors.whatsapp = "O WhatsApp é obrigatório.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const formattedNumber = formatarWhatsappParaLink(whatsapp);
        const data = { nome, whatsapp: formattedNumber, observacoes: observacoes || null };
        try {
            if (editing) {
                await updateDocument("fornecedores", editing.id, data);
                showToast('Fornecedor atualizado!');
            } else {
                await addDocument("fornecedores", data);
                showToast('Fornecedor salvo!');
            }
            resetForm();
        } catch (error) { showToast('Erro ao salvar: ' + error.message, 'error'); }
        finally { setIsSaving(false); }
    };

    const handleEdit = (f) => { setEditing(f); setNome(f.nome); setWhatsapp(f.whatsapp); setObservacoes(f.observacoes || ''); setFormErrors({}); };
    const handleDelete = (id) => { showConfirmationModal("Tem certeza que deseja apagar este fornecedor?", async () => {
        try { await deleteDocument("fornecedores", id); showToast("Fornecedor apagado."); }
        catch (error) { showToast("Erro ao apagar: " + error.message, 'error'); }
    }); };
    const resetForm = () => { setEditing(null); setNome(''); setWhatsapp(''); setObservacoes(''); setFormErrors({}); };

    return (
        <div className="card" data-cy="card-gerenciar-fornecedores">
            <h2><IconeCaminhao /> Gerenciar Fornecedores</h2>
            <form onSubmit={handleSave}>
                <InputField
                    data-cy="input-fornecedor-nome"
                    label="Nome"
                    type="text"
                    value={nome}
                    onChange={e => { setNome(e.target.value); setFormErrors(prev => ({ ...prev, nome: '' })); }}
                    placeholder="Nome da empresa"
                    required
                    error={formErrors.nome}
                />
                <InputField
                    data-cy="input-fornecedor-whatsapp"
                    label="WhatsApp"
                    type="text"
                    value={whatsapp}
                    onChange={e => { setWhatsapp(e.target.value); setFormErrors(prev => ({ ...prev, whatsapp: '' })); }}
                    placeholder="(XX) XXXXX-XXXX"
                    required
                    error={formErrors.whatsapp}
                />
                <InputField
                    data-cy="input-fornecedor-obs"
                    label="Observações"
                    type="text"
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Ex: Entregas às terças"
                />
                <button data-cy="btn-adicionar-fornecedor" type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? (editing ? 'A atualizar...' : 'A adicionar...') : (editing ? 'Atualizar' : 'Adicionar')}
                </button>
                {editing && <button type="button" onClick={resetForm} className="button-link">Cancelar Edição</button>}
            </form>
            <div className="divider" />
            <div className="form-group">
                <InputField
                    label="Procurar fornecedor"
                    type="text"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Procurar fornecedor..."
                    icon={IconeBusca}
                />
            </div>
            <div className="list-container">
                {filtered.length > 0 ? filtered.map(f => (
                    <div key={f.id} className="list-item">
                        <div className="list-item-info">
                            <p><strong>{f.nome}</strong></p>
                            <a href={`https://wa.me/${f.whatsapp}`} target="_blank" rel="noopener noreferrer">{formatarWhatsappParaExibicao(f.whatsapp)}</a>
                            {f.observacoes && <p className='sub-text'>Obs: {f.observacoes}</p>}
                        </div>
                        <div className="list-item-actions">
                            <button className="button-icon" onClick={() => handleEdit(f)} aria-label={`Editar ${f.nome}`}><IconeEditar /></button>
                            <button className="button-icon" onClick={() => handleDelete(f.id)} aria-label={`Apagar ${f.nome}`}><IconeLixeira /></button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeCaminhao />
                        <h3>Nenhum Fornecedor Registado</h3>
                        <p className="sub-text">Registe o seu primeiro fornecedor no formulário acima.</p>
                        <button className="button-primary" onClick={() => setActiveTab('insumos')}>
                            Agora, registe um insumo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default GerenciarFornecedoresTab;
""")

# GerenciarInsumosTab.js
GERENCIAR_INSUMOS_TAB_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { addDocument, updateDocument, deleteDocument } from '../../../services/firestoreService';
import { IconeCaixa, IconeBusca, IconeEditar, IconeLixeira } from '../../../utils/icons';
import { formatarValorPreciso } from '../../../utils/formatters';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

const GerenciarInsumosTab = ({ setActiveTab }) => {
    const { showConfirmationModal, showToast } = useUI();
    const { produtosDeCompra, fornecedores } = useData();
    const [insumoForm, setInsumoForm] = useState({ id: null, nome: '', unidadeAnalise: 'kg' });
    const [editingInsumo, setEditingInsumo] = useState(null);
    const [buscaInsumo, setBuscaInsumo] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const filteredItensDeCompra = useMemo(() => {
        const products = Array.isArray(produtosDeCompra) ? produtosDeCompra : [];
        return products.filter(p => p.nome.toLowerCase().includes(buscaInsumo.toLowerCase())).map(p => ({
            ...p,
            bestPriceFornecedorNome: p.bestPriceFornecedorId ? (fornecedores.find(f => f.id === p.bestPriceFornecedorId)?.nome || 'N/A') : null
        }));
    }, [produtosDeCompra, buscaInsumo, fornecedores]);

    const validateForm = () => {
        const errors = {};
        if (!insumoForm.nome.trim()) errors.nome = "O nome do insumo é obrigatório.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveInsumo = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        try {
            if (editingInsumo) {
                await updateDocument("produtosDeCompra", editingInsumo, { nome: insumoForm.nome, unidadeAnalise: insumoForm.unidadeAnalise });
                showToast("Insumo atualizado!");
            } else {
                await addDocument("produtosDeCompra", { nome: insumoForm.nome, unidadeAnalise: insumoForm.unidadeAnalise });
                showToast("Insumo registado!");
            }
            resetInsumoForm();
        } catch (error) {
            showToast("Erro ao salvar insumo: " + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    const handleDeleteInsumo = (id) => {
        showConfirmationModal("Tem certeza que deseja apagar este insumo e todo o seu histórico de preços?", async () => {
            try {
                await deleteDocument("produtosDeCompra", id);
                showToast("Insumo apagado.");
            } catch (error) {
                showToast("Erro ao apagar: " + error.message, 'error');
            }
        });
    };

    const resetInsumoForm = () => {
        setInsumoForm({ id: null, nome: '', unidadeAnalise: 'kg' });
        setEditingInsumo(null);
        setFormErrors({});
    };

    const handleEdit = (insumo) => {
        setInsumoForm({ id: insumo.id, nome: insumo.nome, unidadeAnalise: insumo.unidadeAnalise });
        setEditingInsumo(insumo.id);
        setFormErrors({});
    };

    return (
        <div className="card">
            <h3><IconeCaixa /> Gerenciar Insumos</h3>
            <form onSubmit={handleSaveInsumo}>
                <InputField
                    label="Nome do Insumo"
                    type="text"
                    value={insumoForm.nome}
                    onChange={e => { setInsumoForm({...insumoForm, nome: e.target.value}); setFormErrors(prev => ({ ...prev, nome: '' })); }}
                    placeholder="Ex: Farinha de Trigo"
                    required
                    error={formErrors.nome}
                />
                <SelectField
                    label="Unidade para Análise de Custo"
                    value={insumoForm.unidadeAnalise}
                    onChange={e => setInsumoForm({...insumoForm, unidadeAnalise: e.target.value})}
                    options={[
                        { value: 'kg', label: 'Quilograma (kg)' },
                        { value: 'L', label: 'Litro (L)' },
                        { value: 'un', label: 'Unidade (un)' }
                    ]}
                    required
                />
                <button type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? (editingInsumo ? 'A atualizar...' : 'A registar...') : (editingInsumo ? 'Atualizar Insumo' : 'Registar Novo Insumo')}
                </button>
                {editingInsumo && <button type="button" onClick={resetInsumoForm} className="button-link">Cancelar Edição</button>}
            </form>
            <div className="divider" />
            <div className="form-group">
                <InputField
                    label="Procurar insumo"
                    type="text"
                    value={buscaInsumo}
                    onChange={e => setBuscaInsumo(e.target.value)}
                    placeholder="Procurar insumo..."
                    icon={IconeBusca}
                />
            </div>
            <div className="list-container">
                {filteredItensDeCompra.length > 0 ? filteredItensDeCompra.map(p => (
                    <div key={p.id} className="list-item">
                        <div className="list-item-info">
                            <p><strong>{p.nome}</strong> (Análise p/ {p.unidadeAnalise})</p>
                            {p.bestPrice ? (
                                <p className="sub-text" style={{color: 'var(--cor-sucesso)'}}>Melhor Preço: <strong>{formatarValorPreciso(p.bestPrice)}/{p.unidadeAnalise}</strong> ({p.bestPriceFornecedorNome})</p>
                            ) : <p className="sub-text">Nenhum custo registado.</p>}
                        </div>
                        <div className="list-item-actions">
                            <button className="button-icon" onClick={() => handleEdit(p)} aria-label={`Editar ${p.nome}`}><IconeEditar /></button>
                            <button className="button-icon" onClick={() => handleDeleteInsumo(p.id)} aria-label={`Apagar item ${p.nome}`}><IconeLixeira /></button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeCaixa />
                        <h3>Nenhum Insumo Registado</h3>
                        <p className="sub-text">Registe o seu primeiro insumo acima para poder registar compras.</p>
                        <button className="button-primary" onClick={() => setActiveTab('registrarCompra')}>
                            Ir para Registar Compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default GerenciarInsumosTab;
""")

# RegistrarCompraTab.js
REGISTRAR_COMPRA_TAB_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { addDocumentToSubcollection, addDocument } from '../../../services/firestoreService';
import { formatarValorPreciso } from '../../../utils/formatters';
import Modal from '../../../components/ui/Modal';
import InputField from '../../../components/ui/forms/InputField';
import SelectField from '../../../components/ui/forms/SelectField';

// Componente interno para adicionar/gerenciar um novo fornecedor (mini-modal)
const QuickAddFornecedorModal = ({ onClose, onFornecedorAdded }) => {
    const [nome, setNome] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const { showToast } = useUI();

    const validateForm = () => {
        const errors = {};
        if (!nome.trim()) errors.nome = "O nome é obrigatório.";
        if (!whatsapp.trim()) errors.whatsapp = "O WhatsApp é obrigatório.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const formattedNumber = whatsapp.replace(/\\D/g, ''); // Apenas números
        try {
            const docRef = await addDocument("fornecedores", { nome, whatsapp: formattedNumber, observacoes: null });
            showToast('Fornecedor salvo!');
            onFornecedorAdded(docRef.id);
            onClose();
        } catch (error) {
            showToast('Erro ao salvar: ' + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    return (
        <Modal title="Novo Fornecedor" onConfirm={handleSave} showCancel={true} onCancel={onClose} confirmText="Salvar">
            <form onSubmit={handleSave}>
                <InputField
                    label="Nome"
                    type="text"
                    value={nome}
                    onChange={e => { setNome(e.target.value); setFormErrors(prev => ({ ...prev, nome: '' })); }}
                    placeholder="Nome da empresa"
                    required
                    error={formErrors.nome}
                />
                <InputField
                    label="WhatsApp"
                    type="text"
                    value={whatsapp}
                    onChange={e => { setWhatsapp(e.target.value); setFormErrors(prev => ({ ...prev, whatsapp: '' })); }}
                    placeholder="(XX) XXXXX-XXXX"
                    required
                    error={formErrors.whatsapp}
                />
                <button type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? 'A salvar...' : 'Salvar'}
                </button>
            </form>
        </Modal>
    );
};

// Componente interno para adicionar um novo Insumo (mini-modal)
const QuickAddInsumoModal = ({ onClose, onInsumoAdded }) => {
    const [nome, setNome] = useState('');
    const [unidadeAnalise, setUnidadeAnalise] = useState('kg');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const { showToast } = useUI();

    const validateForm = () => {
        const errors = {};
        if (!nome.trim()) errors.nome = "O nome do insumo é obrigatório.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        try {
            const docRef = await addDocument("produtosDeCompra", { nome, unidadeAnalise });
            showToast('Insumo registado!');
            onInsumoAdded(docRef.id);
            onClose();
        } catch (error) {
            showToast('Erro ao registar insumo: ' + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    return (
        <Modal title="Novo Insumo" onConfirm={handleSave} showCancel={true} onCancel={onClose} confirmText="Salvar">
            <form onSubmit={handleSave}>
                <InputField
                    label="Nome do Insumo"
                    type="text"
                    value={nome}
                    onChange={e => { setNome(e.target.value); setFormErrors(prev => ({ ...prev, nome: '' })); }}
                    placeholder="Ex: Farinha de Trigo"
                    required
                    error={formErrors.nome}
                />
                <SelectField
                    label="Unidade para Análise de Custo"
                    value={unidadeAnalise}
                    onChange={e => setUnidadeAnalise(e.target.value)}
                    options={[
                        { value: 'kg', label: 'Quilograma (kg)' },
                        { value: 'L', label: 'Litro (L)' },
                        { value: 'un', label: 'Unidade (un)' }
                    ]}
                    required
                />
                <button type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? 'A salvar...' : 'Salvar'}
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
        precoTotalNota: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [showQuickAddFornecedor, setShowQuickAddFornecedor] = useState(false);
    const [showQuickAddInsumo, setShowQuickAddInsumo] = useState(false);

    const selectedInsumo = useMemo(() => produtosDeCompra.find(p => p.id === purchaseForm.insumoId), [produtosDeCompra, purchaseForm.insumoId]);

    const validateForm = () => {
        const errors = {};
        if (!purchaseForm.insumoId) errors.insumoId = "Selecione um insumo.";
        if (!purchaseForm.fornecedorId) errors.fornecedorId = "Selecione um fornecedor.";
        if (isNaN(parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.'))) || parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.')) <= 0) errors.quantidadeComprada = "Quantidade inválida.";
        if (isNaN(parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.'))) || parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.')) <= 0) errors.precoTotalNota = "Preço total inválido.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePurchaseFormChange = (e) => {
        const { name, value } = e.target;
        setPurchaseForm(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSavePurchase = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const { insumoId, fornecedorId, dataCompra, quantidadeComprada, precoTotalNota } = purchaseForm;
        const qtd = parseFloat(String(quantidadeComprada).replace(',', '.'));
        const precoTotal = parseFloat(String(precoTotalNota).replace(',', '.'));

        try {
            const precoPorUnidadeAnalise = precoTotal / qtd;
            const purchaseRecord = {
                tipo: "compra", // Adiciona o tipo de registro
                fornecedorId,
                dataCompra: new Date(dataCompra),
                precoTotalNota: precoTotal,
                quantidadeComprada: qtd,
                unidadeComprada: selectedInsumo.unidadeAnalise,
                precoPorUnidadeAnalise,
            };
            await addDocumentToSubcollection("produtosDeCompra", insumoId, "historicoPrecos", purchaseRecord);
            showToast(`Compra registada para ${selectedInsumo.nome}! Custo: ${formatarValorPreciso(precoPorUnidadeAnalise)}/${selectedInsumo.unidadeAnalise}`);

            resetPurchaseForm();
        } catch (error) {
            showToast("Erro ao registar compra: " + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    const resetPurchaseForm = () => {
        setPurchaseForm({
            insumoId: '',
            fornecedorId: '',
            dataCompra: new Date().toISOString().split('T')[0],
            quantidadeComprada: '',
            precoTotalNota: ''
        });
        setFormErrors({});
    };

    return (
        <div className="card">
            <h3>Registar Nova Compra</h3>
            <form onSubmit={handleSavePurchase}>
                <SelectField
                    label="Insumo"
                    name="insumoId"
                    value={purchaseForm.insumoId}
                    onChange={handlePurchaseFormChange}
                    options={[
                        { value: '', label: 'Selecione um insumo...', disabled: true },
                        ...produtosDeCompra.map(p => ({ value: p.id, label: `${p.nome} (${p.unidadeAnalise})` }))
                    ]}
                    required
                    error={formErrors.insumoId}
                />
                <button type="button" className="button-link" onClick={() => setShowQuickAddInsumo(true)} style={{marginLeft: '0.5rem', fontSize: '0.9rem'}}>
                    + Novo Insumo
                </button>

                <SelectField
                    label="Fornecedor"
                    name="fornecedorId"
                    value={purchaseForm.fornecedorId}
                    onChange={handlePurchaseFormChange}
                    options={[
                        { value: '', label: 'Selecione um fornecedor...', disabled: true },
                        ...fornecedores.map(f => ({ value: f.id, label: f.nome }))
                    ]}
                    required
                    error={formErrors.fornecedorId}
                />
                <button type="button" className="button-link" onClick={() => setShowQuickAddFornecedor(true)} style={{marginLeft: '0.5rem', fontSize: '0.9rem'}}>
                    + Novo Fornecedor
                </button>
                
                <InputField
                    label="Data da Compra"
                    name="dataCompra"
                    type="date"
                    value={purchaseForm.dataCompra}
                    onChange={handlePurchaseFormChange}
                    required
                    error={formErrors.dataCompra}
                />

                <div className="form-group-inline">
                    <InputField
                        label={`Quantidade Comprada (${selectedInsumo?.unidadeAnalise || 'un'})`}
                        name="quantidadeComprada"
                        type="text"
                        value={purchaseForm.quantidadeComprada}
                        onChange={handlePurchaseFormChange}
                        placeholder={`Ex: 25`}
                        required
                        error={formErrors.quantidadeComprada}
                    />
                    <InputField
                        label="Preço Total na Nota (R$)"
                        name="precoTotalNota"
                        type="text"
                        value={purchaseForm.precoTotalNota}
                        onChange={handlePurchaseFormChange}
                        placeholder="Ex: 120.00"
                        required
                        error={formErrors.precoTotalNota}
                    />
                </div>

                {purchaseForm.quantidadeComprada && purchaseForm.precoTotalNota && !isNaN(parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.'))) && !isNaN(parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.'))) && (
                    <p style={{textAlign: 'center', fontWeight: 'bold', marginTop: '1rem'}}>
                        Custo por {selectedInsumo?.unidadeAnalise || 'un'}: {formatarValorPreciso(parseFloat(String(purchaseForm.precoTotalNota).replace(',', '.')) / parseFloat(String(purchaseForm.quantidadeComprada).replace(',', '.')))}
                    </p>
                )}

                <button type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? 'A registar...' : 'Registar Compra'}
                </button>
                <button type="button" onClick={resetPurchaseForm} className="button-link">Limpar Formulário</button>
            </form>

            {showQuickAddFornecedor && (
                <QuickAddFornecedorModal
                    onClose={() => setShowQuickAddFornecedor(false)}
                    onFornecedorAdded={(id) => setPurchaseForm(prev => ({ ...prev, fornecedorId: id }))}
                />
            )}
            {showQuickAddInsumo && (
                <QuickAddInsumoModal
                    onClose={() => setShowQuickAddInsumo(false)}
                    onInsumoAdded={(id) => setPurchaseForm(prev => ({ ...prev, insumoId: id }))}
                />
            )}
        </div>
    );
};

export default RegistrarCompraTab;
""")

# GerenciarPrecosInsumosTab.js (NOVA ABA)
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
        precoPorUnidadeAnalise: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [buscaPreco, setBuscaPreco] = useState('');

    const filteredInsumos = useMemo(() => {
        return produtosDeCompra.filter(p => p.nome.toLowerCase().includes(buscaPreco.toLowerCase()));
    }, [produtosDeCompra, buscaPreco]);

    const validateForm = () => {
        const errors = {};
        if (!formState.insumoId) errors.insumoId = "Selecione um insumo.";
        if (!formState.fornecedorId) errors.fornecedorId = "Selecione um fornecedor.";
        if (isNaN(parseFloat(String(formState.precoPorUnidadeAnalise).replace(',', '.'))) || parseFloat(String(formState.precoPorUnidadeAnalise).replace(',', '.')) <= 0) errors.precoPorUnidadeAnalise = "Preço inválido.";
        if (!formState.dataOferta) errors.dataOferta = "Data da oferta é obrigatória.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSavePreco = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const { insumoId, fornecedorId, dataOferta, precoPorUnidadeAnalise } = formState;
        const preco = parseFloat(String(precoPorUnidadeAnalise).replace(',', '.'));

        try {
            const offerRecord = {
                tipo: "oferta", // Adiciona o tipo de registro
                fornecedorId,
                dataOferta: new Date(dataOferta),
                precoPorUnidadeAnalise: preco,
            };
            await addDocumentToSubcollection("produtosDeCompra", insumoId, "historicoPrecos", offerRecord);
            showToast(`Preço de oferta registado para ${produtosDeCompra.find(p => p.id === insumoId)?.nome}!`);
            resetForm();
        } catch (error) {
            showToast("Erro ao registar preço de oferta: " + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    const resetForm = () => {
        setFormState({
            insumoId: '',
            fornecedorId: '',
            dataOferta: new Date().toISOString().split('T')[0],
            precoPorUnidadeAnalise: ''
        });
        setFormErrors({});
    };

    return (
        <div className="card">
            <h3><IconeMais /> Registar Preço de Insumo (Oferta)</h3>
            <form onSubmit={handleSavePreco}>
                <SelectField
                    label="Insumo"
                    name="insumoId"
                    value={formState.insumoId}
                    onChange={handleFormChange}
                    options={[
                        { value: '', label: 'Selecione um insumo...', disabled: true },
                        ...produtosDeCompra.map(p => ({ value: p.id, label: `${p.nome} (${p.unidadeAnalise})` }))
                    ]}
                    required
                    error={formErrors.insumoId}
                />
                <SelectField
                    label="Fornecedor"
                    name="fornecedorId"
                    value={formState.fornecedorId}
                    onChange={handleFormChange}
                    options={[
                        { value: '', label: 'Selecione um fornecedor...', disabled: true },
                        ...fornecedores.map(f => ({ value: f.id, label: f.nome }))
                    ]}
                    required
                    error={formErrors.fornecedorId}
                />
                <InputField
                    label="Data da Oferta"
                    name="dataOferta"
                    type="date"
                    value={formState.dataOferta}
                    onChange={handleFormChange}
                    required
                    error={formErrors.dataOferta}
                />
                <InputField
                    label="Preço por Unidade de Análise (R$)"
                    name="precoPorUnidadeAnalise"
                    type="text"
                    value={formState.precoPorUnidadeAnalise}
                    onChange={handleFormChange}
                    placeholder="Ex: 2.50"
                    required
                    error={formErrors.precoPorUnidadeAnalise}
                />
                <button type="submit" className="button-primary" disabled={isSaving}>
                    {isSaving ? 'A registar...' : 'Registar Preço'}
                </button>
                <button type="button" onClick={resetForm} className="button-link">Limpar Formulário</button>
            </form>

            <div className="divider" />

            <h3><IconeBusca /> Histórico de Preços de Insumos</h3>
            <div className="form-group">
                <InputField
                    label="Procurar Insumo no Histórico"
                    type="text"
                    value={buscaPreco}
                    onChange={e => setBuscaPreco(e.target.value)}
                    placeholder="Procurar insumo..."
                    icon={IconeBusca}
                />
            </div>
            <div className="list-container">
                {filteredInsumos.length > 0 ? filteredInsumos.map(insumo => (
                    <div key={insumo.id} className="card" style={{marginBottom: '1rem'}}>
                        <h4>{insumo.nome} ({insumo.unidadeAnalise})</h4>
                        {insumo.historicoPrecos && insumo.historicoPrecos.length > 0 ? (
                            insumo.historicoPrecos.map((precoRec, idx) => (
                                <div key={idx} className="list-item">
                                    <div className="list-item-info">
                                        <p>Fornecedor: <strong>{fornecedores.find(f => f.id === precoRec.fornecedorId)?.nome || 'Desconhecido'}</strong></p>
                                        <p className="sub-text">Tipo: {precoRec.tipo === 'compra' ? 'Compra' : 'Oferta'}</p>
                                        <p className="sub-text">Data: {formatarData(precoRec.dataCompra || precoRec.dataOferta)}</p>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p><strong>{formatarValorPreciso(precoRec.precoPorUnidadeAnalise)}/{insumo.unidadeAnalise}</strong></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state" style={{border: 'none', padding: '1rem', marginTop: '0.5rem'}}>
                                <p className="sub-text">Nenhum preço registado para este insumo.</p>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeCaixa />
                        <h3>Nenhum Insumo com Preços Registados</h3>
                        <p className="sub-text">Registe novos preços de oferta ou compras para ver o histórico aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GerenciarPrecosInsumosTab;
""")

# CmvView.js
CMV_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument, updateDocument, deleteDocument } from '../../services/firestoreService';
import { IconeFichaTecnica, IconeEditar, IconeLixeira, IconeMais, IconeRemover } from '../../utils/icons';
import { formatarValor, formatarValorPreciso } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';
        
const GerenciarProdutosFinais = ({ isDisabled }) => {
    const { produtosDeCompra, produtos } = useData();
    const { showConfirmationModal, showToast } = useUI();
    const initialState = { nome: '', categoria: '', variantes: [{ nomeVariante: 'Padrão', custoEmbalagem: '0', custoOperacional: '0', fichaTecnica: [] }] };
    const [formState, setFormState] = useState(initialState);
    const [editing, setEditing] = useState(null);
    const [varianteAtiva, setVarianteAtiva] = useState(0);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [qtdInsumo, setQtdInsumo] = useState('');
    const [margemLucroPercentual, setMargemLucroPercentual] = useState(100); // Estado para %
    const [margemLucroMonetaria, setMargemLucroMonetaria] = useState(0); // Estado para R$
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const selectedInsumo = useMemo(() => {
        return produtosDeCompra.find(p => p.id === selectedInsumoId);
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
        if (!formState.nome.trim()) errors.nome = "O nome do produto é obrigatório.";
        
        formState.variantes.forEach((variante, index) => {
            if (!variante.nomeVariante.trim()) {
                errors[`varianteNome${index}`] = "O nome da variante é obrigatório.";
            }
            if (isNaN(parseFloat(String(variante.custoEmbalagem).replace(',', '.')))) {
                errors[`custoEmbalagem${index}`] = "Custo de embalagem inválido.";
            }
            if (isNaN(parseFloat(String(variante.custoOperacional).replace(',', '.')))) {
                errors[`custoOperacional${index}`] = "Outros custos inválidos.";
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
                variantes: formState.variantes.map(v => {
                    const custoTotalItens = v.fichaTecnica.reduce((acc, item) => acc + item.custo, 0);
                    const custoEmbalagem = parseFloat(String(v.custoEmbalagem || '0').replace(',', '.'));
                    const custoOperacional = parseFloat(String(v.custoOperacional || '0').replace(',', '.'));
                    const cmvCalculado = custoTotalItens + custoEmbalagem + custoOperacional;
                    return { ...v, cmvCalculado };
                })
            };
            if (editing) {
                await updateDocument("produtosFinais", editing.id, produtoData);
                showToast("Produto atualizado!");
            } else {
                await addDocument("produtosFinais", produtoData);
                showToast("Produto salvo!");
            }
            resetForm();
        } catch (error) { showToast("Erro ao salvar: " + error.message, 'error'); }
        finally { setIsSaving(false); }
    };
    
    const handleAddItem = () => {
        const insumo = produtosDeCompra.find(p => p.id === selectedInsumoId);
        const qtd = parseFloat(String(qtdInsumo).replace(',', '.'));
        if (!insumo || isNaN(qtd) || qtd <= 0 || !insumo.bestPrice) {
            showToast("Selecione um insumo com preço e quantidade válidos.", 'error'); return;
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
        setFormState({...formState, variantes: novasVariantes });
        setSelectedInsumoId(''); setQtdInsumo('');
    };

    const handleRemoveItem = (index) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva].fichaTecnica.splice(index, 1);
        setFormState({ ...formState, variantes: novasVariantes });
    };
    
    const handleEdit = (p) => { setEditing(p); setFormState(p); setVarianteAtiva(0); setFormErrors({}); };
    const handleDelete = (id) => showConfirmationModal("Apagar este produto?", async () => {
        try { await deleteDocument("produtosFinais", id); showToast("Produto apagado."); }
        catch(error) { showToast("Erro ao apagar: " + error.message, 'error'); }
    });

    const handleVarianteFieldChange = (field, value) => {
        const novasVariantes = [...formState.variantes];
        novasVariantes[varianteAtiva][field] = value;
        setFormState({ ...formState, variantes: novasVariantes });
        setFormErrors(prev => ({ ...prev, [`${field}${varianteAtiva}`]: '' }));
    };

    const handleAddVariante = () => {
        setFormState(prev => ({
            ...prev,
            variantes: [...prev.variantes, { nomeVariante: `Nova Variante ${prev.variantes.length + 1}`, custoEmbalagem: '0', custoOperacional: '0', fichaTecnica: [] }]
        }));
        setVarianteAtiva(formState.variantes.length);
    };

    const handleRemoveVariante = (index) => {
        if (formState.variantes.length === 1) {
            showToast("É necessário ter pelo menos uma variante.", 'error');
            return;
        }
        showConfirmationModal("Apagar esta variante?", () => {
            const novasVariantes = [...formState.variantes];
            novasVariantes.splice(index, 1);
            setFormState(prev => ({ ...prev, variantes: novasVariantes }));
            setVarianteAtiva(0);
            showToast("Variante removida.");
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

    // Recalcula margem monetária quando percentual ou CMV muda
    useEffect(() => {
        if (currentCmv > 0) {
            setMargemLucroMonetaria(currentCmv * (margemLucroPercentual / 100));
        } else {
            setMargemLucroMonetaria(0);
        }
    }, [margemLucroPercentual, currentCmv]);

    // Recalcula margem percentual quando monetária ou CMV muda
    useEffect(() => {
        if (currentCmv > 0 && margemLucroMonetaria >= 0) {
            setMargemLucroPercentual((margemLucroMonetaria / currentCmv) * 100);
        } else if (currentCmv === 0 && margemLucroMonetaria > 0) {
            setMargemLucroPercentual(Infinity); // Lucro infinito se CMV for zero e houver lucro monetário
        } else {
            setMargemLucroPercentual(0);
        }
    }, [margemLucroMonetaria, currentCmv]);


    return (
        <div className={`card ${isDisabled ? 'disabled-card' : ''}`} data-cy="card-gerenciar-produtos-finais">
            {isDisabled && <div className="overlay-message"><p>Registe insumos com preço em "Catálogo" para criar fichas técnicas.</p></div>}
            
            <form onSubmit={handleSave}>
                <div className="form-group-inline">
                    <InputField
                        label="Nome do Produto"
                        type="text"
                        value={formState.nome}
                        onChange={e => { setFormState({...formState, nome: e.target.value}); setFormErrors(prev => ({ ...prev, nome: '' })); }}
                        placeholder="Ex: Pizza"
                        required
                        error={formErrors.nome}
                    />
                    <InputField
                        label="Categoria"
                        type="text"
                        value={formState.categoria}
                        onChange={e => setFormState({...formState, categoria: e.target.value})}
                        placeholder="Ex: Pizzas Salgadas"
                    />
                </div>
                
                <div className="variantes-tabs" style={{marginTop: '1.5rem', borderBottom: 'none', paddingBottom: 0}}>
                    {formState.variantes.map((v, index) => (
                        <div key={index} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <button
                                type="button"
                                className={varianteAtiva === index ? 'active' : ''}
                                onClick={() => setVarianteAtiva(index)}
                            >
                                {v.nomeVariante}
                            </button>
                            {formState.variantes.length > 1 && (
                                <button type="button" className="button-icon small" onClick={() => handleRemoveVariante(index)} aria-label="Remover Variante">
                                    <IconeRemover />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="button-secondary" onClick={handleAddVariante}><IconeMais /> Adicionar Variante</button>
                </div>

                <div className="variantes-manager">
                    <h4>Detalhes da Variante: {formState.variantes[varianteAtiva].nomeVariante}</h4>
                    <div className="form-group-inline">
                        <InputField
                            label="Nome da Variante"
                            type="text"
                            value={formState.variantes[varianteAtiva].nomeVariante}
                            onChange={e => handleVarianteFieldChange('nomeVariante', e.target.value)}
                            placeholder="Ex: Grande"
                            error={formErrors[`varianteNome${varianteAtiva}`]}
                        />
                        <InputField
                            label="Custo Embalagem (R$)"
                            type="text"
                            value={formState.variantes[varianteAtiva].custoEmbalagem}
                            onChange={e => handleVarianteFieldChange('custoEmbalagem', e.target.value)}
                            placeholder="1.50"
                            error={formErrors[`custoEmbalagem${varianteAtiva}`]}
                        />
                        <InputField
                            label="Outros Custos (R$)"
                            type="text"
                            value={formState.variantes[varianteAtiva].custoOperacional}
                            onChange={e => handleVarianteFieldChange('custoOperacional', e.target.value)}
                            placeholder="3.00"
                            error={formErrors[`custoOperacional${varianteAtiva}`]}
                        />
                    </div>
                    
                    <h5>Ficha Técnica da Variante</h5>
                    <div className="form-group-inline">
                        <SelectField
                            label="Insumo"
                            value={selectedInsumoId}
                            onChange={e => setSelectedInsumoId(e.target.value)}
                            options={[
                                { value: '', label: 'Selecione...', disabled: true },
                                ...produtosDeCompra.filter(p => p.bestPrice).map(p => ({ value: p.id, label: `${p.nome} - ${formatarValorPreciso(p.bestPrice)}/${p.unidadeAnalise}` }))
                            ]}
                            aria-label="Selecione um item de compra"
                        />
                        <InputField
                            label={`Qtd (${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : (selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un')) : 'un'})`}
                            type="text"
                            value={qtdInsumo}
                            onChange={e => setQtdInsumo(e.target.value)}
                            placeholder={`Ex: 150 ${selectedInsumo ? (selectedInsumo.unidadeAnalise === 'kg' ? 'g' : (selectedInsumo.unidadeAnalise === 'L' ? 'ml' : 'un')) : ''}`}
                            aria-label="Quantidade do item de compra"
                        />
                        <button type="button" onClick={handleAddItem} className="button-secondary" disabled={!selectedInsumoId || !qtdInsumo} aria-label="Adicionar item à ficha técnica">+</button>
                    </div>
                    
                    <div className="list-container" style={{maxHeight: '150px', borderTop: 'none', marginTop: 0}}>
                        {formState.variantes[varianteAtiva].fichaTecnica.length > 0 ? formState.variantes[varianteAtiva].fichaTecnica.map((item, i) => (
                            <div key={i} className="list-item"><p>{item.nome} - {item.quantidade} {item.unidade} ({formatarValor(item.custo)})</p><button type='button' className='button-icon' onClick={() => handleRemoveItem(i)}><IconeLixeira/></button></div>
                        )) : (
                            <div className="empty-state" style={{border: 'none', padding: '1rem', marginTop: '0.5rem'}}>
                                <p className="sub-text">Adicione insumos à ficha técnica desta variante.</p>
                            </div>
                        )}
                    </div>
                    <p style={{textAlign:'right', fontWeight: 'bold', fontSize: '1.2rem'}}>CMV Total da Variante: {formatarValor(currentCmv)}</p>

                    {/* Destaque para Preço de Venda Sugerido */}
                    <div style={{ 
                        backgroundColor: 'var(--cor-secundaria)', 
                        color: 'var(--cor-primaria)', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        marginTop: '1.5rem'
                    }}>
                        <label htmlFor="margemLucroPercentual">Margem de Lucro Desejada:</label>
                        <input 
                            type="range" 
                            id="margemLucroPercentual" 
                            min="0" 
                            max="500" 
                            value={margemLucroPercentual} 
                            onChange={e => setMargemLucroPercentual(parseFloat(e.target.value))} 
                        />
                        <span> {margemLucroPercentual.toFixed(0)}%</span>
                        
                        <InputField
                            label="Margem de Lucro (R$)"
                            type="number"
                            value={margemLucroMonetaria.toFixed(2)}
                            onChange={e => setMargemLucroMonetaria(parseFloat(e.target.value) || 0)}
                            step="0.01"
                            placeholder="0.00"
                        />

                        <h4 style={{marginTop: '1rem', marginBottom: '0.5rem'}}>Preço de Venda Sugerido:</h4>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                            {formatarValor(currentCmv + margemLucroMonetaria)}
                        </p>
                    </div>
                </div>
                
                <button type="submit" className="button-primary" style={{marginTop: '1rem'}} disabled={isSaving}>
                    {isSaving ? (editing ? 'A atualizar...' : 'A salvar...') : (editing ? 'Atualizar Produto' : 'Salvar Novo Produto')}
                </button>
                {editing && <button type="button" onClick={resetForm} className="button-link">Cancelar</button>}
            </form>

            <div className="divider" />
            <h3><IconeFichaTecnica /> Produtos Finais Registados</h3>
            <div className="list-container">
                {produtos.length > 0 ? produtos.map(p => (
                    <div key={p.id} className="card" style={{marginBottom: '1rem'}}>
                        <div className="list-item" style={{paddingBottom: 0}}>
                            <h4 className="truncate-text">{p.nome} <span className="sub-text">{p.categoria}</span></h4>
                            <div><button className="button-icon" onClick={() => handleEdit(p)}><IconeEditar/></button><button className="button-icon" onClick={() => handleDelete(p.id)}><IconeLixeira/></button></div>
                        </div>
                        {p.variantes.map((v, i) => (
                            <div key={i} className="list-item">
                                <strong>{v.nomeVariante}</strong>
                                <div>
                                    <p>CMV: <strong>{formatarValor(v.cmvCalculado)}</strong></p>
                                    {/* Exibe o preço sugerido usando a margem percentual padrão de 100% para a lista */}
                                    <p className="sub-text">Preço Sugerido (Lucro 100%): {formatarValor(v.cmvCalculado * 2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeFichaTecnica />
                        <h3>Nenhum Produto Final Registado</h3>
                        <p className="sub-text">Crie a sua primeira ficha técnica acima.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
    
const CmvView = () => {
    const { produtosDeCompra } = useData();
    const isDisabled = !produtosDeCompra.some(item => item.bestPrice); 

    return (
        <div>
            <div className="card">
                <h2><IconeFichaTecnica /> Gerenciar Produtos Finais (Fichas Técnicas)</h2>
                <p>Crie e gerencie as receitas dos seus produtos vendidos. O sistema usará o <strong>melhor preço</strong> registado de cada insumo para calcular o Custo de Mercadoria Vendida (CMV) de forma automática.</p>
            </div>
            <GerenciarProdutosFinais isDisabled={isDisabled} />
        </div>
    );
};

export default CmvView;
""")

# EstoqueView.js
ESTOQUE_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { setDocument, deleteDocument } from '../../services/firestoreService';
import { IconeEstoque, IconeBusca, IconeEditar, IconeLixeira } from '../../utils/icons';
import { formatarData } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const EstoqueView = () => {
    const { produtosDeCompra, estoque, loadingData } = useData();
    const { showToast, showConfirmationModal } = useUI();

    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [editingEstoque, setEditingEstoque] = useState(null);
    const [buscaEstoque, setBuscaEstoque] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const filteredEstoque = useMemo(() => {
        const items = Array.isArray(estoque) ? estoque : [];
        return items.filter(item =>
            item.nome.toLowerCase().includes(buscaEstoque.toLowerCase())
        );
    }, [estoque, buscaEstoque]);

    const insumosDisponiveis = useMemo(() => {
        return produtosDeCompra.filter(insumo =>
            !estoque.some(item => item.insumoId === insumo.id) || (editingEstoque && editingEstoque.insumoId === insumo.id)
        );
    }, [produtosDeCompra, estoque, editingEstoque]);
    
    const validateForm = () => {
        const errors = {};
        if (!selectedInsumoId) errors.selectedInsumoId = "Selecione um insumo.";
        if (isNaN(parseFloat(String(quantidade).replace(',', '.'))) || parseFloat(String(quantidade).replace(',', '.')) < 0) errors.quantidade = "Quantidade inválida.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveEstoque = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (isSaving) return;

        setIsSaving(true);
        const insumo = produtosDeCompra.find(p => p.id === selectedInsumoId);
        if (!insumo) {
            showToast("Insumo não encontrado. Por favor, selecione um insumo válido.", 'error');
            setIsSaving(false);
            return;
        }

        // Garante que unidadeAnalise não é undefined
        const unidadeAnaliseValue = insumo.unidadeAnalise || 'un'; 

        const data = {
            insumoId: insumo.id,
            nome: insumo.nome,
            unidadeAnalise: unidadeAnaliseValue, // Usa o valor garantido
            quantidade: parseFloat(String(quantidade).replace(',', '.')),
        };

        try {
            // Usamos o ID do insumo como ID do documento no estoque para garantir unicidade
            await setDocument("estoque", insumo.id, data);
            showToast(editingEstoque ? "Estoque atualizado!" : "Estoque registado!");
            resetForm();
        } catch (error) {
            showToast("Erro ao salvar estoque: " + error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleEditEstoque = (item) => {
        setEditingEstoque(item);
        setSelectedInsumoId(item.insumoId);
        setQuantidade(item.quantidade);
        setFormErrors({});
    };

    const handleDeleteEstoque = (id) => {
        showConfirmationModal("Tem certeza que deseja apagar este item do estoque?", async () => {
            try {
                await deleteDocument("estoque", id);
                showToast("Item de estoque apagado.");
            } catch (error) {
                showToast("Erro ao apagar: " + error.message, 'error');
            }
        });
    };

    const resetForm = () => {
        setEditingEstoque(null);
        setSelectedInsumoId('');
        setQuantidade('');
        setFormErrors({});
    };


    if (loadingData) return <div className="card"><h3>A carregar Estoque...</h3></div>;

    return (
        <div>
            <div className="card">
                <h2><IconeEstoque /> Gestão de Estoque</h2>
                <p>Controle as quantidades dos seus insumos em estoque. Mantenha os registos atualizados para uma gestão eficiente.</p>
            </div>

            <div className="card">
                <h3>{editingEstoque ? 'Atualizar Item no Estoque' : 'Adicionar Item ao Estoque'}</h3>
                <form onSubmit={handleSaveEstoque}>
                    <SelectField
                        label="Insumo"
                        value={selectedInsumoId}
                        onChange={e => { setSelectedInsumoId(e.target.value); setFormErrors(prev => ({ ...prev, selectedInsumoId: '' })); }}
                        options={[
                            { value: '', label: 'Selecione um insumo...', disabled: true },
                            ...insumosDisponiveis.map(insumo => ({ value: insumo.id, label: `${insumo.nome} (${insumo.unidadeAnalise || 'un'})` }))
                        ]}
                        required
                        error={formErrors.selectedInsumoId}
                        disabled={editingEstoque !== null}
                    />
                    <InputField
                        label={`Quantidade em Estoque (${produtosDeCompra.find(p => p.id === selectedInsumoId)?.unidadeAnalise || 'un'})`}
                        type="text"
                        value={quantidade}
                        onChange={e => { setQuantidade(e.target.value); setFormErrors(prev => ({ ...prev, quantidade: '' })); }}
                        placeholder="Ex: 50"
                        required
                        error={formErrors.quantidade}
                    />
                    <button type="submit" className="button-primary" disabled={isSaving}>
                        {isSaving ? (editingEstoque ? 'A atualizar...' : 'A registar...') : (editingEstoque ? 'Atualizar Estoque' : 'Registar Estoque')}
                    </button>
                    {editingEstoque && <button type="button" onClick={resetForm} className="button-link">Cancelar Edição</button>}
                </form>
            </div>

            <div className="card">
                <h3>Itens em Estoque</h3>
                <div className="form-group">
                    <InputField
                        label="Procurar item no estoque"
                        type="text"
                        value={buscaEstoque}
                        onChange={e => setBuscaEstoque(e.target.value)}
                        placeholder="Procurar insumo no estoque..."
                        icon={IconeBusca}
                    />
                </div>
                <div className="list-container">
                    {filteredEstoque.length > 0 ? filteredEstoque.map(item => (
                        <div key={item.id} className="list-item">
                            <div className="list-item-info">
                                <p><strong>{item.nome}</strong></p>
                                <p className="sub-text">Quantidade: {item.quantidade} {item.unidadeAnalise}</p>
                                {item.ultimaAtualizacao && <p className="sub-text">Última atualização: {formatarData(item.ultimaAtualizacao)}</p>}
                            </div>
                            <div className="list-item-actions">
                                <button className="button-icon" onClick={() => handleEditEstoque(item)} aria-label={`Editar ${item.nome}`}><IconeEditar /></button>
                                <button className="button-icon" onClick={() => handleDeleteEstoque(item.id)} aria-label={`Apagar ${item.nome}`}><IconeLixeira /></button>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">
                            <IconeEstoque />
                            <h3>Nenhum Item em Estoque</h3>
                            <p className="sub-text">Registe o seu primeiro item de estoque acima.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default EstoqueView;
""")

# PdvView.js
PDV_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument } from '../../services/firestoreService';
import { IconePdv, IconeMais, IconeRemover, IconeCarrinho, IconeDinheiro } from '../../utils/icons';
import { formatarValor } from '../../utils/formatters';
import InputField from '../../components/ui/forms/InputField';
import SelectField from '../../components/ui/forms/SelectField';

const PdvView = () => {
    const { produtos, loadingData } = useData();
    const { showToast, showConfirmationModal } = useUI();

    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState([]);
    const [isProcessingSale, setIsProcessingSale] = useState(false);

    const availableProducts = useMemo(() => {
        // Filtra produtos que têm variantes com CMV calculado (ou seja, ficha técnica completa)
        return produtos.filter(p => p.variantes && p.variantes.length > 0 && p.variantes.some(v => v.cmvCalculado > 0));
    }, [produtos]);

    const selectedProduct = useMemo(() => {
        return availableProducts.find(p => p.id === selectedProductId);
    }, [selectedProductId, availableProducts]);

    const selectedVariantData = useMemo(() => {
        return selectedProduct?.variantes.find(v => v.nomeVariante === selectedVariant);
    }, [selectedProduct, selectedVariant]);

    const totalCartValue = useMemo(() => {
        return cart.reduce((total, item) => total + item.totalItemPrice, 0);
    }, [cart]);

    const handleAddToCart = () => {
        if (!selectedProduct || !selectedVariantData || quantity <= 0) {
            showToast("Selecione um produto, uma variante e uma quantidade válida.", 'error');
            return;
        }

        const itemPrice = selectedVariantData.cmvCalculado * 2; // Exemplo: Preço de venda é 2x o CMV
        const totalItemPrice = itemPrice * quantity;

        setCart(prevCart => [
            ...prevCart,
            {
                productId: selectedProduct.id,
                productName: selectedProduct.nome,
                variantName: selectedVariantData.nomeVariante,
                quantity,
                pricePerUnit: itemPrice,
                totalItemPrice,
                timestamp: new Date(),
                // Incluir a ficha técnica para futura baixa de estoque via Cloud Function
                fichaTecnica: selectedVariantData.fichaTecnica 
            }
        ]);
        showToast(`${quantity}x ${selectedProduct.nome} (${selectedVariantData.nomeVariante}) adicionado ao carrinho.`);
        resetProductSelection();
    };

    const handleRemoveFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
        showToast("Item removido do carrinho.");
    };

    const resetProductSelection = () => {
        setSelectedProductId('');
        setSelectedVariant('');
        setQuantity(1);
    };

    const handleFinalizeSale = async () => {
        if (cart.length === 0) {
            showToast("O carrinho está vazio.", 'error');
            return;
        }

        showConfirmationModal(`Confirmar venda de ${formatarValor(totalCartValue)}?`, async () => {
            setIsProcessingSale(true);
            try {
                await addDocument("vendasPDV", {
                    itensVendidos: cart,
                    valorTotal: totalCartValue,
                    dataVenda: new Date(),
                    status: 'finalizada',
                });

                setCart([]);
                showToast("Venda finalizada com sucesso! A baixa de estoque e o lançamento no caixa dependem das Cloud Functions.");
            } catch (error) {
                showToast("Erro ao finalizar venda: " + error.message, 'error');
            } finally {
                setIsProcessingSale(false);
            }
        });
    };

    if (loadingData) return <div className="card"><h3>A carregar PDV...</h3></div>;

    return (
        <div>
            <div className="card">
                <h2><IconePdv /> Ponto de Venda (PDV)</h2>
                <p>Registe vendas de produtos finais, com cálculo automático e gestão de carrinho. Ideal para operações de balcão.</p>
            </div>

            <div className="two-column-layout">
                {/* Coluna Esquerda: Seleção de Produtos */}
                <div className="left-column">
                    <div className="card" style={{padding: '1rem'}}>
                        <h3>Adicionar Produto à Venda</h3>
                        <SelectField
                            label="Produto Final"
                            value={selectedProductId}
                            onChange={e => { setSelectedProductId(e.target.value); setSelectedVariant(''); setQuantity(1); }}
                            options={[
                                { value: '', label: 'Selecione um produto...', disabled: true },
                                ...availableProducts.map(p => ({ value: p.id, label: p.nome }))
                            ]}
                            required
                        />
                        {selectedProduct && (
                            <SelectField
                                label="Variante"
                                value={selectedVariant}
                                onChange={e => setSelectedVariant(e.target.value)}
                                options={[
                                    { value: '', label: 'Selecione uma variante...', disabled: true },
                                    ...selectedProduct.variantes.map(v => ({ value: v.nomeVariante, label: `${v.nomeVariante} - ${formatarValor(v.cmvCalculado * 2)}` }))
                                ]}
                                required
                            />
                        )}
                        <InputField
                            label="Quantidade"
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                            min="1"
                            required
                        />
                        <button onClick={handleAddToCart} className="button-primary btn-full-width" disabled={!selectedVariant || quantity <= 0}>
                            <IconeMais /> Adicionar ao Carrinho
                        </button>
                    </div>
                </div>

                {/* Coluna Direita: Carrinho de Vendas */}
                <div className="right-column">
                    <div className="card" style={{padding: '1rem'}}>
                        <h3><IconeCarrinho /> Carrinho de Vendas</h3>
                        <div className="list-container" style={{maxHeight: '300px', border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem'}}>
                            {cart.length > 0 ? cart.map((item, index) => (
                                <div key={index} className="list-item">
                                    <div className="list-item-info">
                                        <p><strong>{item.quantity}x {item.productName} ({item.variantName})</strong></p>
                                        <p className="sub-text">Preço Unitário: {formatarValor(item.pricePerUnit)}</p>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p><strong>{formatarValor(item.totalItemPrice)}</strong></p>
                                        <button className="button-icon" onClick={() => handleRemoveFromCart(index)}><IconeRemover /></button>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state" style={{border: 'none'}}>
                                    <IconeCarrinho />
                                    <h3>Carrinho Vazio</h3>
                                    <p className="sub-text">Adicione produtos à venda.</p>
                                </div>
                            )}
                        </div>
                        <div className="divider-soft" />
                        <div style={{textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem'}}>
                            Total: {formatarValor(totalCartValue)}
                        </div>
                        <button onClick={handleFinalizeSale} className="button-primary btn-full-width" style={{marginTop: '1rem'}} disabled={cart.length === 0 || isProcessingSale}>
                            {isProcessingSale ? 'A finalizar...' : <><IconeDinheiro /> Finalizar Venda</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PdvView;
""")

# FluxoDeCaixaView.js
FLUXO_DE_CAIXA_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { addDocument, deleteDocument } from '../../services/firestoreService';
import { IconeDinheiro, IconeMais, IconeLixeira, IconeBusca, IconeCalendario, IconeGrafico } from '../../utils/icons';
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

    const categoriasDespesa = ['Aluguel', 'Salários', 'Contas de Consumo', 'Insumos', 'Marketing', 'Outros'];

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
        if (isNaN(parseFloat(String(valor).replace(',', '.'))) || parseFloat(String(valor).replace(',', '.')) <= 0) errors.valor = "Valor inválido.";
        if (!data) errors.data = "Data é obrigatória.";
        if (tipoLancamento === 'despesa' && !categoriaDespesa) errors.categoriaDespesa = "Selecione uma categoria.";
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
                showToast('Faturação registada com sucesso!');
            } else {
                await addDocument('despesas', { ...lancamentoData, categoria: categoriaDespesa });
                showToast('Despesa registada com sucesso!');
            }
            resetForm();
        } catch (error) {
            showToast('Erro ao registar lançamento: ' + error.message, 'error');
        } finally { setIsSaving(false); }
    };

    const resetForm = () => {
        setValor('');
        setData(new Date().toISOString().split('T')[0]);
        setDescricao('');
        setCategoriaDespesa('');
        setFormErrors({});
    };

    const handleDeleteLancamento = (collectionName, id) => {
        showConfirmationModal("Tem certeza que deseja apagar este lançamento?", async () => {
            try {
                await deleteDocument(collectionName, id);
                showToast("Lançamento apagado.");
            } catch (error) {
                showToast("Erro ao apagar: " + error.message, 'error');
            }
        });
    };

    const combinedLancamentos = useMemo(() => {
        const all = [
            ...faturamentos.map(item => ({ ...item, tipo: 'faturamento', categoria: 'Faturamento' })),
            ...despesas.map(item => ({ ...item, tipo: 'despesa' }))
        ].sort((a, b) => {
            const dateA = a.data.toDate ? a.data.toDate() : new Date(a.data.seconds * 1000);
            const dateB = b.data.toDate ? b.data.toDate() : new Date(b.data.seconds * 1000);
            return dateB - dateA;
        });

        let filtered = all;

        if (relatorioSearchTerm) {
            filtered = filtered.filter(item =>
                item.descricao?.toLowerCase().includes(relatorioSearchTerm.toLowerCase()) ||
                item.categoria?.toLowerCase().includes(relatorioSearchTerm.toLowerCase())
            );
        }

        if (relatorioFilterDateStart) {
            const startDate = new Date(relatorioFilterDateStart);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => {
                const itemDate = item.data.toDate ? item.data.toDate() : new Date(item.data.seconds * 1000);
                return itemDate >= startDate;
            });
        }

        if (relatorioFilterDateEnd) {
            const endDate = new Date(relatorioFilterDateEnd);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => {
                const itemDate = item.data.toDate ? item.data.toDate() : new Date(item.data.seconds * 1000);
                return itemDate <= endDate;
            });
        }

        return filtered;
    }, [faturamentos, despesas, relatorioSearchTerm, relatorioFilterDateStart, relatorioFilterDateEnd]);

    const totalFaturamento = useMemo(() => combinedLancamentos.filter(l => l.tipo === 'faturamento').reduce((sum, l) => sum + l.valor, 0), [combinedLancamentos]);
    const totalDespesas = useMemo(() => combinedLancamentos.filter(l => l.tipo === 'despesa').reduce((sum, l) => sum + l.valor, 0), [combinedLancamentos]);
    const resultadoLiquido = totalFaturamento - totalDespesas;

    const getResultadoColor = (valor) => {
        if (valor > 0) return 'var(--cor-sucesso)';
        if (valor < 0) return 'var(--cor-perigo)';
        return 'var(--cor-texto)';
    };

    const generatePdf = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Fluxo de Caixa", 14, 16);

        const tableColumn = ["Data", "Tipo", "Categoria", "Descrição", "Valor (R$)"];
        const tableRows = [];

        combinedLancamentos.forEach(lancamento => {
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
                // Footer
                let str = "Página " + doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });
        
        let finalY = doc.autoTable.previous.finalY;
        doc.setFontSize(10);
        doc.text(`Total Faturação: ${formatarValor(totalFaturamento)}`, 14, finalY + 10);
        doc.text(`Total Despesas: ${formatarValor(totalDespesas)}`, 14, finalY + 17);
        doc.text(`Resultado Líquido: ${formatarValor(resultadoLiquido)}`, 14, finalY + 24);
        doc.save('fluxo_de_caixa.pdf');
    };

    const csvHeaders = [
        { label: "Data", key: "data" },
        { label: "Tipo", key: "tipo" },
        { label: "Categoria", key: "categoria" },
        { label: "Descrição", key: "descricao" },
        { label: "Valor", key: "valor" }
    ];

    const csvData = combinedLancamentos.map(lancamento => ({
        data: formatarData(lancamento.data),
        tipo: lancamento.tipo === 'faturamento' ? 'Faturamento' : 'Despesa',
        categoria: lancamento.categoria || '',
        descricao: lancamento.descricao || '',
        valor: lancamento.valor
    }));


    if (loadingData) return <div className="card"><h3>A carregar Fluxo de Caixa...</h3></div>;

    return (
        <div>
            <div className="card">
                <h2><IconeDinheiro /> Fluxo de Caixa</h2>
                <p>Controle as suas entradas e saídas para ter uma visão clara da saúde financeira do seu negócio.</p>
            </div>

            <div className="variantes-tabs">
                <button className={activeTab === 'lancamento' ? 'active' : ''} onClick={() => setActiveTab('lancamento')}>
                    Lançar
                </button>
                <button className={activeTab === 'relatorio' ? 'active' : ''} onClick={() => setActiveTab('relatorio')}>
                    Relatório
                </button>
            </div>

            {activeTab === 'lancamento' && (
                <div className="card">
                    <h3><IconeMais /> Novo Lançamento</h3>
                    <form onSubmit={handleSaveLancamento}>
                        <div className="form-group-inline">
                            <SelectField
                                label="Tipo de Lançamento"
                                value={tipoLancamento}
                                onChange={e => { setTipoLancamento(e.target.value); setFormErrors({}); }}
                                options={[
                                    { value: 'faturamento', label: 'Faturamento' },
                                    { value: 'despesa', label: 'Despesa' }
                                ]}
                            />
                            <InputField
                                label="Valor (R$)"
                                type="text"
                                value={valor}
                                onChange={e => { setValor(e.target.value); setFormErrors(prev => ({ ...prev, valor: '' })); }}
                                placeholder="0.00"
                                required
                                error={formErrors.valor}
                            />
                        </div>
                        <div className="form-group-inline">
                            <InputField
                                label="Data"
                                type="date"
                                value={data}
                                onChange={e => { setData(e.target.value); setFormErrors(prev => ({ ...prev, data: '' })); }}
                                required
                                error={formErrors.data}
                            />
                            {tipoLancamento === 'despesa' && (
                                <SelectField
                                    label="Categoria da Despesa"
                                    value={categoriaDespesa}
                                    onChange={e => { setCategoriaDespesa(e.target.value); setFormErrors(prev => ({ ...prev, categoriaDespesa: '' })); }}
                                    options={[
                                        { value: '', label: 'Selecione...', disabled: true },
                                        ...categoriasDespesa.map(cat => ({ value: cat, label: cat }))
                                    ]}
                                    required
                                    error={formErrors.categoriaDespesa}
                                />
                            )}
                        </div>
                        <InputField
                            label="Descrição (Opcional)"
                            type="textarea"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            placeholder="Ex: Venda do dia, Aluguel do mês"
                        />
                        <button type="submit" className="button-primary" disabled={isSaving}>
                            {isSaving ? 'A registar...' : 'Registar'}
                        </button>
                        <button type="button" onClick={resetForm} className="button-link">Limpar</button>
                    </form>
                </div>
            )}

            {activeTab === 'relatorio' && (
                <div className="card">
                    <h3><IconeGrafico /> Relatório de Fluxo de Caixa</h3>
                    <div className="form-group-inline">
                        <InputField
                            label="Procurar"
                            type="text"
                            value={relatorioSearchTerm}
                            onChange={e => setRelatorioSearchTerm(e.target.value)}
                            placeholder="Procurar por descrição ou categoria..."
                            icon={IconeBusca}
                        />
                        <SelectField
                            label="Período"
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
                        <button onClick={generatePdf} className="button-secondary" disabled={combinedLancamentos.length === 0}>Exportar PDF</button>
                        <CSVLink data={csvData} headers={csvHeaders} filename={"fluxo_de_caixa.csv"} className="button-secondary" disabled={combinedLancamentos.length === 0}>
                            Exportar CSV
                        </CSVLink>
                    </div>

                    <div className="list-container">
                        {combinedLancamentos.length > 0 ? combinedLancamentos.map(lancamento => (
                            <div key={lancamento.id} className="list-item" style={{ borderLeft: `5px solid ${lancamento.tipo === 'faturamento' ? 'var(--cor-sucesso)' : 'var(--cor-perigo)'}` }}>
                                <div className="list-item-info">
                                    <p><strong>{lancamento.descricao || (lancamento.tipo === 'faturamento' ? 'Faturamento' : 'Despesa')}</strong></p>
                                    <p className="sub-text">
                                        {lancamento.tipo === 'despesa' && `Categoria: ${lancamento.categoria} | `}
                                        Data: {formatarData(lancamento.data)}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: lancamento.tipo === 'faturamento' ? 'var(--cor-sucesso)' : 'var(--cor-perigo)', fontWeight: 'bold' }}>
                                        {formatarValor(lancamento.valor)}
                                    </p>
                                    <button className="button-icon" onClick={() => handleDeleteLancamento(lancamento.tipo === 'faturamento' ? 'faturamento' : 'despesas', lancamento.id)} aria-label="Apagar lançamento"><IconeLixeira /></button>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">
                                <IconeDinheiro />
                                <h3>Nenhum Lançamento Encontrado</h3>
                                <p className="sub-text">Registe faturações e despesas na aba "Lançar" para ver o relatório.</p>
                            </div>
                        )}
                    </div>
                    <div className="divider" />
                    <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        <p>Total Faturação: <span style={{ color: 'var(--cor-sucesso)' }}>{formatarValor(totalFaturamento)}</span></p>
                        <p>Total Despesas: <span style={{ color: 'var(--cor-perigo)' }}>{formatarValor(totalDespesas)}</span></p>
                        <p>Resultado Líquido: <span style={{ color: getResultadoColor(resultadoLiquido) }}>{formatarValor(resultadoLiquido)}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FluxoDeCaixaView;
""")

# PedidosView.js
PEDIDOS_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/Auth';
import { addDocument } from '../../services/firestoreService';
import { formatarWhatsappParaLink, formatarValorPreciso, formatarValor } from '../../utils/formatters';
import { IconeCarrinho, IconeLixeira, IconeBusca, IconeCaixa } from '../../utils/icons';
import ComparativePricesModal from '../ComparativePricesModal/ComparativePricesModal';
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
            .filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(p => ({
                ...p,
                bestPriceFornecedorName: p.bestPriceFornecedorId 
                    ? (fornecedores.find(f => f.id === p.bestPriceFornecedorId)?.nome || 'N/A') 
                    : 'N/A'
            }));
    }, [produtosDeCompra, searchTerm, fornecedores]);
    
    const validateItemForm = () => {
        const errors = {};
        if (!itemData.fornecedorId) errors.fornecedorId = "Selecione um fornecedor.";
        if (itemData.qtd <= 0) errors.qtd = "Quantidade deve ser maior que zero.";
        setItemFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!validateItemForm()) return;
        if (isAddingToCart) return;

        setIsAddingToCart(true);

        const fornecedor = fornecedores.find(f => f.id === itemData.fornecedorId);
        const itemOriginal = produtosDeCompra.find(p => p.id === selectedItem.id);

        if (!selectedItem || !fornecedor || itemData.qtd <= 0 || !itemOriginal.bestPrice) {
            showToast("Erro: Item, fornecedor ou preço inválido.", 'error');
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
            custoTotal: custoTotalItem
        });
        setCarrinho(novoCarrinho);
        resetItemSelection();
        showToast("Item adicionado ao carrinho!");
        setIsAddingToCart(false);
    };
    
    const handleSendOrder = async (fornecedorId) => {
        const fornecedor = fornecedores.find(f => f.id === fornecedorId);
        const itens = carrinho[fornecedorId];
        if (!fornecedor || !itens || itens.length === 0) {
            showToast("Não há itens no pedido para este fornecedor.", 'error');
            return;
        }

        let mensagem = `Olá, *${fornecedor.nome}*!%0AGostaria de fazer o seguinte pedido:%0A%0A`;
        let valorTotalPedido = 0;
        itens.forEach(item => {
            mensagem += `- ${item.qtd}x ${item.nome} (${item.unidade})`;
            if (item.observacao) {
                mensagem += ` (Obs: ${item.observacao})`;
            }
            mensagem += `%0A`;
            valorTotalPedido += item.custoTotal;
        });
        mensagem += `%0A*Valor Total Estimado: ${formatarValor(valorTotalPedido)}*`;

        window.open(`https://wa.me/${formatarWhatsappParaLink(fornecedor.whatsapp)}?text=${mensagem}`, '_blank');
        
        try {
            await addDocument("pedidosRealizados", {
                fornecedorId,
                fornecedorNome: fornecedor.nome,
                itens,
                solicitanteEmail: user.email,
                status: 'enviado',
                valorTotal: valorTotalPedido,
                criadoEm: new Date()
            });
            showToast("Pedido enviado e salvo no histórico!");
        } catch (error) {
            showToast("Erro ao salvar pedido no histórico: " + error.message, 'error');
        }
        
        const novoCarrinho = { ...carrinho };
        delete novoCarrinho[fornecedorId];
        setCarrinho(novoCarrinho);
    };
    
    const handleProductClick = (product) => {
        setSelectedItem(product);
        setItemData(prev => ({ ...prev, fornecedorId: product.bestPriceFornecedorId || '' }));
        setShowPricesModal(true);
        setSearchTerm('');
        setItemFormErrors({});
    };
    
    const handlePriceSelected = (priceRecord) => {
        setItemData(prev => ({ ...prev, fornecedorId: priceRecord.fornecedorId }));
        setShowPricesModal(false);
    };
    
    const resetItemSelection = () => {
        setSelectedItem(null);
        setSearchTerm('');
        setItemData({ qtd: 1, observacao: '', fornecedorId: '' });
        setItemFormErrors({});
    };

    return (
        <div className="card">
            <h2><IconeCarrinho /> Fazer um Pedido</h2>
            <div className="two-column-layout">
                <div className="left-column">
                    <div className="form-group">
                        <InputField
                            id="product-search-input"
                            data-cy="search-input-pedidos"
                            label="Procurar Item de Compra"
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Digite para procurar (ex: Farinha, Queijo)..."
                            aria-label="Procurar item de compra no catálogo"
                            icon={IconeBusca}
                        />
                    </div>

                    {searchTerm && filteredProducts.length > 0 && (
                        <div className="list-container" style={{maxHeight: '400px', border: '1px solid var(--cor-borda)', borderRadius: '4px', marginTop: '0.5rem'}}>
                            {filteredProducts.map(p => (
                                <div key={p.id} className="list-item" style={{cursor: 'pointer'}} onClick={() => handleProductClick(p)} data-cy="product-list-item" aria-label={`Selecionar item ${p.nome}`}>
                                    <div className="list-item-info">
                                        <p><strong className="truncate-text">{p.nome}</strong></p>
                                        {p.bestPrice ? (
                                            <p className="sub-text" style={{color: 'var(--cor-sucesso)'}}>
                                                Melhor Preço: {formatarValorPreciso(p.bestPrice)}/{p.unidadeAnalise} (Fornecedor: {p.bestPriceFornecedorName})
                                            </p>
                                        ) : <p className="sub-text">Sem preço registado.</p>}
                                    </div>
                                    <button type="button" className="button-primary small" onClick={(e) => { e.stopPropagation(); handleProductClick(p); }} aria-label={`Ver preços para ${p.nome}`}>Ver Preços</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {searchTerm && filteredProducts.length === 0 && (
                        <div className="empty-state">
                            <IconeBusca />
                            <h3>Nenhum Item Encontrado</h3>
                            <p className="sub-text">Verifique o nome ou registe o insumo na aba "Catálogo".</p>
                        </div>
                    )}
                    {!searchTerm && produtosDeCompra.length === 0 && (
                        <div className="empty-state">
                            <IconeCaixa />
                            <h3>Nenhum Insumo Registado</h3>
                            <p className="sub-text">Registe os seus insumos na aba "Catálogo" para começar a fazer pedidos.</p>
                        </div>
                    )}
                </div>

                <div className="right-column">
                    {showPricesModal && selectedItem && (
                        <ComparativePricesModal
                            item={selectedItem}
                            onSelectPrice={handlePriceSelected}
                            onClose={() => setShowPricesModal(false)}
                        />
                    )}

                    {selectedItem && (
                        <form onSubmit={handleAddItem} className="card" style={{padding: '1rem', marginBottom: '1.5rem'}}>
                            <h4 data-cy="selected-item-info">Item Selecionado: {selectedItem.nome}</h4>
                            <p className="sub-text" data-cy="selected-item-supplier">Fornecedor escolhido: <strong>{fornecedores.find(f => f.id === itemData.fornecedorId)?.nome || 'Nenhum selecionado'}</strong></p>
                            
                            <div className="form-group-inline">
                                <InputField
                                    id="item-qtd-input"
                                    data-cy="item-qtd-input"
                                    label="Quantidade"
                                    type="number"
                                    value={itemData.qtd}
                                    onChange={e => { setItemData({ ...itemData, qtd: e.target.value }); setItemFormErrors(prev => ({ ...prev, qtd: '' })); }}
                                    min="1"
                                    required
                                    error={itemFormErrors.qtd}
                                    aria-label="Quantidade do item de compra"
                                />
                                <InputField
                                    id="item-obs-input"
                                    label="Observação (Opcional)"
                                    type="text"
                                    value={itemData.observacao}
                                    onChange={e => setItemData({ ...itemData, observacao: e.target.value })}
                                    placeholder="Ex: Sem cebola"
                                    aria-label="Observação para o item"
                                />
                            </div>
                            <button type="button" onClick={() => setShowPricesModal(true)} className="button-secondary">Comparar Preços</button>
                            <button type="submit" data-cy="add-to-cart-button" className="button-primary" style={{marginLeft: '1rem'}} disabled={!itemData.fornecedorId || isAddingToCart}>
                                {isAddingToCart ? 'A adicionar...' : 'Adicionar ao Carrinho'}
                            </button>
                            <button type="button" onClick={resetItemSelection} className="button-link">Cancelar</button>
                        </form>
                    )}

                    <h3>Itens no Carrinho</h3>
                    <div className="list-container" style={{maxHeight: 'auto', border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem'}}>
                        {Object.keys(carrinho).length > 0 ? Object.keys(carrinho).map(fornecedorId => {
                            const fornecedor = fornecedores.find(f => f.id === fornecedorId);
                            return (
                                <div key={fornecedorId} style={{border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1rem'}}>
                                    <h4>Pedido para: {fornecedor?.nome || 'Fornecedor Desconhecido'}</h4>
                                    {carrinho[fornecedorId].map((item, index) => (
                                        <div key={index} className="list-item">
                                            <span>{item.qtd}x {item.nome} {item.observacao && <em className="sub-text">({item.observacao})</em>}</span>
                                            <button className="button-icon" onClick={() => {
                                                const newCart = { ...carrinho };
                                                newCart[fornecedorId].splice(index, 1);
                                                if (newCart[fornecedorId].length === 0) {
                                                    delete newCart[fornecedorId];
                                                }
                                                setCarrinho(newCart);
                                            }} aria-label={`Remover ${item.nome} do carrinho`}><IconeLixeira /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleSendOrder(fornecedorId)} className="button-primary" style={{marginTop: '1rem'}} aria-label={`Enviar pedido para ${fornecedor?.nome}`}>Enviar Pedido via WhatsApp</button>
                                </div>
                            )
                        }) : (
                            <div className="empty-state" style={{border: 'none'}}>
                                <IconeCarrinho />
                                <h3>O seu Carrinho Está Vazio</h3>
                                <p className="sub-text">Selecione itens na lista ao lado para adicionar ao carrinho.</p>
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

# RelatoriosView.js
RELATORIOS_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState } from 'react';
import { IconeAnalises } from '../../utils/icons';
import AnaliseDeCustoInsumo from './AnaliseDeCustoInsumo';
import HistoricoView from './HistoricoView';
import HistoricoComprasFornecedorView from './HistoricoComprasFornecedorView';

const RelatoriosView = () => {
    const [activeTab, setActiveTab] = useState('analiseCusto'); // 'analiseCusto', 'historicoPedidos', 'historicoComprasFornecedor'

    return (
        <div>
            <div className="card">
                <h2><IconeAnalises /> Análises e Histórico</h2>
                <p>Analise os dados do seu negócio para tomar decisões mais inteligentes e visualize históricos importantes.</p>
            </div>

            <div className="variantes-tabs">
                <button className={activeTab === 'analiseCusto' ? 'active' : ''} onClick={() => setActiveTab('analiseCusto')}>
                    Análise de Custo de Insumos
                </button>
                <button className={activeTab === 'historicoPedidos' ? 'active' : ''} onClick={() => setActiveTab('historicoPedidos')}>
                    Histórico de Pedidos
                </button>
                <button className={activeTab === 'historicoComprasFornecedor' ? 'active' : ''} onClick={() => setActiveTab('historicoComprasFornecedor')}>
                    Histórico de Compras por Fornecedor
                </button>
            </div>

            {activeTab === 'analiseCusto' && <AnaliseDeCustoInsumo />}
            {activeTab === 'historicoPedidos' && <HistoricoView />}
            {activeTab === 'historicoComprasFornecedor' && <HistoricoComprasFornecedorView />}
        </div>
    );
};
export default RelatoriosView;
""")

# AnaliseDeCustoInsumo.js
ANALISE_CUSTO_INSUMO_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeGrafico } from '../../utils/icons';
import { formatarValorPreciso } from '../../utils/formatters';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SelectField from '../../components/ui/forms/SelectField';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnaliseDeCustoInsumo = () => {
    const { produtosDeCompra, fornecedores, loadingData } = useData();
    const [selectedItemId, setSelectedItemId] = useState('');

    const itemsWithHistory = useMemo(() => 
        produtosDeCompra.filter(p => p.historicoPrecos && p.historicoPrecos.length > 0), 
    [produtosDeCompra]);

    const selectedItem = useMemo(() => 
        itemsWithHistory.find(i => i.id === selectedItemId),
    [itemsWithHistory, selectedItemId]);

    const chartData = useMemo(() => {
        if (!selectedItem) return null;
        
        const latestPrices = {};
        selectedItem.historicoPrecos.forEach(rec => {
            // Garante que rec.dataCompra é um objeto Timestamp ou um objeto Date
            // Usa a data mais recente para determinar o preço atual de cada fornecedor
            const recordDate = rec.tipo === 'compra' ? rec.dataCompra : rec.dataOferta;
            const timestamp = recordDate.seconds ? recordDate.seconds : (recordDate instanceof Date ? recordDate.getTime() / 1000 : recordDate);

            if (!latestPrices[rec.fornecedorId] || timestamp > (latestPrices[rec.fornecedorId].timestamp)) {
                latestPrices[rec.fornecedorId] = { ...rec, timestamp: timestamp };
            }
        });
        const dataPoints = Object.values(latestPrices)
            .map(rec => ({ ...rec, fornecedorNome: fornecedores.find(f => f.id === rec.fornecedorId)?.nome || 'N/A' }))
            .sort((a,b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise);

        return {
            labels: dataPoints.map(d => d.fornecedorNome),
            datasets: [{
                label: `Custo por ${selectedItem.unidadeAnalise}`,
                data: dataPoints.map(d => d.precoPorUnidadeAnalise),
                backgroundColor: 'rgba(0, 51, 160, 0.6)', // Cor primária do tema
            }]
        }
    }, [selectedItem, fornecedores]);

    if (loadingData) return <div className="card"><h3>A carregar análise...</h3></div>;

    return (
        <div className="card">
            <h3><IconeGrafico /> Análise Comparativa de Custos</h3>
            <SelectField
                label="Selecione um item para comparar preços entre fornecedores"
                id="item-select"
                value={selectedItemId}
                onChange={e => setSelectedItemId(e.target.value)}
                options={[
                    { value: '', label: 'Escolha um item...', disabled: true },
                    ...itemsWithHistory.map(item => ({ value: item.id, label: item.nome }))
                ]}
            />
            {itemsWithHistory.length === 0 && (
                <div className="empty-state">
                    <IconeGrafico />
                    <h3>Nenhum Item com Histórico de Preços</h3>
                    <p className="sub-text">Registe compras ou ofertas para os seus insumos na aba "Catálogo" para ver este gráfico.</p>
                </div>
            )}

            {selectedItem && chartData && (
                <div style={{ height: '300px', position: 'relative', marginTop: '2rem' }}>
                    <Bar data={chartData} options={{ 
                        maintainAspectRatio: false, 
                        responsive: true, 
                        plugins: { 
                            legend: { display: false }, 
                            title: { display: true, text: `Comparativo para ${selectedItem.nome}` } 
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: `Preço por ${selectedItem.unidadeAnalise}`
                                }
                            }
                        }
                    }} />
                </div>
            )}
        </div>
    );
};
export default AnaliseDeCustoInsumo;
""")

# HistoricoView.js
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
            filtered = filtered.filter(pedido =>
                pedido.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pedido.itens.some(item => item.nome.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (filterDateStart) {
            const startDate = new Date(filterDateStart);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(pedido => {
                const pedidoDate = pedido.criadoEm.toDate ? pedido.criadoEm.toDate() : new Date(pedido.criadoEm.seconds * 1000);
                return pedidoDate >= startDate;
            });
        }

        if (filterDateEnd) {
            const endDate = new Date(filterDateEnd);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(pedido => {
                const pedidoDate = pedido.criadoEm.toDate ? pedido.criadoEm.toDate() : new Date(pedido.criadoEm.seconds * 1000);
                return pedidoDate <= endDate;
            });
        }

        return filtered;
    }, [allPedidos, searchTerm, filterDateStart, filterDateEnd]);

    const handleDeletePedido = (id) => {
        showConfirmationModal("Tem certeza que deseja apagar este pedido do histórico?", async () => {
            try {
                await deleteDocument("pedidosRealizados", id);
                showToast("Pedido apagado do histórico.");
            } catch (error) {
                showToast("Erro ao apagar pedido: " + error.message, 'error');
            }
        });
    };

    if (loadingData && allPedidos.length === 0) return <div className="card"><h3>A carregar Histórico...</h3></div>;

    return (
        <div className="card">
            <h3><IconeCarrinho /> Histórico de Pedidos</h3>
            <div className="form-group-inline">
                <InputField
                    label="Procurar"
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Procurar por fornecedor ou item..."
                    icon={IconeBusca}
                />
                <InputField
                    label="De:"
                    type="date"
                    value={filterDateStart}
                    onChange={e => setFilterDateStart(e.target.value)}
                    icon={IconeCalendario}
                />
                <InputField
                    label="Até:"
                    type="date"
                    value={filterDateEnd}
                    onChange={e => setFilterDateEnd(e.target.value)}
                    icon={IconeCalendario}
                />
            </div>
            <div className="list-container">
                {filteredPedidos.length > 0 ? filteredPedidos.map(pedido => (
                    <div key={pedido.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                            <strong>{pedido.fornecedorNome}</strong>
                            <span className="sub-text">{formatarData(pedido.criadoEm)}</span>
                        </div>
                        <ul style={{paddingLeft: '1rem', margin: '0.5rem 0'}}>
                            {pedido.itens.map((item, idx) => <li key={idx} className="sub-text">{item.qtd}x {item.nome}</li>)}
                        </ul>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                            <span>Total: {formatarValor(pedido.valorTotal)}</span>
                            <button className="button-icon" onClick={() => handleDeletePedido(pedido.id)}><IconeLixeira/></button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <IconeCarrinho />
                        <h3>Nenhum Pedido no Histórico</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
export default HistoricoView;
""")

# HistoricoComprasFornecedorView.js
HISTORICO_COMPRAS_FORNECEDOR_VIEW_JS_CONTENT = textwrap.dedent("""
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IconeCaminhao, IconeBusca, IconeCalendario } from '../../utils/icons';
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
        produtosDeCompra.forEach(insumo => {
            insumo.historicoPrecos.forEach(compra => {
                if (compra.fornecedorId === selectedFornecedorId) {
                    comprasDoFornecedor.push({
                        ...compra,
                        insumoNome: insumo.nome,
                        insumoUnidadeAnalise: insumo.unidadeAnalise,
                        id: `${insumo.id}-${compra.id || Math.random()}` // Add unique key
                    });
                }
            });
        });

        let filtered = comprasDoFornecedor.sort((a, b) => {
            const dateA = a.dataCompra?.toDate ? a.dataCompra.toDate() : (a.dataCompra || a.dataOferta); // Handle both types
            const dateB = b.dataCompra?.toDate ? b.dataCompra.toDate() : (b.dataCompra || b.dataOferta); // Handle both types
            return dateB - dateA;
        });

        if (searchTerm) {
            filtered = filtered.filter(compra =>
                compra.insumoNome.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [produtosDeCompra, selectedFornecedorId, searchTerm]);

    if (loadingData) return <div className="card"><h3>A carregar Histórico de Compras...</h3></div>;

    return (
        <div className="card">
            <h3><IconeCaminhao /> Histórico de Compras por Fornecedor</h3>
            <div className="form-group">
                <SelectField
                    label="Selecione um Fornecedor"
                    value={selectedFornecedorId}
                    onChange={e => setSelectedFornecedorId(e.target.value)}
                    options={[
                        { value: '', label: 'Selecione...', disabled: true },
                        ...fornecedores.map(f => ({ value: f.id, label: f.nome }))
                    ]}
                />
            </div>

            {selectedFornecedorId && (
                <>
                    <InputField
                        label="Procurar"
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Procurar insumo na compra..."
                        icon={IconeBusca}
                    />

                    <div className="list-container">
                        {filteredCompras.length > 0 ? filteredCompras.map(compra => (
                            <div key={compra.id} className="list-item">
                                <div className="list-item-info">
                                    <p><strong>{compra.insumoNome}</strong></p>
                                    <p className="sub-text">
                                        {compra.tipo === 'compra' ? 
                                            `Qtd: ${compra.quantidadeComprada} ${compra.unidadeComprada} | Preço Total: ${formatarValor(compra.precoTotalNota)} | ` :
                                            `Tipo: Oferta | `
                                        }
                                        Custo Unitário: {formatarValorPreciso(compra.precoPorUnidadeAnalise)}/{compra.insumoUnidadeAnalise}
                                    </p>
                                    <p className="sub-text">Data: {formatarData(compra.dataCompra || compra.dataOferta)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">
                                <IconeBusca />
                                <h3>Nenhuma Compra/Oferta Registada</h3>
                                <p className="sub-text">Nenhuma compra ou oferta encontrada para este fornecedor.</p>
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

# OnboardingView.js
ONBOARDING_VIEW_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import { useAuth } from '../../context/Auth';
import { useData } from '../../context/DataContext';
import { IconeCaminhao, IconeCheck, IconeCirculo } from '../../utils/icons';

const OnboardingView = () => {
    const { user, updateOnboardingStatus } = useAuth();
    const { fornecedores, produtosDeCompra, produtos } = useData();

    const checklist = [
        { text: 'Registar o seu primeiro fornecedor', isComplete: fornecedores.length > 0 },
        { text: 'Registar um item de compra (insumo)', isComplete: produtosDeCompra.length > 0 },
        { text: 'Registar uma compra para ter um custo', isComplete: produtosDeCompra.some(p => p.bestPrice) },
        { text: 'Criar a sua primeira Ficha Técnica', isComplete: produtos.length > 0 },
    ];
    const allComplete = checklist.every(item => item.isComplete);

    return (
        <div className="login-container">
            <div className="login-card card" style={{maxWidth: '600px'}}>
                <h1><IconeCaminhao /> Primeiros Passos!</h1>
                <p>Bem-vindo(a)! Complete os passos abaixo para configurar o sistema.</p>
                <div className="divider" />
                <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                    {checklist.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
                            <span style={{ marginRight: '1rem', color: item.isComplete ? 'var(--cor-sucesso)' : 'var(--cor-borda)' }}>
                                {item.isComplete ? <IconeCheck /> : <IconeCirculo />}
                            </span>
                            {item.text}
                        </li>
                    ))}
                </ul>
                <button onClick={() => updateOnboardingStatus(user.uid, true)} className="button-primary btn-full-width" style={{ marginTop: '1rem' }} disabled={!allComplete}>
                    {allComplete ? "Vamos Começar!" : "Complete os passos para continuar"}
                </button>
            </div>
        </div>
    );
};
export default OnboardingView;
""")

# ComparativePricesModal.js
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
        // Pega o preço mais recente de cada fornecedor (considerando compras e ofertas)
        item.historicoPrecos.forEach(rec => {
            const recordDate = rec.tipo === 'compra' ? rec.dataCompra : rec.dataOferta;
            const timestamp = recordDate.seconds ? recordDate.seconds : (recordDate instanceof Date ? recordDate.getTime() / 1000 : recordDate);

            if (!latestPrices[rec.fornecedorId] || timestamp > (latestPrices[rec.fornecedorId].timestamp)) {
                latestPrices[rec.fornecedorId] = { ...rec, timestamp: timestamp };
            }
        });
        return Object.values(latestPrices)
            .map(rec => ({ ...rec, fornecedorNome: fornecedores.find(f => f.id === rec.fornecedorId)?.nome || 'N/A' }))
            .sort((a, b) => a.precoPorUnidadeAnalise - b.precoPorUnidadeAnalise);
    }, [item, fornecedores]);

    return (
        <Modal title={`Preços para: "${item.nome}"`} onConfirm={onClose} confirmText="Fechar">
            <div className="list-container" style={{maxHeight: '300px'}}>
                {pricesBySupplier.length > 0 ? pricesBySupplier.map(price => (
                    <div key={price.id} className="list-item">
                        <div>
                            <p><strong>{price.fornecedorNome}</strong></p>
                            <p className="sub-text">Última {price.tipo === 'compra' ? 'compra' : 'oferta'}: {formatarData(price.dataCompra || price.dataOferta)}</p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <p><strong>{formatarValorPreciso(price.precoPorUnidadeAnalise)}/{item.unidadeAnalise}</strong></p>
                            <button type="button" className="button-primary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={() => onSelectPrice(price)}>Selecionar</button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state" style={{border: 'none'}}>
                        <IconeBusca />
                        <h3>Nenhum Histórico de Preços</h3>
                        <p className="sub-text">Registe compras ou ofertas para este insumo na aba "Catálogo" para comparar preços.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
export default ComparativePricesModal;
""")

# firestoreService.js
FIRESTORE_SERVICE_JS_CONTENT = textwrap.dedent("""
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const addDocument = (collectionName, data) => addDoc(collection(db, collectionName), { ...data, criadoEm: serverTimestamp() });
export const updateDocument = (collectionName, docId, data) => updateDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() });
export const deleteDocument = (collectionName, docId) => deleteDoc(doc(db, collectionName, docId));
export const setDocument = (collectionName, docId, data) => setDoc(doc(db, collectionName, docId), { ...data, atualizadoEm: serverTimestamp() }, { merge: true });
export const addDocumentToSubcollection = (parent, parentId, sub, data) => addDoc(collection(db, parent, parentId, sub), { ...data, criadoEm: serverTimestamp() });

/*
*** NOTA SOBRE CLOUD FUNCTIONS PARA AUTOMAÇÃO ***

Para uma aplicação de produção robusta, as seguintes automações devem ser implementadas
usando Firebase Cloud Functions:

1.  `onSaleFinalized`: Disparada quando uma venda é criada em `vendasPDV`.
    -   **Ação 1:** Debitar a quantidade de insumos correspondentes do `estoque`.
    -   **Ação 2:** Criar um novo documento de `faturamento` no Fluxo de Caixa.

2.  `onPurchaseOrOfferRegistered`: Disparada quando uma compra ou oferta é registada em `produtosDeCompra/{insumoId}/historicoPrecos`.
    -   **Ação 1 (para tipo 'compra'):** Incrementar a quantidade do insumo no `estoque`.
    -   **Ação 2 (para tipo 'compra', Opcional):** Criar um novo documento de `despesa` no Fluxo de Caixa.
    -   **Ação 3 (para ambos os tipos):** Recalcular e atualizar o campo `bestPrice` e `bestPriceFornecedorId` no documento pai `produtosDeCompra/{insumoId}`.
    -   **Ação 4:** Recalcular e atualizar o campo `cmvCalculado` em todos os `produtosFinais` que utilizam esse insumo.

Estas funções garantem a integridade dos dados e automatizam processos cruciais,
reduzindo a carga no frontend e a possibilidade de erro humano.
*/
""")

# icons.js
ICONS_JS_CONTENT = textwrap.dedent("""
import React from 'react';
import { Truck, ShoppingCart, Trash2, Pencil, LogOut, Search, LayoutDashboard, FileText, Settings, DollarSign, Calendar, Box, Package, Menu, X, BarChart, CheckCircle, Circle, Plus, Minus } from 'lucide-react';

const Icon = ({ children, ...props }) => <span className="icon" {...props}>{children}</span>;

export const IconeCaminhao = (props) => <Icon {...props}><Truck size={24} /></Icon>;
export const IconeCarrinho = (props) => <Icon {...props}><ShoppingCart size={24} /></Icon>;
export const IconeLixeira = (props) => <Icon {...props}><Trash2 size={24} /></Icon>;
export const IconeEditar = (props) => <Icon {...props}><Pencil size={24} /></Icon>;
export const IconeLogout = (props) => <Icon {...props}><LogOut size={24} /></Icon>;
export const IconeBusca = (props) => <Icon {...props}><Search size={24} /></Icon>;
export const IconeCatalogo = (props) => <Icon {...props}><BookOpen size={24} /></Icon>; // Ícone mais adequado para catálogo
export const IconeDashboard = (props) => <Icon {...props}><LayoutDashboard size={24} /></Icon>;
export const IconeFichaTecnica = (props) => <Icon {...props}><FileText size={24} /></Icon>;
export const IconeConfiguracoes = (props) => <Icon {...props}><Settings size={24} /></Icon>; // Ícone de engrenagem para configurações/catálogo
export const IconeCheck = (props) => <Icon {...props}><CheckCircle size={24} /></Icon>;
export const IconeCirculo = (props) => <Icon {...props}><Circle size={24} /></Icon>;
export const IconeMais = (props) => <Icon {...props}><Plus size={24} /></Icon>;
export const IconeRemover = (props) => <Icon {...props}><Minus size={24} /></Icon>;
export const IconeAnalises = (props) => <Icon {...props}><BarChart size={24} /></Icon>; // Ícone mais adequado para análises/gráficos
export const IconeGrafico = (props) => <Icon {...props}><BarChart size={24} /></Icon>; // Reutilizando para gráfico
export const IconeDinheiro = (props) => <Icon {...props}><DollarSign size={24} /></Icon>;
export const IconeCalendario = (props) => <Icon {...props}><Calendar size={24} /></Icon>;
export const IconeCaixa = (props) => <Icon {...props}><Box size={24} /></Icon>; // Ícone mais adequado para insumos/caixa
export const IconeEstoque = (props) => <Icon {...props}><Package size={24} /></Icon>; // Ícone mais adequado para estoque
export const IconePdv = (props) => <Icon {...props}><Store size={24} /></Icon>; // Ícone mais adequado para PDV
export const IconeMenu = (props) => <Icon {...props}><Menu size={24} /></Icon>;
export const IconeFechar = (props) => <Icon {...props}><X size={24} /></Icon>;
""")

# formatters.js
FORMATTERS_JS_CONTENT = textwrap.dedent("""
export const formatarWhatsappParaLink = (numeroInput) => {
    let digitos = (numeroInput || '').replace(/\\D/g, '');
    if (!digitos) return '';
    if (digitos.length >= 12 && digitos.startsWith('55')) return digitos; // Já tem DDI e 9º dígito
    if (digitos.length === 11 && digitos.startsWith('9', 2)) return `55${digitos}`; // Celular com 9º dígito
    if (digitos.length === 10) return `55${digitos}`; // Fixo ou celular sem 9º dígito
    return `55${digitos}`; // Fallback, tenta adicionar 55
};
export const formatarWhatsappParaExibicao = (numeroSalvo) => {
    const digitos = String(numeroSalvo || '').replace(/\\D/g, '');
    const num = digitos.startsWith('55') ? digitos.substring(2) : digitos;
    if (num.length === 11) return `(${num.substring(0, 2)}) ${num.substring(2, 7)}-${num.substring(7)}`;
    if (num.length === 10) return `(${num.substring(0, 2)}) ${num.substring(2, 6)}-${num.substring(6)}`;
    return numeroSalvo;
};
export const formatarValor = (valor) => typeof valor === 'number' ? `R$ ${valor.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
export const formatarValorPreciso = (valor) => typeof valor === 'number' ? `R$ ${valor.toFixed(5).replace('.', ',')}` : 'N/A';
export const formatarData = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Verifica se é um objeto Timestamp do Firebase ou um objeto Date
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
        "cypress.config.js": CYPRESS_CONFIG_JS_CONTENT,
        "postcss.config.js": POSTCSS_CONFIG_JS_CONTENT, # Adicionado explicitamente
        "tailwind.config.js": textwrap.dedent("""
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
        """), # Adicionado explicitamente
        "cypress": { 
            "e2e": { 
                "full_system_flow.cy.js": FULL_SYSTEM_FLOW_CY_JS_CONTENT # Teste Cypress atualizado
            } 
        },
        "public": { 
            "index.html": INDEX_HTML_CONTENT,
            "favicon.ico": "", # Arquivo vazio, pode ser substituído
            "logo192.png": "", # Arquivo vazio, pode ser substituído
            "logo512.png": "", # Arquivo vazio, pode ser substituído
            "manifest.json": '{"short_name":"GestãoPRO","name":"Sistema de Gestão PRO","start_url":".","display":"standalone","theme_color":"#000000","background_color":"#ffffff"}',
        },
        "src": {
            "App.css": APP_CSS_CONTENT,
            "App.js": APP_JS_CONTENT,
            "firebase.js": FIREBASE_JS_CONTENT,
            "index.css": INDEX_CSS_CONTENT,
            "index.js": INDEX_JS_CONTENT,
            "components": {
                "auth": { "AccessSelectionPage.js": ACCESS_SELECTION_PAGE_JS_CONTENT },
                "ui": {
                    "Modal.js": MODAL_JS_CONTENT,
                    "forms": {
                        "InputField.js": INPUT_FIELD_JS_CONTENT,
                        "SelectField.js": SELECT_FIELD_JS_CONTENT,
                        "__tests__": {
                            "InputField.test.js": INPUT_FIELD_TEST_JS_CONTENT,
                            "SelectField.test.js": SELECT_FIELD_TEST_JS_CONTENT,
                        }
                    }
                }
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
                        "GerenciarPrecosInsumosTab.js": GERENCIAR_PRECOS_INSUMOS_TAB_JS_CONTENT, # Nova aba
                    }
                },
                "cmv": { "CmvView.js": CMV_VIEW_JS_CONTENT },
                "estoque": { "EstoqueView.js": ESTOQUE_VIEW_JS_CONTENT },
                "pdv": { "PdvView.js": PDV_VIEW_JS_CONTENT },
                "fluxoDeCaixa": { "FluxoDeCaixaView.js": FLUXO_DE_CAIXA_VIEW_JS_CONTENT },
                "pedidos": { "PedidosView.js": PEDIDOS_VIEW_JS_CONTENT },
                "relatorios": {
                    "RelatoriosView.js": RELATORIOS_VIEW_JS_CONTENT,
                    "AnaliseDeCustoInsumo.js": ANALISE_CUSTO_INSUMO_JS_CONTENT,
                    "HistoricoView.js": HISTORICO_VIEW_JS_CONTENT,
                    "HistoricoComprasFornecedorView.js": HISTORICO_COMPRAS_FORNECEDOR_VIEW_JS_CONTENT
                },
                "onboarding": { "OnboardingView.js": ONBOARDING_VIEW_JS_CONTENT },
                "ComparativePricesModal": { "ComparativePricesModal.js": COMPARATIVE_PRICES_MODAL_JS_CONTENT }
            },
            "services": { "firestoreService.js": FIRESTORE_SERVICE_JS_CONTENT },
            "utils": {
                "formatters.js": FORMATTERS_JS_CONTENT,
                "icons.js": ICONS_JS_CONTENT,
                "__tests__": {
                    "formatters.test.js": FORMATTERS_TEST_JS_CONTENT,
                }
            }
        }
    },
    # Nova pasta para as Cloud Functions
    "my-functions": {
        "functions": {
            "package.json": FUNCTIONS_PACKAGE_JSON_CONTENT,
            "index.js": textwrap.dedent("""
                // my-functions/functions/index.js

                const functions = require('firebase-functions');
                const admin = require('firebase-admin');
                admin.initializeApp();

                const db = admin.firestore();

                // --- FUNÇÃO 1: Venda Finalizada (PDV) ---
                exports.onSaleFinalized = functions.firestore.document('vendasPDV/{saleId}')
                    .onCreate(async (snapshot, context) => {
                        const venda = snapshot.data();
                        const saleId = context.params.saleId;
                        const { itensVendidos, valorTotal, dataVenda } = venda;

                        console.log(`Nova venda ${saleId} registrada. Valor total: R$${valorTotal}`);

                        // 1. Lançar no Faturamento (Fluxo de Caixa)
                        try {
                            await db.collection('faturamento').add({
                                valor: valorTotal,
                                data: dataVenda || admin.firestore.FieldValue.serverTimestamp(),
                                descricao: `Venda PDV #${saleId}`,
                                criadoEm: admin.firestore.FieldValue.serverTimestamp()
                            });
                            console.log(`Faturamento para venda ${saleId} registrado com sucesso.`);
                        } catch (error) {
                            console.error(`Erro ao registrar faturamento para venda ${saleId}:`, error);
                        }

                        // 2. Lógica para Debitar Estoque
                        for (const itemVendido of itensVendidos) {
                            const { productId, variantName, quantity } = itemVendido;
                            
                            console.log(`Processando item: ${quantity}x ${itemVendido.productName} (${variantName})`);

                            try {
                                const produtoFinalDoc = await db.collection('produtosFinais').doc(productId).get();
                                if (!produtoFinalDoc.exists) {
                                    console.warn(`Produto final ${productId} não encontrado. Não é possível debitar estoque.`);
                                    continue;
                                }
                                const produtoFinalData = produtoFinalDoc.data();
                                const varianteData = produtoFinalData.variantes.find(v => v.nomeVariante === variantName);

                                if (!varianteData || !varianteData.fichaTecnica) {
                                    console.warn(`Ficha técnica não encontrada para ${itemVendido.productName} (${variantName}).`);
                                    continue;
                                }

                                for (const insumoDeFicha of varianteData.fichaTecnica) {
                                    const insumoId = insumoDeFicha.itemDeCompraId;
                                    const qtdPorUnidadeDeProduto = insumoDeFicha.quantidade;
                                    const unidadeInsumoFicha = insumoDeFicha.unidade;

                                    const quantidadeTotalInsumoParaDebitar = (qtdPorUnidadeDeProduto * quantity);
                                    
                                    // Buscar a unidade de análise real do insumo para conversão
                                    const insumoRef = await db.collection('produtosDeCompra').doc(insumoId).get();
                                    const insumoRealData = insumoRef.data();
                                    
                                    let quantidadeAjustadaParaEstoque = quantidadeTotalInsumoParaDebitar;
                                    let unidadeEstoque = unidadeInsumoFicha; // Default para a unidade da ficha

                                    if(insumoRealData && insumoRealData.unidadeAnalise) {
                                        unidadeEstoque = insumoRealData.unidadeAnalise;
                                        // Exemplo de conversão: se a ficha usa 'g' e o estoque 'kg'
                                        if (unidadeInsumoFicha === 'g' && unidadeEstoque === 'kg') {
                                            quantidadeAjustadaParaEstoque = quantidadeTotalInsumoParaDebitar / 1000;
                                        } else if (unidadeInsumoFicha === 'ml' && unidadeEstoque === 'L') {
                                            quantidadeAjustadaParaEstoque = quantidadeTotalInsumoParaDebitar / 1000;
                                        }
                                        // Adicione outras conversões conforme necessário (ex: 'un' para 'un')
                                    }
                                    
                                    const estoqueDocRef = db.collection('estoque').doc(insumoId);
                                    await estoqueDocRef.update({
                                        quantidade: admin.firestore.FieldValue.increment(-quantidadeAjustadaParaDebitar)
                                    });
                                    console.log(`Estoque de insumo ${insumoId} debitado em ${quantidadeAjustadaParaDebitar} ${unidadeEstoque} para venda ${saleId}.`);
                                }
                            } catch (error) {
                                console.error(`Erro ao processar estoque para item ${productId} na venda ${saleId}:`, error);
                            }
                        }
                        return null;
                    });

                // --- FUNÇÃO 2: Atualização de Preços e CMV ---
                exports.onPurchaseOrOfferRegistered = functions.firestore.document('produtosDeCompra/{insumoId}/historicoPrecos/{priceRecordId}')
                    .onCreate(async (snapshot, context) => {
                        const insumoId = context.params.insumoId;
                        console.log(`Novo registro de preço para insumo ${insumoId}.`);

                        // 1. Recalcular o 'bestPrice' e 'bestPriceFornecedorId' para o insumo pai
                        const historicoRef = db.collection('produtosDeCompra').doc(insumoId).collection('historicoPrecos');
                        // Busca o melhor preço (menor precoPorUnidadeAnalise) de todos os registros (compras e ofertas)
                        const historicoSnapshot = await historicoRef.orderBy('precoPorUnidadeAnalise', 'asc').limit(1).get();

                        let bestPrice = null;
                        let bestPriceFornecedorId = null;

                        if (!historicoSnapshot.empty) {
                            const bestRecord = historicoSnapshot.docs[0].data();
                            bestPrice = bestRecord.precoPorUnidadeAnalise;
                            bestPriceFornecedorId = bestRecord.fornecedorId;
                            console.log(`Novo melhor preço para ${insumoId}: ${bestPrice} do fornecedor ${bestPriceFornecedorId}`);
                        } else {
                            console.log(`Nenhum preço encontrado para insumo ${insumoId}.`);
                        }
                        
                        await db.collection('produtosDeCompra').doc(insumoId).update({
                            bestPrice: bestPrice,
                            bestPriceFornecedorId: bestPriceFornecedorId,
                            atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
                        });

                        // 2. (OPCIONAL) Se o tipo for 'compra', registre como despesa e/ou atualize estoque
                        const priceRecordData = snapshot.data();
                        if (priceRecordData.tipo === 'compra') {
                            try {
                                await db.collection('despesas').add({
                                    valor: priceRecordData.precoTotalNota,
                                    data: priceRecordData.dataCompra || admin.firestore.FieldValue.serverTimestamp(),
                                    descricao: `Compra de ${insumoId} - ${priceRecordData.quantidadeComprada}${priceRecordData.unidadeComprada}`,
                                    categoria: 'Insumos',
                                    criadoEm: admin.firestore.FieldValue.serverTimestamp()
                                });
                                console.log(`Despesa registrada para compra de insumo ${insumoId}.`);

                                // Lógica para incrementar estoque aqui (similar à baixa, mas inversa)
                                // Você precisaria da unidade de análise do insumo para a conversão correta
                                const insumoDoc = await db.collection('produtosDeCompra').doc(insumoId).get();
                                const insumoData = insumoDoc.data();
                                if (insumoData) {
                                    let quantidadeAIncrementar = priceRecordData.quantidadeComprada;
                                    // Exemplo de conversão: se a compra foi em 'g' e o estoque é 'kg'
                                    if (priceRecordData.unidadeComprada === 'g' && insumoData.unidadeAnalise === 'kg') {
                                        quantidadeAIncrementar = priceRecordData.quantidadeComprada / 1000;
                                    } else if (priceRecordData.unidadeComprada === 'ml' && insumoData.unidadeAnalise === 'L') {
                                        quantidadeAIncrementar = priceRecordData.quantidadeComprada / 1000;
                                    }
                                    
                                    const estoqueDocRef = db.collection('estoque').doc(insumoId);
                                    await estoqueDocRef.set({
                                        insumoId: insumoId,
                                        nome: insumoData.nome,
                                        unidadeAnalise: insumoData.unidadeAnalise,
                                        quantidade: admin.firestore.FieldValue.increment(quantidadeAIncrementar)
                                    }, { merge: true }); // Usar merge para criar se não existir, ou atualizar
                                    console.log(`Estoque de ${insumoId} incrementado em ${quantidadeAIncrementar} ${insumoData.unidadeAnalise}.`);
                                }

                            } catch (error) {
                                console.error(`Erro ao processar compra de insumo ${insumoId}:`, error);
                            }
                        }

                        // 3. Recalcular CMV de Produtos Finais que usam este insumo
                        // Esta é uma operação que pode ser custosa se houver muitos produtos.
                        // Você precisaria buscar todos os produtos finais que contêm este insumo
                        // em sua ficha técnica e recalcular o CMV de suas variantes.
                        // Exemplo (requer índices no Firestore para 'variantes.fichaTecnica.itemDeCompraId'):
                        // const produtosFinaisQueUsamInsumo = await db.collection('produtosFinais')
                        //     .where('variantes.fichaTecnica.itemDeCompraId', 'array-contains', insumoId)
                        //     .get();
                        // for (const doc of produtosFinaisQueUsamInsumo.docs) {
                        //     const produtoData = doc.data();
                        //     const updatedVariantes = produtoData.variantes.map(v => {
                        //         const custoTotalItens = v.fichaTecnica.reduce((acc, item) => {
                        //             if (item.itemDeCompraId === insumoId) {
                        //                 // Recalcular custo deste item com o novo bestPrice
                        //                 let quantidadeEmUnidadeAnalise = item.quantidade;
                        //                 // Adicione lógica de conversão de unidade aqui se necessário
                        //                 // Ex: se item.unidade é 'g' e insumoData.unidadeAnalise é 'kg'
                        //                 if (item.unidade === 'g' && insumoData.unidadeAnalise === 'kg') {
                        //                     quantidadeEmUnidadeAnalise = item.quantidade / 1000;
                        //                 }
                        //                 return acc + (quantidadeEmUnidadeAnalise * bestPrice);
                        //             }
                        //             return acc + item.custo; // Manter custo de outros insumos
                        //         }, 0);
                        //         const custoEmbalagem = parseFloat(String(v.custoEmbalagem || '0').replace(',', '.'));
                        //         const custoOperacional = parseFloat(String(v.custoOperacional || '0').replace(',', '.'));
                        //         const cmvCalculado = custoTotalItens + custoEmbalagem + custoOperacional;
                        //         return { ...v, cmvCalculado };
                        //     });
                        //     await db.collection('produtosFinais').doc(doc.id).update({
                        //         variantes: updatedVariantes,
                        //         atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
                        //     });
                        //     console.log(`CMV do produto final ${doc.id} atualizado.`);
                        // }
                        console.log(`Recálculo de CMV para produtos finais utilizando ${insumoId} necessário.`);

                        return null;
                    });
            """)
        }
    }
}


def create_project_structure(base_path, structure):
    """
    Cria recursivamente diretórios e ficheiros com base na estrutura de dicionário fornecida.
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
                print(f"Erro ao escrever o ficheiro {current_path}: {e}")


def main():
    """
    Função principal para iniciar a criação da estrutura do projeto.
    """
    project_root = "sistema-gestao-final"
    functions_root = "my-functions"

    print(f"A iniciar a criação da estrutura do projeto consolidado em: '{project_root}'")
    
    # A estrutura do dicionário já tem a pasta raiz, então passamos o diretório atual '.'
    create_project_structure('.', PROJECT_STRUCTURE)
    
    print("\n" + "="*50)
    print("✅ Estrutura do projeto final criada com sucesso!")
    print("="*50)
    print("\nPróximos passos para o **Sistema de Gestão (React)**:")
    print(f"1. Navegue até à pasta do projeto:")
    print(f"   cd {project_root}")
    print("\n2. **MUITO IMPORTANTE:** Abra o ficheiro 'src/firebase.js' e preencha com as suas credenciais REAIS do Firebase.")
    print("\n3. Instale as dependências (requer Node.js e npm):")
    print("   npm install")
    print("\n4. Inicie o servidor de desenvolvimento:")
    print("   npm start")
    print("\n5. A aplicação irá agora mostrar a tela de login. Para testar, crie um utilizador no painel do Firebase (ex: gestor@exemplo.com) e use as credenciais para aceder.")
    print("\n6. Para popular o banco de dados com dados de exemplo (fornecedores, produtos, etc.), descomente a linha `// seedData();` no ficheiro `src/App.js` e recarregue a aplicação uma vez. Lembre-se de comentar novamente após a população para evitar re-criação de dados.")
    
    print("\n" + "="*50)
    print("Próximos passos para as **Cloud Functions (Backend)**:")
    print(f"1. Navegue até à pasta das funções:")
    print(f"   cd {functions_root}")
    print("\n2. Inicialize o projeto de funções Firebase (se ainda não o fez):")
    print("   firebase init functions")
    print("   (Escolha 'Functions', selecione seu projeto Firebase, JavaScript, N para ESLint, N para instalar dependências)")
    print("\n3. Navegue para a subpasta 'functions' e instale as dependências:")
    print(f"   cd functions")
    print("   npm install")
    print("\n4. Volte para a pasta 'my-functions' e inicie os emuladores:")
    print(f"   cd ..")
    print("   firebase emulators:start")
    print("\n5. Para executar os testes Cypress completos, certifique-se de que a aplicação React está a ser executada (npm start) e os emuladores Firebase também (firebase emulators:start). Em outro terminal, execute:")
    print(f"   cd {project_root}")
    print("   npm run cypress:open")
    print("\n**NOTA:** As funções de estoque e CMV no lado do servidor (Cloud Functions) têm lógica complexa de conversão de unidades e busca de dados. O código fornecido é um esqueleto e pode precisar de adaptações adicionais para a sua lógica de negócio específica e para garantir a performance e a integridade dos dados em produção.")


if __name__ == "__main__":
    main()
