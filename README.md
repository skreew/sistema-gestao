# Sistema de Pedidos e Gestão v1.3 (Refatorado com Fluxo de Caixa)

Aplicação React completa para gestão de pedidos, fornecedores, catálogo, CMV e agora com um **mini fluxo de caixa**, com fluxos de trabalho otimizados e corrigidos para maior intuitividade e estabilidade.

## Como Iniciar

1.  **Instale as Dependências:**
    ```bash
    npm install
    ```

2.  **Configure o Firebase:**
    Abra o arquivo `src/firebase.js` e preencha com as suas credenciais do Firebase.

3.  **Crie os Índices no Firestore:**
    Para que as consultas e ordenações funcionem, você **precisa** criar os seguintes índices no seu console do Firestore. A falta deles causará erros na aplicação.

    - **Coleção:** `pedidosRealizados`
      - **Campo:** `criadoEm`, **Modo:** Decrescente

    - **Coleção:** `fornecedores`
      - **Campo:** `nome`, **Modo:** Crescente

    - **Coleção:** `produtosDeCompra`
      - **Campo:** `nome`, **Modo:** Crescente

    - **Coleção:** `produtosFinais`
      - **Campo:** `nome`, **Modo:** Crescente

    - **Grupo de Coleções:** `entradas` (ID do Grupo de Coleções)
      - **Caminho da coleção:** `fluxoCaixa/{userId}/entradas`
      - **Campo:** `data`, **Modo:** Decrescente

    - **Grupo de Coleções:** `saidas` (ID do Grupo de Coleções)
      - **Caminho da coleção:** `fluxoCaixa/{userId}/saidas`
      - **Campo:** `data`, **Modo:** Decrescente

4.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm start
    ```
    A aplicação estará disponível em `http://localhost:3000`.