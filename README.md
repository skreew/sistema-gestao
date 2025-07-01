# Sistema de Gestão Empresarial v2.0 (Versão Final Consolidada)

Aplicação React completa para gestão de pedidos, fornecedores, catálogo, cálculo de Custo de Mercadoria Vendida (CMV), fluxo de caixa, gestão de estoque e ponto de venda (PDV). Esta versão foi refatorada para máxima usabilidade, robustez e escalabilidade.

## Como Iniciar

1.  **Instale as Dependências:**
    ```bash
    npm install
    ```

2.  **Configure o Firebase (OBRIGATÓRIO):**
    Abra o ficheiro `src/firebase.js` e preencha com as suas credenciais **reais** do Firebase.

3.  **Configure as Regras de Segurança e Funções (CRÍTICO PARA PRODUÇÃO):**
    * **Firestore Security Rules:** A segurança da sua aplicação depende disso. As regras padrão são inseguras. Adapte as regras sugeridas no `README.md` original ou crie as suas próprias baseadas na sua lógica de negócio (ex: apenas 'gestores' podem apagar dados).
    * **Cloud Functions:** Para automações essenciais como baixa de estoque após uma venda no PDV, recálculo automático de CMV e lançamento de despesas, é altamente recomendável implementar Cloud Functions. O ficheiro `src/services/firestoreService.js` contém comentários sobre as funções recomendadas.

4.  **Inicie a Aplicação:**
    ```bash
    npm start
    ```

5.  **Execute os Testes (Opcional):**
    ```bash
    # Testes unitários
    npm test

    # Testes End-to-End (requer a aplicação a rodar)
    npm run cypress:open
    ```