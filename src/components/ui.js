export function metricCard(label, value, tone = 'primary') {
  const toneClass =
    tone === 'success' ? 'status--completed' : tone === 'warning' ? 'status--pending' : tone === 'info' ? 'status--in-progress' : '';
  return `
    <article class="card" aria-label="${label}">
      <h2>${value}</h2>
      <p>${label}</p>
      ${toneClass ? `<span class="status-chip ${toneClass}">${label}</span>` : ''}
    </article>
  `;
}

export function buildStatusFilterTab(value, label, current) {
  return `<button class="tab" type="button" role="tab" data-active="${current === value}" data-filter="${value}">${label}</button>`;
}

export function createSearchInterface() {
  return `
    <div class="search-container">
      <div class="search-header">
        <h3 class="search-title">Busca Avançada</h3>
        <button class="search-toggle" id="toggleSearch" type="button">
          <span id="searchToggleText">Mostrar filtros</span>
        </button>
      </div>
      
      <form id="searchForm" class="search-form" hidden>
        <div class="search-field">
          <label for="searchText">Texto</label>
          <input id="searchText" type="text" placeholder="Buscar por título, descrição, porto..." />
        </div>
        
        <div class="search-field">
          <label for="searchStatus">Status</label>
          <select id="searchStatus">
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="in-progress">Em andamento</option>
            <option value="completed">Concluída</option>
          </select>
        </div>
        
        <div class="search-field">
          <label for="searchDateFrom">Data inicial</label>
          <input id="searchDateFrom" type="date" />
        </div>
        
        <div class="search-field">
          <label for="searchDateTo">Data final</label>
          <input id="searchDateTo" type="date" />
        </div>
        
        <div class="search-field">
          <label for="searchPort">Porto</label>
          <input id="searchPort" type="text" placeholder="Nome do porto" />
        </div>
        
        <div class="search-field">
          <label for="searchVessel">Embarcação</label>
          <input id="searchVessel" type="text" placeholder="Nome da embarcação" />
        </div>
        
        <div class="search-actions">
          <button type="button" class="ghost-button" id="clearSearch">Limpar</button>
          <button type="submit" class="primary-button">Buscar</button>
        </div>
      </form>
      
      <div id="searchResults" class="search-results" hidden>
        <div class="search-results-header">
          <span class="search-results-count" id="searchResultsCount"></span>
          <button class="search-clear" id="clearSearchResults">Limpar resultados</button>
        </div>
        <div id="searchResultsList"></div>
      </div>
    </div>
  `;
}

/**
 * Constrói um chip (badge) com status visual da requisição
 * @param {string} status - Status da requisição (pending, in-progress, completed)
 * @returns {string} HTML do chip de status
 */
export function buildStatusChip(status) {
  const map = {
    pending: { label: "Pendente", className: "status--pending" },
    "in-progress": { label: "Em andamento", className: "status--in-progress" },
    completed: { label: "Concluída", className: "status--completed" },
  };
  const entry = map[status] || map.pending;
  return `<span class="status-chip ${entry.className}">${entry.label}</span>`;
}
