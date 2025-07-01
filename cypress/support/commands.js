// cypress/support/commands.js

/**
 * @memberof cy
 * @method login
 * @param {string} email
 * @param {string} password
 * @description Realiza o login na aplicação e aguarda o dashboard.
 */
Cypress.Commands.add('login', (email, password) => {
    // cy.session é ótimo, mas para este fluxo único, o login direto é mais claro.
    // Se houvesse múltiplos 'it' blocks, cy.session seria ideal.
    cy.visit('/');
    cy.get('[data-cy=input-email-login]', { timeout: 15000 }).should('be.visible').type(email);
    cy.get('[data-cy=input-senha-login]').type(password);
    cy.get('[data-cy=btn-login-submit]').click();
    cy.contains('h2', 'Dashboard Gerencial', { timeout: 15000 }).should('be.visible');
});

/**
 * @memberof cy
 * @method createSupplier
 * @param {object} supplier - O objeto do fornecedor {nome, whatsapp, observacoes}
 * @description Navega para a tela de fornecedores e cria um novo fornecedor.
 */
Cypress.Commands.add('createSupplier', (supplier) => {
    cy.log(`Criando fornecedor: ${supplier.nome}`);
    cy.contains('label', 'Nome').parent().find('input').clear().type(supplier.nome);
    cy.contains('label', 'WhatsApp').parent().find('input').clear().type(supplier.whatsapp);
    cy.contains('label', 'Observações').parent().find('input').clear().type(supplier.observacoes);
    cy.get('[data-cy=btn-adicionar-fornecedor]').click();
    cy.contains('Fornecedor salvo!').should('be.visible');
    cy.contains('div.list-item', supplier.nome).should('be.visible');
    cy.contains('button', 'Cancelar Edição').click(); // Limpa o formulário para o próximo
});

/**
 * @memberof cy
 * @method createSupply
 * @param {object} supply - O objeto do insumo {nome, unidade}
 * @description Navega para a tela de insumos e cria um novo insumo.
 */
Cypress.Commands.add('createSupply', (supply) => {
    cy.log(`Criando insumo: ${supply.nome}`);
    cy.contains('label', 'Nome do Insumo').parent().find('input').clear().type(supply.nome);
    cy.contains('label', 'Unidade para Análise de Custo').parent().find('select').select(supply.unidade);
    cy.contains('button', 'Registar Novo Insumo').click();
    cy.contains('Insumo registado!').should('be.visible');
    cy.contains('div.list-item', supply.nome).should('be.visible');
    cy.contains('button', 'Cancelar Edição').click(); // Limpa o formulário
});

/**
 * @memberof cy
 * @method registerPurchase
 * @param {object} purchase - O objeto da compra {nome, unidade, fornecedorNome, qtdCompra, precoTotalCompra}
 * @description Navega para a tela de registro de compra e registra uma nova compra.
 */
Cypress.Commands.add('registerPurchase', (purchase) => {
    cy.log(`Registrando compra para: ${purchase.nome}`);
    cy.contains('Registar Nova Compra').click();
    cy.get('h3').contains('Registar Nova Compra').should('be.visible');

    // Garante que os dropdowns estão populados antes de selecionar
    cy.get('select[name="insumoId"]').find('option', { timeout: 10000 }).should('have.length.greaterThan', 1);
    cy.get('select[name="fornecedorId"]').find('option', { timeout: 10000 }).should('have.length.greaterThan', 1);

    cy.get('select[name="insumoId"]').select(`${purchase.nome} (${purchase.unidade})`);
    cy.get('select[name="fornecedorId"]').select(purchase.fornecedorNome);

    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    cy.get('input[name="dataCompra"]').type(today);
    cy.get('input[name="quantidadeComprada"]').clear().type(purchase.qtdCompra);
    cy.get('input[name="precoTotalNota"]').clear().type(purchase.precoTotalCompra);

    cy.contains('button', 'Registar Compra').click();
    cy.contains(`Compra registada para ${purchase.nome}!`).should('be.visible');
    cy.contains('button', 'Limpar Formulário').click();
});
