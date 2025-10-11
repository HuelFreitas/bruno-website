# Plano de Execução para Renomear o Código para pt-BR

## Objetivo
Garantir que toda a base de código utilize convenções, identificadores e conteúdo textual em português do Brasil (pt-BR), mantendo a consistência sem comprometer a funcionalidade existente.

## Premissas
- A base atual utiliza uma mistura de inglês e português em nomes de arquivos, funções, variáveis e textos exibidos.
- Testes automatizados são limitados; validação manual será necessária para áreas-chave.
- O processo deve preservar compatibilidade com APIs existentes e evitar regressões.

## Estratégia Geral
1. **Mapeamento Completo**
   - Inventariar arquivos, módulos e componentes que contêm identificadores ou strings em inglês.
   - Priorizar `assets/app.js`, `assets/styles.css`, `index.html` e qualquer documentação.
   - Registrar dependências externas (bibliotecas, APIs) cujos nomes não devem ser traduzidos.

2. **Definição de Convenções pt-BR**
   - Estabelecer guia de estilo com regras de nomenclatura (camelCase para JS, kebab-case para CSS) e tradução consistente de termos técnicos.
   - Validar termos com a equipe de produto para evitar ambiguidades (ex.: "request" → "solicitacao" ou "pedido").

3. **Renomeação Gradual**
   - Aplicar renomeações por domínio funcional (ex.: módulo de solicitações, módulo de operadores, UI cliente).
   - Utilizar ferramentas de refatoração (VS Code rename symbol, busca/replace) para evitar erros.
   - Manter commits pequenos e focados para facilitar revisão.

4. **Atualização de Strings de Interface**
   - Migrar textos estáticos para objetos centralizados de tradução (`const texto = { ... }`).
   - Revisar pontuação, acentuação e acordo ortográfico.
   - Validar acessibilidade (atributos `aria`, `title`).

5. **Ajustes em Recursos Associados**
   - Renomear arquivos e pastas, atualizando importações/referências.
   - Atualizar testes, documentação e scripts de build conforme necessário.

6. **Validação e Testes**
   - Executar lint/checks disponíveis (`node --check assets/app.js`).
   - Testar manualmente fluxos críticos (criação, edição, exclusão de solicitações; exportação de relatórios; linha do tempo).
   - Revisar visualmente a interface para confirmar se não restaram termos em inglês.

7. **Documentação e Comunicação**
   - Registrar mudanças no README e changelog.
   - Comunicar à equipe sobre possíveis ajustes em integrações ou automações.

## Cronograma Estimado
1. Levantamento e convenções: 1 dia
2. Refatoração por módulo (3 ciclos): 3 dias
3. Validação e testes: 1 dia
4. Revisão e documentação final: 0,5 dia

## Riscos e Mitigações
- **Regressões funcionais:** utilizar refatoração assistida e testes manuais abrangentes.
- **Termos técnicos sem consenso:** envolver stakeholders antes de padronizar.
- **Conflitos de merge:** sincronizar frequentemente com a branch principal.

## Critérios de Conclusão
- Nenhum identificador relevante permanece em inglês.
- Strings de interface consistentes em pt-BR.
- Build/checks passam sem erros.
- Aprovação da revisão técnica e de produto.
