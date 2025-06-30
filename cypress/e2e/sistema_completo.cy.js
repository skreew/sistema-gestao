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
    cy.get('[data-cy=nav-catalogo]').should('be.visible');
  });
});

describe('Fluxos do Gestor', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/**').as('firebaseAuth');

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
        cy.get('[data-cy="btn-logout"]').should('be.visible');
      },
    });

    cy.visit('/');
    cy.contains('.user-info', 'Bem-vindo, admin@gmail.com', { timeout: 10000 }).should('be.visible');
  });

  it('deve navegar pelas novas abas do menu (gestor)', () => {
    cy.get('[data-cy=nav-dashboard]').click();
    cy.contains('h2', 'Dashboard Gerencial').should('be.visible');

    cy.get('[data-cy=nav-pedidos]').click();
    cy.contains('h2', 'Fazer um Pedido').should('be.visible');

    cy.get('[data-cy=nav-catalogo]').click();
    cy.contains('h2', 'Catálogo e Compras').should('be.visible');

    cy.get('[data-cy=nav-fichas-tecnicas]').click();
    cy.contains('h2', 'Gerenciar Produtos Finais (Fichas Técnicas)').should('be.visible');

    cy.get('[data-cy=nav-analises]').click();
    cy.contains('h2', 'Análises e Histórico').should('be.visible');

    cy.get('[data-cy=nav-financeiro]').click();
    cy.contains('h2', 'Fluxo de Caixa').should('be.visible');
  });
});