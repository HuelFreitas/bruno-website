# B&B Educacão Portal

Protótipo responsivo para gestão de operações de fiscalização marítima com uso de cães farejadores da B&B Educacão. O projeto atende dois perfis principais:

- **Cliente**: registra solicitações, acompanha inspeções em andamento, envia mensagens complementares e gera relatórios concluídos.
- **Operador**: recebe missões, atualiza status, adiciona checkpoints de campo e emite relatório final para liberação ao cliente.

> ⚠️ O protótipo é 100% front-end e armazena dados no `localStorage` do navegador. Nenhuma informação é enviada para servidores externos.

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- npm (incluso no Node.js)

## Desenvolvimento (local)

Passos rápidos para desenvolver localmente:

1. Instale dependências:

```bash
npm install
```

2. Rode o servidor de desenvolvimento (Vite):

```bash
npm run dev
```

3. Rode os testes:

```bash
npm test
```

4. Gerar build de produção:

```bash
npm run build
```

Observações:
- Execute `npm install` antes de `npm run dev` para garantir que `jspdf` e outras dependências estejam instaladas.
- Pull requests devem rodar CI (lint + tests) automaticamente.

## 🧪 Testes & Qualidade de Código

### Comandos de Teste

```bash
# Rodar testes uma vez
npm test

# Rodar testes em modo watch (hot reload)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Ver relatório de cobertura no navegador
npm run coverage
```

### Métricas Atuais

- **157 testes** implementados e passando (100%) ✅
- **Cobertura dos módulos `src/`:** 37.14% statements (varia de 0% a 100% por módulo)
- **Funções cobertas:** 76.56% | **Branches:** 68.34%
- **Thresholds configurados:** 80% statements/functions, 75% branches (aplicados apenas a `src/**/*.js`)

> A cobertura mede somente os módulos extraídos para `src/`. O arquivo principal `assets/app.js` ainda está em migração gradual para essa estrutura.

📊 [Relatório de Cobertura Detalhado](./coverage/index.html)

### Estrutura de Testes

```
test/
├── helpers.test.js       (36 testes) ✅
├── storage.test.js       (26 testes) ✅
├── theme.test.js         (25 testes) ✅
├── notifications.test.js (22 testes) ✅
├── dashboards.test.js    (6 testes)  ✅
├── search.test.js        (9 testes)  ✅
├── actions.test.js       (4 testes)  ✅
└── ...outros             (~29 testes)✅
```

### CI/CD - GitHub Actions

![Tests & Coverage](https://github.com/HuelFreitas/bruno-website/workflows/Tests%20&%20Coverage/badge.svg)

Configurado para rodar **automaticamente em cada Pull Request**:

- ✅ Linter (ESLint)
- ✅ Testes (Vitest em Node 18.x e 20.x)
- ✅ Cobertura (V8)
- ✅ Codecov upload
- ✅ Comentário automático no PR

**Branch Protection:** `main` requer que todos os testes passem antes de merge.

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

- Layout mobile-first utilizando CSS Grid e tipografia flexível.
- Elementos com suporte a teclado, mensagens de feedback em região `aria-live` e foco gerenciado.
- Conjunto inicial de dados demonstrativos para acelerar a avaliação.

## Estrutura do projeto

```
├── assets/
│   ├── app.js              # App principal (monolito em migração gradual para src/)
│   └── styles.css          # Design system com suporte a tema dinâmico
├── src/
│   ├── main.js             # Entry point do Vite (importa assets/app.js)
│   ├── components/
│   │   ├── calendar.js     # Seletor de data/hora
│   │   ├── dashboards.js   # Painéis do cliente e do operador
│   │   ├── modal.js        # Componente de modal genérico
│   │   ├── requests.js     # Listagem e filtros de solicitações
│   │   ├── search.js       # Busca de operações
│   │   ├── timeline.js     # Linha do tempo de eventos
│   │   ├── ui.js           # Chips de status e elementos visuais
│   │   └── upload.js       # Upload e galeria de evidências
│   ├── handlers/
│   │   ├── actions.js      # Ações de cliente e operador
│   │   ├── client.js       # Notas e gestão do cliente
│   │   ├── metrics.js      # Cálculo de métricas do dashboard
│   │   ├── progress.js     # Atualização de progresso/checkpoints
│   │   ├── report.js       # Submissão de relatório final
│   │   └── status.js       # Atualização de status da operação
│   ├── ui/
│   │   └── notifications.js # Notificações de sucesso/erro/aviso
│   └── utils/
│       ├── dom.js           # Manipulação do DOM e acessibilidade
│       ├── helpers.js       # Utilitários de negócio (tags, usuários)
│       ├── misc.js          # Formatação de datas, UIDs, tamanhos
│       ├── storage.js       # Leitura/escrita no localStorage
│       └── string.js        # Sanitização e trim seguro
├── test/                   # 157 testes unitários (Vitest + jsdom)
├── index.html              # Shell da aplicação
└── vite.config.js          # Configuração do bundler
```

## Próximos passos sugeridos

- Integrar API real para autenticação e persistência dos dados.
- Adicionar upload de evidências (fotos, laudos) e assinatura digital.
- Implementar fluxo de notificações por e-mail ou push.
- Melhorar cobertura de testes para 80%+ nos módulos com baixa cobertura.

## 🤝 Contribuindo

Para contribuir com o projeto:

1. **Faça fork** do repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature: `git checkout -b feature/sua-feature`
4. **Faça as mudanças** e adicione testes
5. **Rode testes localmente**: `npm test && npm run lint`
6. **Commit** com mensagens descritivas
7. **Push** para sua branch
8. **Abra um Pull Request**

### Pré-requisitos para PR

- ✅ Testes passando: `npm test` (157/157)
- ✅ Linting ok: `npm run lint`
- ✅ Cobertura mantida: `npm run test:coverage`
- ✅ Nova funcionalidade tem testes
- ✅ Documentação atualizada

## Licença

Distribuído sob a licença [MIT](./LICENSE).
