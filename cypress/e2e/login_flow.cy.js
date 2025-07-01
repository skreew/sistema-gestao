// cypress/e2e/login_flow.cy.js

describe('Fluxo de Login do Sistema', () => {
  // NOTA: Para este teste passar, você precisa criar este utilizador
  // diretamente no painel de Autenticação do Firebase primeiro.
  const userEmail = 'admin@gmail.com';
  const userPassword = 'admin123';

  it('deve mostrar a página de login e permitir o acesso de um gestor', () => {
    cy.visit('/');

    // Verifica se o formulário de login está visível
    cy.contains('Aceder ao Sistema').should('be.visible');

    // Preenche os dados e faz o login
    cy.get('[data-cy=input-email-login]').type(userEmail);
    cy.get('[data-cy=input-senha-login]').type(userPassword);
    cy.get('[data-cy=btn-login-submit]').click();

    // Verifica se o dashboard é exibido após o login
    cy.contains('Dashboard Gerencial', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy=btn-logout]').should('be.visible');
  });
});