// cypress/e2e/gestao_fluxos_principais.cy.js

/**
 * Suite de testes para o fluxo de autenticação.
 * Este script usa interceptadores para garantir a sincronização com o Firebase.
 */
describe('Fluxo de Autenticação', () => {

  // Antes de cada teste, visita a página e garante que não há usuário logado.
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Lógica de logout robusta: procura por um elemento que só existe quando logado.
    cy.get('body').then($body => {
      if ($body.find('.main-header').length) {
        cy.contains('button', 'Sair').click();
      }
    });
    // Garante que a página de login foi renderizada antes de prosseguir.
    cy.contains('h1', 'Sistema de Pedidos', { timeout: 10000 }).should('be.visible');
  });

  it('deve permitir que um novo colaborador se registre e faça login', () => {
    // Intercepta as requisições de rede para sincronização
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/v1/accounts:signUp?**').as('registerRequest');
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?**').as('loginRequest');
    cy.intercept('POST', '**/firestore.googleapis.com/**').as('firestoreWrite');

    const emailColaborador = `colaborador_${Date.now()}@teste.com`;

    // --- Etapa de Registro ---
    cy.contains('button', 'Registrar Novo Colaborador').click();
    cy.get('input[placeholder="E-mail"]').type(emailColaborador);
    cy.get('input[placeholder*="mínimo 6 caracteres"]').type('senha123');
    cy.get('form').contains('button', 'Registrar').click();

    // Espera a confirmação de registro e a escrita no Firestore
    cy.wait('@registerRequest');
    cy.wait('@firestoreWrite');

    cy.contains('Cadastro realizado com sucesso!', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'OK').click();

    // --- Etapa de Login ---
    cy.contains('h3', 'Acessar o Sistema', { timeout: 10000 }).should('be.visible');
    cy.get('input[placeholder="E-mail"]').type(emailColaborador);
    cy.get('input[placeholder="Senha"]').type('senha123');
    cy.get('form').contains('button', 'Entrar').click();

    // Espera a confirmação de login
    cy.wait('@loginRequest');

    // --- Verificação Final ---
    cy.contains('.user-info', `Bem-vindo, ${emailColaborador}`, { timeout: 10000 }).should('be.visible');
    cy.contains('.nav-button', 'Dashboard').should('not.exist');
  });
});

/**
 * Suite de testes para os fluxos principais do GESTOR.
 */
describe('Fluxos do Gestor', () => {
  
  beforeEach(() => {
    // Intercepta as requisições para aguardá-las
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/**').as('firebaseAuth');
    cy.intercept('POST', '**/firestore.googleapis.com/**').as('firestoreWrite');
    
    cy.visit('http://localhost:3000');
    
    // Lógica de logout robusta
    cy.get('body').then($body => {
      if ($body.find('.main-header').length) {
        cy.contains('button', 'Sair').click();
      }
    });

    cy.contains('h1', 'Sistema de Pedidos', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'Entrar').click();
    cy.get('input[placeholder="E-mail"]').type('admin@gmail.com');
    cy.get('input[placeholder="Senha"]').type('admin123');
    cy.get('form').contains('button', 'Entrar').click();
    
    // Espera o login ser processado
    cy.wait('@firebaseAuth');
    
    // Aumenta o timeout para a verificação, dando tempo para o React renderizar
    cy.contains('.user-info', 'Bem-vindo, admin@gmail.com', { timeout: 10000 }).should('be.visible');
  });

  it('deve cadastrar um novo fornecedor com sucesso', () => {
    const nomeFornecedor = `Fornecedor Cypress ${Date.now()}`;
    
    cy.contains('.nav-button', 'Cadastros').click();
    
    cy.contains('h2', 'Gerenciar Fornecedores').parent('.card').within(() => {
      cy.get('input[placeholder="Nome da empresa"]').type(nomeFornecedor);
      cy.get('input[placeholder="(XX) XXXXX-XXXX"]').type('1199998888');
      cy.get('input[placeholder="Ex: Entregas às terças"]').type('Teste automatizado');
      cy.contains('button', 'Adicionar Fornecedor').click();
    });
    
    // Espera a chamada de escrita no Firestore
    cy.wait('@firestoreWrite');

    cy.contains('Fornecedor salvo!', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'OK').click();
    
    cy.contains('h2', 'Gerenciar Fornecedores').parent()
      .find('.list-container')
      .should('contain', nomeFornecedor);
  });
});
