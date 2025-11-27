/**
 * Renderização de dashboards
 */

import { escapeHtml } from '../utils/string.js';
import { formatDate } from '../utils/misc.js';
import { translateStatus } from '../utils/helpers.js';

/**
 * Renderiza o estado vazio (quando não há dados)
 * @param {string} title - Título do estado vazio
 * @param {string} subtitle - Subtítulo/descrição
 * @returns {string} HTML do estado vazio
 */
export function emptyState(title, subtitle) {
  return `
    <div class="empty-state">
      <h3>${title}</h3>
      <p>${subtitle}</p>
    </div>
  `;
}

/**
 * Constrói o painel de operações para operadores
 * Exibe cards com solicitações disponíveis para atualizações
 * @param {Object[]} requests - Lista de requisições
 * @param {Object} viewer - Operador visualizando
 * @param {Function} helpers.resolveUser - Função para encontrar usuário pelo ID
 * @param {Function} helpers.translateStatus - Função para traduzir status
 * @param {Function} helpers.formatDate - Função para formatar datas
 * @returns {string} HTML do painel
 */
export function buildOperatorBoard(requests, viewer, { resolveUser, translateStatus: translateStatusFn, formatDate: formatDateFn } = {}) {
  const resolveUserFn = resolveUser || (() => ({ name: "Usuário" }));
  const translateStatusFn2 = translateStatusFn || translateStatus;
  const formatDateFn2 = formatDateFn || formatDate;

  return `
    <div class="section-grid">
      ${requests
        .map((request) => {
          const client = resolveUserFn(request.clientId);
          const safeTitle = escapeHtml(request.title);
          const safeBadgeId = escapeHtml(request.id.toUpperCase());
          const safePort = escapeHtml(request.port);
          const safeVessel = escapeHtml(request.vessel);
          const safeClientName = escapeHtml(client.name);
          const safeRequestId = escapeHtml(request.id);

          return `
            <article class="card" aria-label="${safeTitle}">
              <header>
                <p class="badge">${safeBadgeId}</p>
                <h3>${safeTitle}</h3>
                <p>${safePort} • ${safeVessel}</p>
              </header>
              <p><strong>Cliente:</strong> ${safeClientName}</p>
              <p><strong>Agenda:</strong> ${formatDateFn2(request.scheduledFor)}</p>
              <p><strong>Status:</strong> ${translateStatusFn2(request.status)}</p>
              <button class="primary-button" type="button" data-request="${safeRequestId}">${request.status === "completed" ? "Visualizar relatório" : "Atualizar missão"}</button>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

/**
 * Renderiza o dashboard do cliente
 * @param {Object} options - Opções de configuração
 * @param {Object} options.user - Usuário cliente
 * @param {Object} options.state - Estado da aplicação
 * @param {Object} options.uiState - Estado da UI
 * @param {Function} options.buildMetrics - Função para calcular métricas
 * @param {Function} options.metricCard - Função para renderizar card de métrica
 * @param {Function} options.buildStatusFilterTab - Função para renderizar tabs de filtro
 * @param {Function} options.createSearchInterface - Função para criar interface de busca
 * @param {Function} options.buildRequestTable - Função para construir tabela de requisições
 * @param {Function} options.handleCreateRequest - Handler para criar requisição
 * @param {Function} options.initCalendar - Função para inicializar calendário
 * @param {Function} options.initSearchModule - Função para inicializar busca
 * @param {Function} options.performSearchModule - Função para executar busca
 * @param {Function} options.displaySearchResultsModule - Função para exibir resultados
 * @param {HTMLElement} options.app - Elemento raiz da aplicação
 * @param {Function} options.saveState - Função para salvar estado
 * @param {Function} options.renderApp - Função para renderizar aplicação
 * @param {Array} options.companyAvailability - Horários disponíveis da empresa
 * @param {Function} options.attachModalHandlers - Função para anexar handlers do modal
 * @param {Object} options.modalHelpers - Helpers para o modal
 * @returns {void}
 */
export function renderClientDashboard({
  user,
  state,
  uiState,
  buildMetrics,
  metricCard,
  buildStatusFilterTab,
  createSearchInterface,
  buildRequestTable,
  handleCreateRequest,
  initCalendar,
  initSearchModule,
  performSearchModule,
  displaySearchResultsModule,
  app,
  saveState,
  renderApp,
  companyAvailability = [],
  attachModalHandlers,
  modalHelpers = {},
}) {
  const requests = state.requests.filter((request) => request.clientId === user.id);
  const metrics = buildMetrics(requests);

  app.innerHTML = `
    <section class="section-grid" aria-label="Indicadores principais">
      ${metricCard("Solicitações enviadas", metrics.total, "primary")}
      ${metricCard("Em andamento", metrics.inProgress, "info")}
      ${metricCard("Concluídas", metrics.completed, "success")}
      ${metricCard("Próxima inspeção", metrics.nextInspectionLabel, "neutral")}
    </section>

    <section class="card" aria-labelledby="create-request-heading">
      <div class="card__header">
        <h2 id="create-request-heading">Nova solicitação</h2>
        <p>Informe os dados da operação desejada. Você poderá anexar documentos na etapa de auditoria.</p>
      </div>
      <form id="requestForm" class="grid-two" novalidate>
        <div>
          <label for="requestTitle">Título da solicitação</label>
          <input id="requestTitle" name="title" required placeholder="Ex.: Varredura em navio cargueiro" />
        </div>
        <div>
          <label for="requestPort">Porto / Terminal</label>
          <input id="requestPort" name="port" required placeholder="Informe o porto ou terminal" />
        </div>
        <div>
          <label for="requestVessel">Embarcação</label>
          <input id="requestVessel" name="vessel" required placeholder="Nome ou registro da embarcação" />
        </div>
        <div>
          <label for="requestCargo">Tipo de carga</label>
          <input id="requestCargo" name="cargo" placeholder="Ex.: Contêineres, combustíveis, graneis" />
        </div>
        <div>
          <label for="requestDate">Data prevista</label>
          <input id="requestDate" name="scheduledFor" type="date" required min="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label for="requestTime">Horário disponível</label>
          <select id="requestTime" name="scheduledTime" required>
            <option value="">Selecione um horário</option>
            ${companyAvailability
              .map((slot) => `<option value="${escapeHtml(slot.value)}">${escapeHtml(slot.label)}</option>`)
              .join("")}
          </select>
        </div>
        <div>
          <label for="requestTags">Tags (separadas por vírgula)</label>
          <input id="requestTags" name="tags" placeholder="auditoria, alto risco" />
        </div>
        <div class="full-row">
          <label for="requestDescription">Contexto e observações</label>
          <textarea id="requestDescription" name="description" required placeholder="Descreva o objetivo, restrições e equipes de apoio."></textarea>
        </div>
        <div class="full-row">
          <button class="primary-button" type="submit">Enviar solicitação</button>
        </div>
      </form>
    </section>

    <section class="card" aria-labelledby="availability-heading">
      <div class="card__header">
        <h2 id="availability-heading">Horários disponíveis da equipe</h2>
        <p>Escolha um dos turnos abaixo ao agendar uma nova inspeção.</p>
      </div>
      <ul class="availability-list">
        ${companyAvailability
          .map(
            (slot) => `
              <li class="availability-slot">
                <span>${escapeHtml(slot.label)}</span>
                <small>${escapeHtml(slot.description)}</small>
              </li>
            `
          )
          .join("")}
      </ul>
    </section>

    ${createSearchInterface()}

    <section class="card" aria-labelledby="calendar-heading">
      <div class="card__header">
        <h2 id="calendar-heading">Calendário de Operações</h2>
        <p>Visualize todas as inspeções agendadas em formato de calendário.</p>
      </div>
      <div id="calendarContainer"></div>
    </section>

    <section class="card" aria-labelledby="requests-heading">
      <div class="card__header">
        <div>
          <h2 id="requests-heading">Solicitações cadastradas</h2>
          <p>Gerencie inspeções, acompanhe o progresso em tempo real e baixe relatórios.</p>
        </div>
        <div class="tab-group" role="tablist">
                  ${buildStatusFilterTab("all", "Todas", uiState.filterStatus)}
                  ${buildStatusFilterTab("pending", "Pendentes", uiState.filterStatus)}
                  ${buildStatusFilterTab("in-progress", "Em andamento", uiState.filterStatus)}
                  ${buildStatusFilterTab("completed", "Concluídas", uiState.filterStatus)}
        </div>
      </div>
              ${requests.length ? buildRequestTable(requests, uiState.filterStatus, user, modalHelpers) : emptyState("Nenhuma solicitação cadastrada", "Crie sua primeira inspeção para acompanhar aqui.")}
    </section>
  `;

  // Event listeners
  document
    .querySelector("#requestForm")
    ?.addEventListener("submit", (event) => handleCreateRequest(event, user));

  app.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      uiState.filterStatus = button.dataset.filter;
      renderClientDashboard({
        user,
        state,
        uiState,
        buildMetrics,
        metricCard,
        buildStatusFilterTab,
        createSearchInterface,
        buildRequestTable,
        handleCreateRequest,
        initCalendar,
        initSearchModule,
        performSearchModule,
        displaySearchResultsModule,
        app,
        saveState,
        renderApp,
        companyAvailability,
        attachModalHandlers,
        modalHelpers,
      });
    });
  });

  // Attach modal handlers
  attachModalHandlers(document, user, modalHelpers);
  
  // Initialize calendar
  initCalendar(requests, user, modalHelpers);
  
  // Initialize search
  setTimeout(() => {
    const performSearchWrapper = () => {
      performSearchModule({
        state,
        session: modalHelpers.session || {},
        showSuccessNotification: modalHelpers.showSuccessNotification || (() => {}),
        displaySearchResults: modalHelpers.displaySearchResults || (() => {}),
      });
    };
    initSearchModule({
      showInfoNotification: modalHelpers.showInfoNotification || (() => {}),
      performSearch: performSearchWrapper,
    });
  }, 100);
}

/**
 * Renderiza o dashboard do operador
 * @param {Object} options - Opções de configuração
 * @param {Object} options.user - Usuário operador
 * @param {Object} options.state - Estado da aplicação
 * @param {Function} options.buildOperatorMetrics - Função para calcular métricas do operador
 * @param {Function} options.metricCard - Função para renderizar card de métrica
 * @param {Function} options.buildOperatorBoard - Função para construir painel de operações
 * @param {Function} options.emptyState - Função para renderizar estado vazio
 * @param {HTMLElement} options.app - Elemento raiz da aplicação
 * @param {Function} options.attachRequestModalHandlers - Função para anexar handlers do modal
 * @returns {void}
 */
export function renderOperatorDashboard({
  user,
  state,
  buildOperatorMetrics,
  metricCard,
  buildOperatorBoard: buildBoardFn,
  emptyState: emptyStateFn,
  app,
  attachRequestModalHandlers,
}) {
  const requests = [...state.requests].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const metrics = buildOperatorMetrics(requests, user.id);

  app.innerHTML = `
    <section class="section-grid" aria-label="Indicadores principais">
      ${metricCard("Missões atribuídas", metrics.assignedToOperator, "primary")}
      ${metricCard("Pendentes", metrics.pending, "warning")}
      ${metricCard("Concluídas", metrics.completed, "success")}
      ${metricCard("Próxima agenda", metrics.nextInspectionLabel, "neutral")}
    </section>
    <section class="card" aria-labelledby="board-heading">
      <div class="card__header">
        <h2 id="board-heading">Painel de operações</h2>
        <p>Atualize checkpoints, registre evidências e finalize relatórios diretamente pelo dispositivo móvel.</p>
      </div>
      ${requests.length ? buildBoardFn(requests, user) : emptyStateFn("Nenhuma operação disponível", "Aguarde novas solicitações dos clientes.")}
    </section>
  `;

  attachRequestModalHandlers(user);
}
