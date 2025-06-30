describe('Fluxos do Gestor', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/**').as('firebaseAuth');
    cy.intercept('POST', '**/firestore.googleapis.com/**').as('firebaseFirestore');

    cy.session('gestorLogado', () => {
      cy.visit('/');
      cy.contains('h1', 'Sistema de Pedidos', { timeout: 10000 }).should('be.visible');
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

  it('deve cadastrar, editar e excluir um fornecedor', () => {
    const fornecedor = {
      nome: `Fornecedor Teste ${Date.now()}`,
      whatsapp: '99123456789',
      obs: 'Entrega às segundas.'
    };
    const dadosEditados = {
      nome: `Fornecedor Editado ${Date.now()}`,
      whatsapp: '99987654321',
      obs: 'Agora entrega às sextas!'
    };

    cy.get('[data-cy=nav-cadastros]').click();
    cy.get('[data-cy=card-gerenciar-fornecedores]').should('be.visible');

    // --- CADASTRO ---
    cy.log('**Etapa: Cadastrando novo fornecedor...**');
    cy.get('[data-cy=card-gerenciar-fornecedores]').within(() => {
      cy.get('[data-cy=input-fornecedor-nome]').type(fornecedor.nome);
      cy.get('[data-cy=input-fornecedor-whatsapp]').type(fornecedor.whatsapp);
      cy.get('[data-cy=input-fornecedor-obs]').type(fornecedor.obs);
      cy.get('[data-cy=btn-adicionar-fornecedor]').click();
    });
    cy.contains('Fornecedor salvo!').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    
    // CORREÇÃO 1: Rolar até o elemento antes de verificar a visibilidade.
    cy.get('.list-container').contains(fornecedor.nome).scrollIntoView().should('be.visible');

    // --- EDIÇÃO ---
    cy.log('**Etapa: Editando o fornecedor...**');
    cy.get('.list-container').contains(fornecedor.nome).parents('.list-item').within(() => {
      cy.get('.button-icon').first().click();
    });
    cy.get('[data-cy=input-fornecedor-nome]').clear().type(dadosEditados.nome);
    cy.get('[data-cy=input-fornecedor-whatsapp]').clear().type(dadosEditados.whatsapp);
    cy.get('[data-cy=input-fornecedor-obs]').clear().type(dadosEditados.obs);
    cy.get('[data-cy=btn-adicionar-fornecedor]').contains('Atualizar Fornecedor').click();
    cy.contains('Fornecedor atualizado!').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    cy.get('.list-container').contains(dadosEditados.nome).scrollIntoView().should('be.visible');
    cy.get('.list-container').contains(fornecedor.nome).should('not.exist');

    // --- EXCLUSÃO ---
    cy.log('**Etapa: Excluindo o fornecedor...**');
    cy.get('.list-container').contains(dadosEditados.nome).parents('.list-item').within(() => {
        cy.get('.button-icon').last().click();
    });
    cy.contains('Excluir este fornecedor?').should('be.visible');
    cy.get('[data-cy=modal-confirm-button]').contains('Confirmar').click();
    cy.contains('Fornecedor excluído.').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    cy.get('.list-container').contains(dadosEditados.nome).should('not.exist');
  });

  it('deve cadastrar um produto de compra e uma ficha técnica completa', () => {
    const produtoDeCompra = {
        nome: `Queijo Teste ${Date.now()}`,
        unidadeCompra: 'Peça',
        conteudo: '2.5',
        medida: 'kg'
    };
    const produtoFinal = {
        nome: `Pizza de Queijo Teste ${Date.now()}`,
        categoria: 'Pizzas Especiais',
        custoEmbalagem: '1.50',
        custoOperacional: '2.00',
        quantidadeInsumo: '150'
    };
    const valorNotaFiscal = '75.00';
    
    cy.log('**Etapa: Cadastrando produto de compra (insumo)...**');
    cy.get('[data-cy=nav-cadastros]').click();
    cy.get('.card').contains('h2', 'Gerenciar Catálogo de Compra').parent().within(() => {
        cy.get('input[name="nome"]').type(produtoDeCompra.nome);
        cy.get('select[name="detalheCompra.tipoBase"]').select('peso');
        cy.get('input[name="detalheCompra.unidadeCompra"]').type(produtoDeCompra.unidadeCompra);
        cy.get('input[name="detalheCompra.conteudo"]').type(produtoDeCompra.conteudo);
        cy.get('select[name="detalheCompra.unidadeConteudo"]').select(produtoDeCompra.medida);
        cy.get('select[name="fornecedorId"]').select(1);
        cy.get('button[type="submit"]').click();
    });
    cy.contains('Produto salvo no catálogo!').should('be.visible').get('[data-cy=modal-confirm-button]').click();

    cy.log('**Etapa: Registrando compra para calcular custo do insumo...**');
    cy.get('[data-cy=nav-cmv]').click();
    cy.get('h2').contains('Registrar Compra e Fechar Ciclo').parent().within(() => {
        cy.get('select').first().select(`${produtoDeCompra.nome} (${produtoDeCompra.unidadeCompra})`);
        cy.get('input[type="text"]').type(valorNotaFiscal);
        cy.get('button[type="submit"]').click();
    });
    cy.contains('Custo atualizado e estoque incrementado!').should('be.visible');
    cy.contains('R$ 0,03000/g').should('be.visible');
    cy.get('[data-cy=modal-confirm-button]').click();
    
    cy.log('**Etapa: Criando a ficha técnica (produto final)...**');
    cy.get('h2').contains('Gerenciar Produtos Finais (Ficha Técnica)').parent().within(() => {
        cy.get('input[placeholder="Ex: Pizza"]').type(produtoFinal.nome);
        cy.get('input[placeholder="Ex: Pizzas Salgadas"]').type(produtoFinal.categoria);
        cy.get('input[placeholder="Ex: Grande, Calabresa"]').clear().type('Grande');
        cy.get('input[placeholder="1.50"]').type(produtoFinal.custoEmbalagem);
        cy.get('input[placeholder="3.00"]').type(produtoFinal.custoOperacional);
        
        // CORREÇÃO 2: Selecionar o insumo pelo seu texto visível.
        const textoInsumo = `${produtoDeCompra.nome} (g)`; // O sistema converte kg para g como unidade padrão
        cy.contains('label', 'Insumo').parent().find('select').select(textoInsumo);

        cy.get('input[placeholder="Ex: 150"]').type(produtoFinal.quantidadeInsumo);
        cy.get('button').contains('+').click();
        cy.get('button[type="submit"]').contains('Salvar Novo Produto').click();
    });
    cy.contains('Produto final salvo com sucesso!').should('be.visible').get('[data-cy=modal-confirm-button]').click();
    
    cy.log('**Etapa: Verificando o CMV calculado...**');
    // Custo Insumo: 150g * R$ 0.03/g = R$ 4.50
    // Outros Custos: 1.50 + 2.00 = R$ 3.50
    // CMV TOTAL = 4.50 + 3.50 = R$ 8.00
    cy.get('.card').contains('h4', produtoFinal.nome).parents('.card').within(() => {
        cy.contains('CMV: R$ 8,00').should('be.visible');
    });
  });
});