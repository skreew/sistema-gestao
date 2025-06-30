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
    // Colaborador agora pode acessar 'Catálogo' (antigo Cadastros)
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

    cy.get('[data-cy=nav-catalogo]').click(); // Nova data-cy para o Catálogo
    cy.contains('h2', 'Catálogo de Insumos e Fornecedores').should('be.visible');

    cy.get('[data-cy=nav-fichas-tecnicas]').click(); // Nova data-cy para Fichas Técnicas
    cy.contains('h2', 'Gerenciar Produtos Finais (Fichas Técnicas)').should('be.visible');

    cy.get('[data-cy=nav-analises]').click(); // Nova data-cy para Análises
    cy.contains('h2', 'Análises e Histórico').should('be.visible');
  });


  it('deve seguir o fluxo completo: cadastrar fornecedor, insumo com preço, ficha técnica e verificar CMV, e fazer pedido com comparação', () => {
    const fornecedorNome1 = `Fornecedor Teste ${Date.now()}`;
    const fornecedorNome2 = `Fornecedor Alternativo ${Date.now()}`;
    const insumoNome = `Açúcar Teste ${Date.now()}`;
    const produtoFinalNome = `Bolo de Açúcar ${Date.now()}`;

    // 1. Cadastrar Fornecedor 1
    cy.get('[data-cy=nav-catalogo]').click();
    cy.get('[data-cy=card-gerenciar-fornecedores]').within(() => {
        cy.get('[data-cy=input-fornecedor-nome]').type(fornecedorNome1);
        cy.get('[data-cy=input-fornecedor-whatsapp]').type('11987654321');
        cy.get('[data-cy=btn-adicionar-fornecedor]').click();
    });
    cy.contains('Fornecedor salvo!').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    cy.wait(500); // Dar tempo para o Firebase atualizar

    // 2. Cadastrar Fornecedor 2 (para comparação de preços)
    cy.get('[data-cy=card-gerenciar-fornecedores]').within(() => {
        cy.get('[data-cy=input-fornecedor-nome]').clear().type(fornecedorNome2);
        cy.get('[data-cy=input-fornecedor-whatsapp]').clear().type('21998765432');
        cy.get('[data-cy=btn-adicionar-fornecedor]').click();
    });
    cy.contains('Fornecedor salvo!').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    cy.wait(500); // Dar tempo para o Firebase atualizar

    // 3. Cadastrar Insumo e registrar primeira compra (Fornecedor 1, mais caro)
    // Navegar para a aba "Lista de Insumos" no Catálogo para ver o formulário
    cy.get('.variantes-tabs').contains('button', 'Lista de Insumos').click();
    cy.get('.card').contains('h3', 'Seus Insumos Cadastrados').should('be.visible');

    cy.get('.card').contains('h3', 'Registrar Nova Compra / Cadastrar Insumo').parent().within(() => {
        cy.get('input[name="nome"]').type(insumoNome);
        cy.get('select[name="unidadeAnalise"]').select('kg');
        cy.get('select[name="fornecedorId"]').select(fornecedorNome1);
        cy.get('input[name="quantidadeComprada"]').type('10'); // 10 kg
        cy.get('input[name="precoTotalNota"]').type('50');   // R$ 50.00 -> R$ 5/kg
        cy.get('button[type="submit"]').click();
    });
    cy.contains('Compra registrada para').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    cy.wait(500);

    // 4. Registrar segunda compra para o mesmo insumo (Fornecedor 2, mais barato)
    cy.get('.card').contains('h3', 'Registrar Nova Compra / Cadastrar Insumo').parent().within(() => {
        cy.get('input[name="nome"]').clear().type(insumoNome); // Re-seleciona o insumo
        cy.get('select[name="fornecedorId"]').select(fornecedorNome2);
        cy.get('input[name="quantidadeComprada"]').clear().type('10'); // 10 kg
        cy.get('input[name="precoTotalNota"]').clear().type('40');   // R$ 40.00 -> R$ 4/kg
        cy.get('button[type="submit"]').click();
    });
    cy.contains('Compra registrada para').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    cy.wait(500);

    // 5. Criar Ficha Técnica para o Produto Final
    cy.get('[data-cy=nav-fichas-tecnicas]').click(); // Navegar para Fichas Técnicas
    cy.get('.card').contains('h2', 'Gerenciar Produtos Finais (Fichas Técnicas)').should('be.visible');

    cy.get('[data-cy=card-gerenciar-produtos-finais]').within(() => {
        cy.get('input[placeholder="Ex: Pizza"]').type(produtoFinalNome);
        cy.get('input[placeholder="Ex: Pizzas Salgadas"]').type('Doces');
        cy.get('input[placeholder="Ex: Grande"]').type('Padrão'); // Nome da variante
        cy.get('input[placeholder="1.50"]').type('0.50'); // Custo Embalagem
        cy.get('input[placeholder="3.00"]').type('1.00'); // Outros Custos

        // Adicionar insumo na ficha técnica (deve pegar o melhor preço automaticamente)
        const textoInsumoFicha = `${insumoNome} - R$ 4,00000/kg`;
        cy.get('select[aria-label="Selecione um item de compra"]').select(textoInsumoFicha);
        cy.get('input[aria-label="Quantidade do item de compra"]').type('0.25'); // 250g de açúcar (assumindo entrada em kg, mas o label sugere g/ml)
        cy.get('button[aria-label="Adicionar item à ficha técnica"]').click();

        cy.get('button[type="submit"]').contains('Salvar Novo Produto').click();
    });
    cy.contains('Produto salvo!').should('be.visible').get('[data-cy=modal-confirm-button]').click();

    // Verificar CMV calculado para o produto final
    // Custo Insumo: 0.25kg * R$ 4/kg = R$ 1.00
    // Outros Custos: 0.50 (embalagem) + 1.00 (operacional) = R$ 1.50
    // CMV Total = 1.00 + 1.50 = R$ 2.50
    cy.get('[data-cy=card-gerenciar-produtos-finais]').contains('.list-item', produtoFinalNome).parents('.card').within(() => {
        cy.contains('CMV: R$ 2,50').should('be.visible');
    });

    // 6. Fazer um pedido usando o fluxo com comparação de preços
    cy.get('[data-cy=nav-pedidos]').click();
    cy.contains('h2', 'Fazer um Pedido').should('be.visible');

    cy.get('input[placeholder*="Digite para buscar"]').type(insumoNome);
    cy.get('.list-container').contains('.list-item', insumoNome).should('be.visible');

    // Clicar no botão 'Ver Preços' para abrir o modal de comparação
    cy.get('.list-container').contains('.list-item', insumoNome).within(() => {
        cy.contains('A partir de R$ 4,00000/kg').should('be.visible');
        cy.contains('button', 'Ver Preços').click();
    });

    // Dentro do modal de comparação de preços
    cy.get('.modal-content').should('be.visible').within(() => {
        cy.contains('Preços para:').should('be.visible');
        // O fornecedor mais barato deve ser o segundo cadastrado (Fornecedor Alternativo)
        cy.contains('.list-item', fornecedorNome2).contains('R$ 4,00000/kg').should('be.visible');
        cy.contains('.list-item', fornecedorNome1).contains('R$ 5,00000/kg').should('be.visible');

        // Selecionar o fornecedor mais barato
        cy.contains('.list-item', fornecedorNome2).contains('button', 'Selecionar').click();
    });
    cy.get('.modal-overlay').should('not.exist'); // Modal deve fechar

    // Voltar na tela de pedidos, o item agora está selecionado com o fornecedor correto
    cy.contains('Item: ').should('contain', insumoNome);
    cy.contains('Fornecedor selecionado:').should('contain', fornecedorNome2);

    cy.get('input[aria-label="Quantidade"]').type('5'); // 5 kg
    cy.get('button[aria-label="Adicionar item ao carrinho"]').click();

    cy.contains('Itens no Carrinho').should('be.visible');
    cy.contains('Pedido para:').should('contain', fornecedorNome2);
    cy.contains('5x ' + insumoNome).should('be.visible');

    // Enviar pedido
    cy.contains('button', 'Enviar Pedido via WhatsApp').click();
    cy.contains('Seu carrinho está vazio.').should('be.visible');
  });
});