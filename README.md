# B&B Educacão Portal

Protótipo responsivo para gestão de operações de fiscalização marítima com uso de cães farejadores da B&B Educacão. O projeto atende dois perfis principais:

- **Cliente**: registra solicitações, acompanha inspeções em andamento, envia mensagens complementares e gera relatórios concluídos.
- **Operador**: recebe missões, atualiza status, adiciona checkpoints de campo e emite relatório final para liberação ao cliente.

> ⚠️ O protótipo é 100% front-end e armazena dados no `localStorage` do navegador. Nenhuma informação é enviada para servidores externos.

## Pré-requisitos

- Navegador moderno (Chrome, Edge, Firefox ou Safari) com suporte a `localStorage` e `dialog`.
- Não é necessário instalar dependências ou executar build.

## Como executar

1. Faça o download/clonagem do repositório.
   ```bash
   git clone https://github.com/<seu-usuario>/bruno-website.git
   cd bruno-website
   ```
2. **Opção rápida:** dê um duplo clique em [`index.html`](./index.html) para abrir o protótipo diretamente no navegador.
3. **Opção recomendada:** sirva a pasta do projeto com um servidor estático para garantir que todos os recursos sejam carregados sem restrições de segurança do navegador.
   ```bash
   # usando Node.js
   npx serve .

   # ou com Python 3
   python -m http.server 5173
   ```
   Em seguida acesse a URL exibida no terminal (por padrão `http://localhost:3000` para `npx serve` ou `http://localhost:5173` para o comando do Python).
4. **Executando pela IDE:** caso utilize VS Code ou outra IDE com Live Server, abra a pasta clonada e ative o servidor embutido para carregar o `index.html` automaticamente.
5. Utilize as credenciais de demonstração sugeridas ou cadastre um novo acesso informando nome, e-mail e perfil.

## Fluxos implementados

### Autenticação simulada

- Formulário único para clientes e operadores.
- Detecta se o e-mail informado já possui cadastro e reaproveita automaticamente.
- Permite criar múltiplos usuários sem necessidade de backend.

### Área do cliente

- Dashboard com indicadores de solicitações.
- Formulário completo para abertura de nova inspeção (porto, embarcação, data, tags, contexto).
- Lista com filtros por status (todas, pendentes, em andamento, concluídas).
- Modal de detalhes contendo linha do tempo e opção de enviar mensagens complementares.

### Área do operador

- Painel com cards das operações ordenadas pelas mais recentes.
- Atualização de status (pendente, em andamento, concluída) com rastreabilidade.
- Registro de checkpoints operacionais com descrição e próximos passos.
- Formulário de relatório final com resumo, achados e recomendações.
- Geração automática de relatório imprimível (HTML) para auditoria.

## Recursos adicionais

- Alternância de tema claro/escuro persistido no navegador.
- Layout mobile-first utilizando CSS Grid e tipografia flexível.
- Elementos com suporte a teclado, mensagens de feedback em região `aria-live` e foco gerenciado.
- Conjunto inicial de dados demonstrativos para acelerar a avaliação.

## Estrutura do projeto

```
├── assets/
│   ├── app.js        # Regras de negócio, estado e renderização da interface
│   └── styles.css    # Design system leve com suporte a tema dinâmico
├── index.html        # Shell da aplicação e contêiner principal
└── README.md
```

## Próximos passos sugeridos

- Integrar API real para autenticação e persistência dos dados.
- Adicionar upload de evidências (fotos, laudos) e assinatura digital.
- Implementar fluxo de notificações por e-mail ou push.
- Criar testes automatizados de interface para os principais fluxos.

## Licença

Distribuído sob a licença [MIT](./LICENSE).
