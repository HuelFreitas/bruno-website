import { escapeHtml } from '../utils/string.js';
import { formatDate } from '../utils/misc.js';

/**
 * Inicializa o sistema de busca
 * Configura event listeners para formulário, botões de filtro e submissão
 * @param {Object} helpers - Objeto com funções auxiliares
 * @param {Function} helpers.showInfoNotification - Função para mostrar notificação info
 * @param {Function} helpers.performSearch - Função para executar busca
 */
export function initializeSearch(helpers) {
  const { showInfoNotification, performSearch } = helpers;

  const searchForm = document.getElementById('searchForm');
  const toggleButton = document.getElementById('toggleSearch');

  const clearButton = document.getElementById('clearSearch');
  const clearResultsButton = document.getElementById('clearSearchResults');
  const searchResults = document.getElementById('searchResults');

  if (!searchForm || !toggleButton) {
    console.log('Elementos de busca não encontrados');
    return;
  }

  // Remover event listeners anteriores se existirem
  const newToggleButton = toggleButton.cloneNode(true);
  toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);

  // Toggle do formulário de busca
  newToggleButton.addEventListener('click', () => {
    const isHidden = searchForm.hasAttribute('hidden');
    const currentToggleText = document.getElementById('searchToggleText');

    if (isHidden) {
      searchForm.removeAttribute('hidden');
      if (currentToggleText) currentToggleText.textContent = 'Ocultar filtros';
      showInfoNotification('Filtros ativados', 'Use os filtros para encontrar solicitações específicas', 3000);
    } else {
      searchForm.setAttribute('hidden', '');
      if (currentToggleText) currentToggleText.textContent = 'Mostrar filtros';
    }
  });

  // Limpar busca
  clearButton?.addEventListener('click', () => {
    searchForm.reset();
    if (searchResults) searchResults.setAttribute('hidden', '');
    showInfoNotification('Filtros limpos', 'Todos os filtros foram removidos', 2000);
  });

  clearResultsButton?.addEventListener('click', () => {
    if (searchResults) searchResults.setAttribute('hidden', '');
    searchForm.reset();
    showInfoNotification('Resultados limpos', 'Busca cancelada e filtros limpos', 2000);
  });

  // Submissão da busca
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    performSearch();
  });

  console.log('Sistema de busca inicializado com sucesso');
}

/**
 * Executa a busca com filtros aplicados
 * @param {Object} helpers - Objeto com dependências injetadas
 * @param {Object} helpers.state - Estado da aplicação
 * @param {Object} helpers.session - Sessão do usuário
 * @param {Function} helpers.showSuccessNotification - Função para notificação de sucesso
 * @param {Function} helpers.displaySearchResults - Função para exibir resultados
 */
export function performSearch(helpers) {
  const { state, session, showSuccessNotification, displaySearchResults } = helpers;

  const searchText = document.getElementById('searchText')?.value || '';
  const searchStatus = document.getElementById('searchStatus')?.value || '';
  const searchDateFrom = document.getElementById('searchDateFrom')?.value || '';
  const searchDateTo = document.getElementById('searchDateTo')?.value || '';
  const searchPort = document.getElementById('searchPort')?.value || '';
  const searchVessel = document.getElementById('searchVessel')?.value || '';

  const currentUser = state.users.find((user) => user.id === session?.currentUserId);
  if (!currentUser) return;

  let filteredRequests = state.requests;

  // Filtrar por usuário
  if (currentUser.role === 'client') {
    filteredRequests = filteredRequests.filter((request) => request.clientId === currentUser.id);
  }

  // Aplicar filtros
  if (searchText) {
    const searchLower = searchText.toLowerCase();
    filteredRequests = filteredRequests.filter(
      (request) =>
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.port.toLowerCase().includes(searchLower)
    );
  }

  if (searchStatus) {
    filteredRequests = filteredRequests.filter((request) => request.status === searchStatus);
  }

  if (searchDateFrom) {
    const fromDate = new Date(searchDateFrom);
    filteredRequests = filteredRequests.filter((request) => new Date(request.scheduledFor) >= fromDate);
  }

  if (searchDateTo) {
    const toDate = new Date(searchDateTo);
    toDate.setHours(23, 59, 59, 999);
    filteredRequests = filteredRequests.filter((request) => new Date(request.scheduledFor) <= toDate);
  }

  if (searchPort) {
    const portLower = searchPort.toLowerCase();
    filteredRequests = filteredRequests.filter((request) => request.port.toLowerCase().includes(portLower));
  }

  if (searchVessel) {
    const vesselLower = searchVessel.toLowerCase();
    filteredRequests = filteredRequests.filter((request) => request.vessel.toLowerCase().includes(vesselLower));
  }

  // Exibir resultados
  displaySearchResults(filteredRequests, currentUser, helpers);

  // Notificação de busca realizada
  showSuccessNotification('Busca realizada', `Encontrados ${filteredRequests.length} resultado(s)`, 3000);
}

/**
 * Exibe os resultados da busca em tabela
 * @param {Array} requests - Lista de solicitações encontradas
 * @param {Object} user - Usuário atual
 * @param {Object} helpers - Objeto com dependências injetadas
 * @param {Function} helpers.resolveUser - Função para resolver usuário por ID
 * @param {Function} helpers.buildStatusChip - Função para criar elemento de status
 * @param {Function} helpers.showRequestModal - Função para exibir modal de detalhes
 * @param {Object} helpers.state - Estado da aplicação
 */
export function displaySearchResults(requests, user, helpers) {
  const { buildStatusChip, showRequestModal, state } = helpers;

  const searchResults = document.getElementById('searchResults');
  const searchResultsCount = document.getElementById('searchResultsCount');
  const searchResultsList = document.getElementById('searchResultsList');

  if (!searchResults || !searchResultsCount || !searchResultsList) return;

  searchResults.removeAttribute('hidden');
  searchResultsCount.textContent = `${requests.length} resultado(s) encontrado(s)`;

  if (requests.length === 0) {
    searchResultsList.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum resultado encontrado</h3>
        <p>Tente ajustar os filtros de busca.</p>
      </div>
    `;
    return;
  }

  searchResultsList.innerHTML = `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Título</th>
            <th scope="col">Data prevista</th>
            <th scope="col">Status</th>
            <th scope="col">Porto</th>
            <th scope="col">Embarcação</th>
            <th scope="col"><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          ${requests
            .map((request) => {
              const safeTitle = escapeHtml(request.title);
              const safePort = escapeHtml(request.port);
              const safeVessel = escapeHtml(request.vessel);
              const safeRequestId = escapeHtml(request.id);

              return `
              <tr>
                <td>
                  <strong>${safeTitle}</strong>
                </td>
                <td>${formatDate(request.scheduledFor)}</td>
                <td>${buildStatusChip(request.status)}</td>
                <td>${safePort}</td>
                <td>${safeVessel}</td>
                <td>
                  <button class="secondary-button" type="button" data-request="${safeRequestId}">Detalhes</button>
                </td>
              </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  // Adicionar event listeners para os botões de detalhes
  searchResultsList.querySelectorAll('[data-request]').forEach((button) => {
    button.addEventListener('click', () => {
      const requestId = button.dataset.request;
      const request = state.requests.find((r) => r.id === requestId);
      if (request) {
        showRequestModal(request, user);
      }
    });
  });
}
