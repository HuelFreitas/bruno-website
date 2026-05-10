import { escapeHtml } from '../src/utils/string.js';
import { formatDate } from '../src/utils/misc.js';
import { companyAvailability, defaultState } from '../src/data/constants.js';
import { resolveUser } from '../src/utils/helpers.js';
import { loadState as loadStateFromStorage, saveState as saveStateToStorage, loadSession as loadSessionFromStorage, saveSession as saveSessionToStorage } from '../src/utils/storage.js';
import { metricCard, buildStatusFilterTab, createSearchInterface, buildStatusChip } from '../src/components/ui.js';
import { buildMetrics, buildOperatorMetrics } from '../src/handlers/metrics.js';
import { buildRequestTable } from '../src/components/requests.js';
import { initializeCalendar } from '../src/components/calendar.js';
import { initializeSearch, performSearch as performSearchFn, displaySearchResults as displaySearchResultsFn } from '../src/components/search.js';
import { emptyState, buildOperatorBoard, renderClientDashboard, renderOperatorDashboard } from '../src/components/dashboards.js';
import { showSuccessNotification, showInfoNotification } from '../src/ui/notifications.js';
import { renderLogin as renderLoginFn } from '../src/components/login.js';
import { updateUserInfo as updateUserInfoFn, hideUserInfo as hideUserInfoFn } from '../src/components/header.js';
import { handleCreateRequest as handleCreateRequestFn } from '../src/handlers/requests.js';
import { attachRequestModalHandlers as attachModalHandlersFn, showRequestModal as showRequestModalFn } from '../src/components/modal.js';


const app = document.querySelector("#app");
const logoutButton = document.querySelector("#logoutButton");
const userInfo = document.querySelector("#userInfo");
const userName = document.querySelector("#userName");
const userRole = document.querySelector("#userRole");
const userAvatar = document.querySelector("#userAvatar");

const state = loadStateFromStorage(defaultState);
let session = loadSessionFromStorage() || {};

const resolveUserWrapper = (id) => resolveUser(id, state.users);

const uiState = {
  filterStatus: "all",
};

const saveState = () => saveStateToStorage(state);
const saveSession = () => saveSessionToStorage(session);

function handleLogin(userId) {
  session = { currentUserId: userId };
  saveSession();
  renderApp();
  focusMain();
}

function renderApp() {
  if (!session?.currentUserId) {
    logoutButton.hidden = true;
    hideUserInfoFn({ userInfo, userName, userRole, userAvatar });
    renderLoginFn(app, { state, saveState, onLogin: handleLogin });
    return;
  }

  const currentUser = state.users.find((user) => user.id === session.currentUserId);
  if (!currentUser) {
    session = null;
    saveSession();
    renderApp();
    return;
  }

  logoutButton.hidden = false;
  updateUserInfoFn(currentUser, { userInfo, userName, userRole, userAvatar });

  if (currentUser.role === "client") {
    renderCurrentClientDashboard(currentUser);
  } else {
    renderCurrentOperatorDashboard(currentUser);
  }
}

function renderCurrentOperatorDashboard(user) {
  renderOperatorDashboard({
    user,
    state,
    buildOperatorMetrics,
    metricCard,
    buildOperatorBoard,
    emptyState,
    app,
    attachRequestModalHandlers: (u) => attachModalHandlersFn(app, u, {
      findRequestById: (id) => state.requests.find((r) => r.id === id),
      showRequestModal: (request) => showRequestModal(request, u),
    }),
  });
}

function renderCurrentClientDashboard(user) {
  const modalHelpers = {
    findRequestById: (id) => state.requests.find((r) => r.id === id),
    showRequestModal: (request) => showRequestModal(request, user),
    resolveUser: resolveUserWrapper,
    escapeHtml,
    formatDate,
    buildStatusChip,
    emptyState,
    session,
    showSuccessNotification,
    showInfoNotification,
    displaySearchResults: (requests) =>
      displaySearchResultsFn(requests, user, {
        escapeHtml,
        formatDate,
        buildStatusChip,
        resolveUser: resolveUserWrapper,
        emptyState,
      }),
  };

  renderClientDashboard({
    user,
    state,
    uiState,
    buildMetrics,
    metricCard,
    buildStatusFilterTab,
    createSearchInterface,
    buildRequestTable,
    handleCreateRequest: (event, u) => handleCreateRequestFn(event, u, { state, saveState, rerender: renderCurrentClientDashboard }),
    initCalendar: (requests, u) =>
      initializeCalendar(requests, u, {
        showRequestModal: (request) => showRequestModal(request, u),
      }),
    initSearchModule: initializeSearch,
    performSearchModule: performSearchFn,
    displaySearchResultsModule: displaySearchResultsFn,
    app,
    saveState,
    renderApp,
    companyAvailability,
    attachModalHandlers: (_container, u) => attachModalHandlersFn(app, u, modalHelpers),
    modalHelpers,
  });
}

function showRequestModal(request, viewer) {
  showRequestModalFn(request, viewer, { state, resolveUser: resolveUserWrapper, saveState, renderApp });
}


function handleLogout() {
  session = null;
  saveSession();
  hideUserInfoFn({ userInfo, userName, userRole, userAvatar });
  logoutButton.hidden = true;
  renderApp();
  focusMain();
}

function focusMain() {
  requestAnimationFrame(() => {
    app?.focus();
  });
}

function initApp() {
  const yearSpan = document.querySelector('#year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();

  if (session.currentUserId) {
    const currentUser = state.users.find((u) => u.id === session.currentUserId);
    if (currentUser) {
      renderApp();
    } else {
      renderLoginFn(app, { state, saveState, onLogin: handleLogin, feedback: { message: "Sessão inválida. Faça login novamente.", type: "error" } });
    }
  } else {
    renderLoginFn(app, { state, saveState, onLogin: handleLogin });
  }

  logoutButton?.removeEventListener('click', handleLogout);
  logoutButton?.addEventListener('click', handleLogout);
}

if (document.readyState !== 'loading') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}
