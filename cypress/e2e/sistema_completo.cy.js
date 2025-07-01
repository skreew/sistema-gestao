/**
 * cypress/e2e/2-full_crud_flow.cy.js
 * * Testa os fluxos de CRUD e a responsividade da aplicação.
 * Este teste integrado executa o fluxo completo em diferentes resoluções de tela.
 * Utiliza dados realistas para simular um ambiente de pizzaria/restaurante.
 */
describe('Testes E2E - Fluxo Completo e Responsividade', () => {

  // --- DADOS DE TESTE ---
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin123';

  // Lista de Fornecedores
  const suppliers = [
    { name: 'Distribuidora de Laticínios Friobom', phone: '11987654321' },
    { name: 'Rei do Queijo Atacadista', phone: '21988887777' },
    { name: 'Farinhas & Cia', phone: '31977776666' },
    { name: 'Tomates Pelados da Nona', phone: '41966665555' },
    { name: 'Frigorífico Boi Dourado', phone: '51955554444' },
    { name: 'Embutidos Charcutaria Premium', phone: '61944443333' },
    { name: 'Hortifruti Folha Verde', phone: '71933332222' },
    { name: 'Azeitonas & Conservas do Vale', phone: '81922221111' },
    { name: 'Doce Sabor Sobremesas', phone: '11911112222' },
    { name: 'Chocolates Finos Cacau Real', phone: '21922223333' },
    { name: 'Distribuidora de Bebidas Gole Certo', phone: '31933334444' },
    { name: 'Polpas de Fruta Norte a Sul', phone: '41944445555' },
    { name: 'Mundo das Embalagens', phone: '51955556666' },
    { name: 'Refrigeração Polar', phone: '61966667777' },
    { name: 'Produtos de Limpeza BrilhoTotal', phone: '71977778888' },
    { name: 'Uniformes & Cia', phone: '81988889999' },
    { name: 'Gráfica Impressão Rápida', phone: '11999990000' },
    { name: 'Gás de Cozinha Chama Azul', phone: '21900001111' },
    { name: 'Manutenção de Equipamentos SOS', phone: '31911112222' },
    { name: 'Dedetizadora Fim das Pragas', phone: '41922223333' }
  ];

  // Lista de Insumos
  const supplies = [
    // Pizzas
    { name: 'Farinha de Trigo Tipo 1', unit: 'kg' },
    { name: 'Molho de Tomate Pelado', unit: 'kg' },
    { name: 'Queijo Mussarela', unit: 'kg' },
    { name: 'Linguiça Calabresa Defumada', unit: 'kg' },
    { name: 'Azeitona Preta sem Caroço', unit: 'kg' },
    { name: 'Orégano Desidratado', unit: 'kg' },
    { name: 'Cebola Branca', unit: 'kg' },
    { name: 'Manjericão Fresco', unit: 'kg' },
    { name: 'Frango Desfiado Congelado', unit: 'kg' },
    { name: 'Requeijão Cremoso', unit: 'kg' },
    // Sobremesas
    { name: 'Chocolate em Pó 50% Cacau', unit: 'kg' },
    { name: 'Leite Condensado', unit: 'L' },
    { name: 'Creme de Leite UHT', unit: 'L' },
    { name: 'Limão Tahiti', unit: 'kg' },
    { name: 'Açúcar Refinado', unit: 'kg' },
    // Drinks
    { name: 'Cachaça Prata', unit: 'L' },
    { name: 'Gelo em Cubos', unit: 'kg' },
    { name: 'Polpa de Morango Congelada', unit: 'kg' },
    { name: 'Refrigerante Cola 2L', unit: 'un' },
    { name: 'Cerveja Pilsen Long Neck', unit: 'un' },
    // Outros
    { name: 'Caixa de Pizza 35cm', unit: 'un' },
  ];

  // O bloco 'before' executa uma vez antes de todos os testes.
  // Ideal para popular a base de dados de teste, evitando repetições.
  before(() => {
    // Faz o login e popula o banco de dados
    cy.session('loginAndSeed', () => {
      cy.visit('/');
      cy.get('[data-cy=input-email-login]').type(adminEmail);
      cy.get('[data-cy=input-senha-login]').type(adminPassword);
      cy.get('[data-cy=btn-login-submit]').click();
      cy.contains('Dashboard Gerencial').should('be.visible');
      
      // Função para cadastrar Fornecedores e Insumos
      const registerSuppliesAndSuppliers = () => {
        cy.get('[data-cy=nav-catalogo]').click();
        suppliers.forEach(s => {
          cy.get('[data-cy=input-fornecedor-nome]').clear().type(s.name);
          cy.get('[data-cy=input-fornecedor-whatsapp]').clear().type(s.phone);
          cy.get('[data-cy=btn-adicionar-fornecedor]').click();
          cy.contains('Fornecedor salvo!').should('be.visible');
          cy.get('.list-container').contains(s.name).should('be.visible');
        });

        cy.contains('Gerenciar Insumos').click();
        supplies.forEach(s => {
          cy.get('input[placeholder="Ex: Farinha de Trigo"]').clear().type(s.name);
          cy.get('select').first().select(s.unit);
          cy.contains('Registar Novo Insumo').click();
          cy.contains('Insumo registado!').should('be.visible');
          cy.get('.list-container').contains(s.name).should('be.visible');
        });
      };
      
      // Função para registrar compras
      const registerPurchases = () => {
        cy.contains('Registar Nova Compra').click();
        const purchases = [
            { supply: 'Queijo Mussarela', supplier: 'Distribuidora de Laticínios Friobom', qty: 10, price: 350 },
            { supply: 'Queijo Mussarela', supplier: 'Rei do Queijo Atacadista', qty: 15, price: 480 },
            { supply: 'Farinha de Trigo Tipo 1', supplier: 'Farinhas & Cia', qty: 25, price: 100 },
            { supply: 'Linguiça Calabresa Defumada', supplier: 'Frigorífico Boi Dourado', qty: 5, price: 150 },
            { supply: 'Molho de Tomate Pelado', supplier: 'Tomates Pelados da Nona', qty: 10, price: 80 },
            { supply: 'Chocolate em Pó 50% Cacau', supplier: 'Doce Sabor Sobremesas', qty: 2, price: 90 },
            { supply: 'Leite Condensado', supplier: 'Doce Sabor Sobremesas', qty: 12, price: 96 },
            { supply: 'Cachaça Prata', supplier: 'Distribuidora de Bebidas Gole Certo', qty: 6, price: 120 },
            { supply: 'Limão Tahiti', supplier: 'Hortifruti Folha Verde', qty: 5, price: 25 },
            { supply: 'Açúcar Refinado', supplier: 'Farinhas & Cia', qty: 10, price: 40 },
            { supply: 'Caixa de Pizza 35cm', supplier: 'Mundo das Embalagens', qty: 100, price: 150 },
        ];
        purchases.forEach(p => {
          const supplyData = supplies.find(s => s.name === p.supply);
          cy.get('select[name="insumoId"]').select(`${p.supply} (${supplyData.unit})`);
          cy.get('select[name="fornecedorId"]').select(p.supplier);
          cy.get('input[name="quantidadeComprada"]').clear().type(p.qty);
          cy.get('input[name="precoTotalNota"]').clear().type(p.price);
          cy.contains('Registar Compra').click();
          cy.contains(`Compra registada para ${p.supply}!`).should('be.visible');
        });
      };

      registerSuppliesAndSuppliers();
      registerPurchases();
    });
  });

  // Lista de resoluções para testar
  const viewports = ['macbook-15', 'iphone-6'];

  viewports.forEach(viewport => {
    describe(`Testando na resolução: ${viewport}`, () => {
      
      beforeEach(() => {
        // Define a resolução da tela para este conjunto de testes
        cy.viewport(viewport);
        // Restaura a sessão de login para não precisar logar novamente
        cy.session([adminEmail, adminPassword], () => {
            cy.visit('/');
            cy.get('[data-cy=input-email-login]').type(adminEmail);
            cy.get('[data-cy=input-senha-login]').type(adminPassword);
            cy.get('[data-cy=btn-login-submit]').click();
            cy.contains('Dashboard Gerencial').should('be.visible');
        });
        cy.visit('/');
      });

      it('deve exibir o menu de navegação corretamente para a resolução', () => {
        if (viewport === 'iphone-6') {
          cy.get('.main-nav').should('not.be.visible');
          cy.get('.hamburger-menu-button').should('be.visible').click();
          cy.get('.main-nav').should('be.visible');
          cy.get('[data-cy=btn-logout-mobile]').should('be.visible');
        } else {
          cy.get('.main-nav').should('be.visible');
          cy.get('.hamburger-menu-button').should('not.be.visible');
          cy.get('[data-cy=btn-logout]').should('be.visible');
        }
      });

      it('deve criar Fichas Técnicas complexas e verificar o CMV', () => {
        cy.get('[data-cy=nav-fichas-tecnicas]').click();
        cy.contains('Gerenciar Produtos Finais').should('be.visible');

        cy.get('[data-cy=card-gerenciar-produtos-finais]').within(() => {
          cy.get('input[placeholder="Ex: Pizza"]').type('Pizza de Calabresa G');
          cy.get('input[placeholder="Ex: Pizzas Salgadas"]').type('Pizzas Tradicionais');
          
          cy.get('select').first().select('Farinha de Trigo Tipo 1 - R$ 4,00000/kg');
          cy.get('input[aria-label="Quantidade do item de compra"]').type('300');
          cy.get('button[aria-label="Adicionar item à ficha técnica"]').click();
          
          cy.get('select').first().select('Queijo Mussarela - R$ 32,00000/kg');
          cy.get('input[aria-label="Quantidade do item de compra"]').type('250');
          cy.get('button[aria-label="Adicionar item à ficha técnica"]').click();

          cy.get('select').first().select('Linguiça Calabresa Defumada - R$ 30,00000/kg');
          cy.get('input[aria-label="Quantidade do item de compra"]').type('150');
          cy.get('button[aria-label="Adicionar item à ficha técnica"]').click();
          
          cy.get('input[placeholder="1.50"]').type('1.50');
          cy.contains('CMV Total da Variante: R$ 15,20').should('be.visible');
          cy.contains('Salvar Novo Produto').click();
        });
        cy.contains('Produto salvo!').should('be.visible');
        cy.contains('Pizza de Calabresa G').should('be.visible');
      });

      it('deve adicionar itens ao estoque e verificar a listagem', () => {
        cy.get('[data-cy=nav-estoque]').click();
        cy.contains('Gestão de Estoque').should('be.visible');

        cy.get('select').first().select('Queijo Mussarela (kg)');
        cy.get('input[placeholder="Ex: 50"]').type('5');
        cy.contains('Registar Estoque').click();
        cy.contains('Estoque registado!').should('be.visible');

        cy.get('select').first().select('Farinha de Trigo Tipo 1 (kg)');
        cy.get('input[placeholder="Ex: 50"]').type('10');
        cy.contains('Registar Estoque').click();
        cy.contains('Estoque registado!').should('be.visible');

        cy.contains('Queijo Mussarela').parent().parent().contains('5 kg');
        cy.contains('Farinha de Trigo Tipo 1').parent().parent().contains('10 kg');
      });

      it('deve realizar uma venda no PDV e finalizar', () => {
        cy.get('[data-cy=nav-pdv]').click();
        cy.contains('Ponto de Venda (PDV)').should('be.visible');

        cy.get('select').first().select('Pizza de Calabresa G');
        cy.get('select').eq(1).select(1);
        cy.get('input[type="number"]').clear().type('2');
        cy.contains('Adicionar ao Carrinho').click();
        cy.contains(`2x Pizza de Calabresa G`).should('be.visible');
        cy.contains('Total: R$ 60,80').should('be.visible');

        cy.contains('Finalizar Venda').click();
        cy.get('[data-cy=modal-confirm-button]').click();
        cy.contains('Venda finalizada com sucesso!').should('be.visible');
        cy.contains('Carrinho Vazio').should('be.visible');
      });

      it('deve registrar lançamentos no Fluxo de Caixa e verificar o relatório', () => {
        cy.get('[data-cy=nav-fluxo-caixa]').click();
        cy.contains('Fluxo de Caixa').should('be.visible');

        cy.get('select').first().select('faturamento');
        cy.get('input[placeholder="0.00"]').type('2500');
        cy.get('textarea').type('Recebimento iFood');
        cy.contains('button', 'Registar').click();
        cy.contains('Faturação registada com sucesso!').should('be.visible');

        cy.get('select').first().select('despesa');
        cy.get('input[placeholder="0.00"]').type('350');
        cy.get('select').eq(1).select('Contas de Consumo');
        cy.get('textarea').type('Conta de Energia');
        cy.contains('button', 'Registar').click();
        cy.contains('Despesa registada com sucesso!').should('be.visible');

        cy.contains('button', 'Relatório').click();
        cy.contains('Recebimento iFood').should('be.visible');
        cy.contains('Conta de Energia').should('be.visible');
        cy.contains('Resultado Líquido: R$ 2.150,00').should('be.visible');
      });
    });
  });
});
