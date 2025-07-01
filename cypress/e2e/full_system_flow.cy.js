// cypress/e2e/test_ficha_tecnica.cy.js

// NOTA: A linha abaixo é necessária porque a configuração do seu Cypress
// (`supportFile: false`) não carrega os comandos personalizados automaticamente.
import '../support/commands.js';

describe('Teste Focado: Ficha Técnica', () => {
    let testData;

    // O hook `before` executa uma única vez antes de todos os testes no ficheiro.
    // Ele apenas carrega os dados do fixture.
    before(() => {
        cy.fixture('test-data.json').then((data) => {
            testData = data;
        });
    });

    it('Deve criar um produto final com uma Ficha Técnica, assumindo que os insumos já existem', () => {
        // Garante que os dados da fixture foram carregados antes de continuar.
        cy.wrap(null).should(() => {
            expect(testData, 'Os dados de teste da fixture devem estar carregados').to.not.be.undefined;
        });

        // 1. Login na aplicação.
        cy.login(testData.user.email, testData.user.password);

        // 2. Navega diretamente para a funcionalidade de Ficha Técnica (CMV).
        cy.log('--- INÍCIO DO TESTE: CRIAÇÃO DA FICHA TÉCNICA ---');
        cy.get('[data-cy=nav-cmv]').click();
        cy.contains('h2', 'Gerenciar Produtos Finais').should('be.visible');

        // 3. Preenche os dados do novo produto.
        const product = testData.finalProduct;
        const uniqueProductName = `${product.name} ${Cypress._.random(0, 1e6)}`; // Garante nome de produto único

        cy.contains('label', 'Nome do Produto').parent().find('input').type(uniqueProductName);
        cy.contains('label', 'Categoria').parent().find('input').type(product.category);
        cy.contains('label', 'Nome da Variante').parent().find('input').clear().type(product.variant.name);
        cy.contains('label', 'Custo Embalagem').parent().find('input').type(product.variant.packagingCost);
        cy.contains('label', 'Outros Custos').parent().find('input').type(product.variant.otherCosts);

        // 4. Adiciona cada item da receita à ficha técnica.
        product.recipe.forEach(item => {
            // NOTA: O teste agora assume que o insumo `item.name` já existe no sistema
            // e está disponível no dropdown.
            const supplyData = testData.supplies.find(s => s.name.startsWith(item.name));
            
            // Usa uma expressão regular para selecionar a opção que COMEÇA com o nome do insumo.
            // Isso torna o seletor mais flexível a textos adicionais (como preço).
            const selectRegex = new RegExp(`^${Cypress._.escapeRegExp(supplyData.name)}`);
            cy.get('select[aria-label="Selecione um item de compra"]').select(selectRegex);
            
            // Determina a unidade de medida para o input.
            const unit = supplyData.unit === 'kg' ? 'g' : (supplyData.unit === 'L' ? 'ml' : 'un');
            cy.contains('label', `Qtd (${unit})`).parent().find('input').clear().type(item.qty);
            
            // Adiciona o item e verifica se ele aparece na lista.
            cy.get('button[aria-label="Adicionar item à ficha técnica"]').click();
            cy.contains('div.list-item', `${supplyData.name} - ${item.qty} ${unit}`).should('be.visible');
        });

        // 5. Salva e valida a criação do produto.
        cy.get('[data-cy=cmv-total-variante]').should('contain.text', 'CMV Total da Variante: R$');
        cy.contains('button', 'Salvar Novo Produto').click();
        cy.contains('Produto salvo!').should('be.visible');
        
        // Validação final: Verifica se o produto recém-criado aparece na lista.
        cy.contains('h4', uniqueProductName).should('be.visible');
        cy.log('--- FIM DO TESTE DE FICHA TÉCNICA ---');
    });
});
