# Sistema de Pedidos e Gestão v1.1 (Refatorado)

Aplicação React completa para gestão de pedidos, fornecedores, catálogo, e cálculo de Custo de Mercadoria Vendida (CMV), com fluxos de trabalho otimizados para maior intuitividade.

## Como Iniciar

1.  **Instale as Dependências:**
    ```bash
    npm install
    ```

2.  **Configure o Firebase:**
    Abra o arquivo `src/firebase.js` e preencha com as suas credenciais do Firebase.

3.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm start
    ```
A aplicação estará disponível em `http://localhost:3000`.

## Como Executar os Testes Automatizados

1.  Certifique-se de que a aplicação esteja rodando (`npm start`).
2.  Em um novo terminal, execute o comando para abrir a interface do Cypress:
    ```bash
    npm run cypress:open
    ```
3.  Na janela do Cypress, escolha "E2E Testing" e execute o teste `sistema_completo.cy.js`.