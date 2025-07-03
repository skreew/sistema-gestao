# Sistema de Gestão Empresarial v6.0 (Versão Profissional)

Aplicação React refatorada para maior segurança, performance e manutenibilidade, utilizando React Router para navegação e variáveis de ambiente para as chaves de API.

## Funcionalidades Principais

- Dashboard: Visão geral e rápida dos indicadores do negócio.
- Vendas: Histórico de todas as vendas realizadas.
- Pedidos de Compra: Crie e envie pedidos para os seus fornecedores.
- Catálogo: Gestão centralizada de fornecedores e insumos (matérias-primas).
- Fichas Técnicas: Calcule o Custo de Mercadoria Vendida (CMV) de forma precisa para cada produto.
- Fluxo de Caixa: Controle todas as entradas e saídas financeiras.
- Análises e Relatórios: Compare preços de insumos e visualize históricos.
- Gestão de Usuários: Adicione e gerencie os acessos de colaboradores e gestores.

## Como Iniciar

1.  Criar Arquivo de Ambiente (OBRIGATÓRIO):
    - Na raiz do projeto (`sistema-gestao-final`), crie um arquivo chamado `.env.local`.
    - Copie o conteúdo do arquivo `.env.example` para o `.env.local` e substitua pelas suas credenciais **reais** do Firebase.

2.  Instale as Dependências:

    ```bash
    npm install
    ```

3.  Inicie a Aplicação:

    ```bash
    npm start
    ```

4.  Configure as Regras de Segurança do Firestore:
    - Vá ao seu painel do Firebase > Firestore Database > Rules.
    - Copie o conteúdo do arquivo `firestore.rules` (na raiz do projeto) e cole no editor de regras do Firebase.
    - Clique em "Publicar".

5.  Primeiro Acesso:
    - No painel de 'Authentication' do seu projeto Firebase, crie manualmente seu primeiro usuário (será o gestor principal).
    - No banco de dados 'Firestore', crie uma coleção chamada 'users'.
    - Dentro de 'users', crie um documento com o mesmo UID do usuário que você criou no passo 1.
    - Dentro desse documento, adicione um campo 'role' (string) com o valor 'gestor'.
    - Agora, acesse a aplicação (http://localhost:3000) com as credenciais do gestor que você criou.
