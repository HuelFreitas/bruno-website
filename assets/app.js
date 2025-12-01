import { jsPDF } from 'jspdf';
import { escapeHtml, safeTrim } from '../src/utils/string.js';
import { formatDate, uid, combineDateTime, formatFileSize } from '../src/utils/misc.js';
import { announce } from '../src/utils/dom.js';
import { parseTags, resolveUser } from '../src/utils/helpers.js';
import { loadState as loadStateFromStorage, saveState as saveStateToStorage, loadSession as loadSessionFromStorage, saveSession as saveSessionToStorage } from '../src/utils/storage.js';
import { timelineItem, createTimelineEntry } from '../src/components/timeline.js';
import { buildStatusChip } from '../src/components/ui.js';
import { emptyState, buildOperatorBoard, renderClientDashboard, renderOperatorDashboard } from '../src/components/dashboards.js';
import { handleStatusUpdate } from '../src/handlers/status.js';
import { handleProgressUpdate } from '../src/handlers/progress.js';
import { handleReportSubmission } from '../src/handlers/report.js';
import { handleClientNote, setupClientManagement, handleRequestDelete } from '../src/handlers/client.js';
import { operatorActions, clientActions } from '../src/handlers/actions.js';
import { createUploadArea, initializeUploadArea, handleFileUpload, renderEvidenceGallery, removeEvidence, viewEvidence } from '../src/components/upload.js';
import { showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification } from '../src/ui/notifications.js';
import { loadTheme as loadThemeFromStorage, applyTheme as applyThemeToDOM, toggleTheme as toggleThemeInDOM } from '../src/ui/theme.js';

const STORAGE_KEY = "guardcan:data:v1";
const SESSION_KEY = "guardcan:session";
const THEME_KEY = "guardcan:theme";

// `clone` moved to `src/utils/dom.js`

const companyAvailability = [
  { value: "08:00", label: "08:00 - 10:00", description: "Inspeções matinais com dupla K9" },
  { value: "10:00", label: "10:00 - 12:00", description: "Janela ideal para auditorias em docas" },
  { value: "13:30", label: "13:30 - 15:30", description: "Equipe disponível após pausa operacional" },
  { value: "16:00", label: "16:00 - 18:00", description: "Turno avançado para operações urgentes" },
];



const defaultState = {
  users: [
    {
      id: "client-porto",
      role: "client",
      name: "Marina Porto",
      email: "marina@portosafemar.com",
      company: "Porto Safe Mar",
    },
    {
      id: "operator-santos",
      role: "operator",
      name: "Carlos Silva",
      email: "carlos.silva@guardcan.com",
      certification: "Condutor K9 Nível III",
    },
  ],
  requests: [
    {
      id: "req-001",
      clientId: "client-porto",
      assignedOperatorId: "operator-santos",
      title: "Inspeção preventiva em navio mercante",
      port: "Porto de Santos",
      vessel: "MSC Aurora",
      cargo: "Contêineres refrigerados",
      scheduledFor: "2025-10-15T08:00:00",
      description:
        "Solicitação de inspeção preventiva com equipe K9 especializada em cargas sensíveis e perecíveis.",
      status: "in-progress",
      tags: ["prevenção", "contêiner", "perecíveis"],
      createdAt: "2025-10-01T08:30:00.000Z",
      updatedAt: "2025-10-08T14:45:00.000Z",
      timeline: [
        {
          id: "event-001",
          timestamp: "2025-10-01T08:30:00.000Z",
          actor: { id: "client-porto", name: "Marina Porto", role: "client" },
          title: "Solicitação enviada",
          description: "Cliente registrou inspeção preventiva para navio MSC Aurora.",
          category: "request",
        },
        {
          id: "event-002",
          timestamp: "2025-10-02T11:15:00.000Z",
          actor: { id: "operator-santos", name: "Carlos Silva", role: "operator" },
          title: "Operação confirmada",
          description:
            "Equipe K9 escalada para a missão. Check-list pré-embarque iniciado.",
          category: "operation",
        },
        {
          id: "event-003",
          timestamp: "2025-10-08T14:45:00.000Z",
          actor: { id: "operator-santos", name: "Carlos Silva", role: "operator" },
          title: "Inspeção em andamento",
          description: "Primeira varredura concluída, sem ocorrências até o momento.",
          category: "operation",
        },
      ],
      report: null,
    },
    {
      id: "req-002",
      clientId: "client-porto",
      assignedOperatorId: null,
      title: "Auditoria extraordinária",
      port: "Terminal de Aracruz",
      vessel: "Blue Atlantic",
      cargo: "Graneis sólidos",
      scheduledFor: "2025-11-03T13:30:00",
      description:
        "Auditoria solicitada após alerta da Receita Federal para cargas de alto risco.",
      status: "pending",
      tags: ["auditoria", "alto risco"],
      createdAt: "2025-10-04T09:12:00.000Z",
      updatedAt: "2025-10-04T09:12:00.000Z",
      timeline: [
        {
          id: "event-004",
          timestamp: "2025-10-04T09:12:00.000Z",
          actor: { id: "client-porto", name: "Marina Porto", role: "client" },
          title: "Solicitação aberta",
          description: "Cliente registrou auditoria extraordinária no terminal de Aracruz.",
          category: "request",
        },
      ],
      report: null,
    },
  ],
};

const app = document.querySelector("#app");
const logoutButton = document.querySelector("#logoutButton");
const themeToggle = document.querySelector("#themeToggle");
const yearLabel = document.querySelector("#year");
const userInfo = document.querySelector("#userInfo");
const userName = document.querySelector("#userName");
const userRole = document.querySelector("#userRole");
const userAvatar = document.querySelector("#userAvatar");

const state = loadStateFromStorage() || defaultState;
let session = loadSessionFromStorage() || {};

// Wrapper para resolveUser que injeta state.users
const resolveUserWrapper = (id) => resolveUser(id, state.users);

const uiState = {
  filterStatus: "all",
};

const theme = loadThemeFromStorage();
applyThemeToDOM(theme);

if (yearLabel) {
  yearLabel.textContent = String(new Date().getFullYear());
}

themeToggle?.addEventListener("click", toggleThemeInDOM);
logoutButton?.addEventListener("click", handleLogout);

// Garantir que o botão sair esteja escondido na inicialização
logoutButton.hidden = true;

renderApp();

function renderApp() {
  if (!session?.currentUserId) {
    logoutButton.hidden = true;
    hideUserInfo();
    renderLogin();
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
  updateUserInfo(currentUser);

  if (currentUser.role === "client") {
    renderClientDashboard(currentUser);
  } else {
    renderOperatorDashboard(currentUser);
  }
}

function renderLogin(feedback = null) {
  if (!app) {
    console.error('[renderLogin] ERROR: app element not found!');
    return;
  }
  
  app.innerHTML = `
    <section class="section-grid">
      <article class="card">
        <header>
          <h1>Portal B&amp;B Educacão</h1>
          <p>Faça login ou crie um acesso para acompanhar operações de fiscalização marítima com suporte da nossa equipe K9 especializada.</p>
        </header>
        <form id="loginForm" novalidate>
          <div>
            <label for="loginName">Nome completo</label>
            <input id="loginName" name="name" autocomplete="name" required placeholder="Ex.: Ana Costa" />
          </div>
          <div>
            <label for="loginEmail">E-mail corporativo</label>
            <input id="loginEmail" name="email" type="email" autocomplete="email" required placeholder="nome@empresa.com" />
          </div>
          <div>
            <label for="loginRole">Perfil de acesso</label>
            <select id="loginRole" name="role" required>
              <option value="" disabled selected>Selecione</option>
              <option value="client">Cliente - Solicitar inspeções</option>
              <option value="operator">Operador - Executar inspeções</option>
            </select>
          </div>
          <div id="companyField" class="conditional-field">
            <label for="loginCompany">Empresa / Órgão</label>
            <input id="loginCompany" name="company" placeholder="Informe a empresa ou órgão" />
          </div>
          <div id="certificationField" class="conditional-field" hidden>
            <label for="loginCertification">Certificação K9</label>
            <input id="loginCertification" name="certification" placeholder="Ex.: Condutor Nível II" />
          </div>
          <p id="loginFeedback" role="status" aria-live="polite" class="feedback"></p>
          <button class="primary-button" type="submit">Entrar no sistema</button>
        </form>
      </article>
      <article class="card">
        <h2>Como funciona</h2>
        <ul class="list-clean">
          <li><strong>Clientes</strong> registram solicitações, acompanham inspeções e baixam relatórios.</li>
          <li><strong>Operadores</strong> recebem missões, atualizam checkpoints e emitem relatórios finais.</li>
          <li>Toda ação gera rastreabilidade automática para auditorias.</li>
        </ul>
        <div class="tag-list" aria-label="Recursos principais">
          <span class="tag">Registro de inspeções</span>
          <span class="tag">Linha do tempo</span>
          <span class="tag">Relatórios inteligentes</span>
          <span class="tag">Mobile first</span>
        </div>
      </article>
    </section>
  `;

  const roleSelect = document.querySelector("#loginRole");
  const companyField = document.querySelector("#companyField");
  const certificationField = document.querySelector("#certificationField");
  const feedbackLabel = document.querySelector("#loginFeedback");

  if (feedback) {
    feedbackLabel.textContent = feedback.message;
    feedbackLabel.dataset.type = feedback.type;
  }

  roleSelect?.addEventListener("change", (event) => {
    const value = event.target.value;
    if (value === "client") {
      companyField.hidden = false;
      certificationField.hidden = true;
    } else if (value === "operator") {
      companyField.hidden = true;
      certificationField.hidden = false;
    } else {
      companyField.hidden = false;
      certificationField.hidden = true;
    }
  });

  document.querySelector("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = safeTrim(data.get("name"));
    const email = safeTrim(data.get("email")).toLowerCase();
    const role = data.get("role");
    const company = safeTrim(data.get("company"));
    const certification = safeTrim(data.get("certification"));

    if (!name || !email || !role) {
      feedbackLabel.textContent = "Preencha todas as informações obrigatórias.";
      feedbackLabel.dataset.type = "error";
      return;
    }

    let user = state.users.find((item) => item.email === email);

    if (user && user.role !== role) {
      feedbackLabel.textContent = "Este e-mail já está associado a um perfil diferente.";
      feedbackLabel.dataset.type = "error";
      return;
    }

    if (!user) {
      user = {
        id: uid(role === "client" ? "client" : "operator"),
        role,
        name,
        email,
      };

      if (role === "client") {
        user.company = company || "Organização não informada";
      } else {
        user.certification = certification || "Certificação pendente";
      }

      state.users.push(user);
      saveState();
    }

    session = { currentUserId: user.id };
    saveSession();
    renderApp();
    focusMain();
  });
}


function handleCreateRequest(event, user) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const scheduledDate = typeof data.get("scheduledFor") === "string" ? data.get("scheduledFor") : "";
  const scheduledTime = typeof data.get("scheduledTime") === "string" ? data.get("scheduledTime") : "";
  const scheduledFor = combineDateTime(scheduledDate, scheduledTime);

  // Validação de data
  if (scheduledDate && scheduledTime) {
    const scheduledDateTime = new Date(scheduledFor);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (scheduledDateTime < now) {
      showErrorNotification(
        "Data inválida",
        "Não é possível agendar inspeções no passado. Selecione uma data futura.",
        6000
      );
      return;
    }

    if (scheduledDateTime < tomorrow) {
      showWarningNotification(
        "Atenção",
        "Você está agendando para hoje. Certifique-se de que há tempo suficiente para preparação.",
        5000
      );
    }
  }
  const request = {
    id: uid("req"),
    clientId: user.id,
    assignedOperatorId: null,
    title: safeTrim(data.get("title")),
    port: safeTrim(data.get("port")),
    vessel: safeTrim(data.get("vessel")),
    cargo: safeTrim(data.get("cargo")) || "Não informado",
    scheduledFor,
    description: safeTrim(data.get("description")),
    status: "pending",
    tags: parseTags(data.get("tags")),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      createTimelineEntry({
        actor: user,
        title: "Solicitação registrada",
        description: "Cliente abriu uma nova inspeção via portal.",
        category: "request",
      }),
    ],
    report: null,
  };

  if (
    !request.title ||
    !request.port ||
    !request.vessel ||
    !request.description ||
    !scheduledDate ||
    !scheduledTime ||
    !request.scheduledFor
  ) {
    announce("Preencha todos os campos obrigatórios da solicitação.");
    return;
  }

  state.requests.unshift(request);
  saveState();
  form.reset();
  form.querySelector("input, select, textarea")?.focus();
  renderClientDashboard(user);
  announce("Solicitação registrada com sucesso.");
  showSuccessNotification(
    "Solicitação criada!",
    `Inspeção "${request.title}" foi registrada com sucesso. ID: ${request.id.toUpperCase()}`,
    6000
  );
}

function attachRequestModalHandlers(user) {
  app.querySelectorAll("[data-request]").forEach((button) => {
    button.addEventListener("click", () => {
      const requestId = button.dataset.request;
      const request = state.requests.find((item) => item.id === requestId);
      if (request) {
        showRequestModal(request, user);
      }
    });
  });
}

function showRequestModal(request, viewer) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal";
  const assignedOperator = request.assignedOperatorId
    ? state.users.find((user) => user.id === request.assignedOperatorId)
    : null;
  const client = resolveUserWrapper(request.clientId);

  const safeRequestIdBadge = escapeHtml(request.id.toUpperCase());
  const safeTitle = escapeHtml(request.title);
  const safePort = escapeHtml(request.port);
  const safeVessel = escapeHtml(request.vessel);
  const safeDescription = escapeHtml(request.description);
  const safeCargo = escapeHtml(request.cargo || "Não informado");
  const safeClientName = escapeHtml(client.name);
  const safeOperatorName = assignedOperator
    ? escapeHtml(assignedOperator.name)
    : "";
  const safeSchedule = escapeHtml(formatDate(request.scheduledFor));
  const tagListMarkup =
    request.tags?.length
      ? request.tags
          .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
          .join("")
      : "";

  dialog.innerHTML = `
    <div class="modal__header">
      <div>
        <p class="badge">${safeRequestIdBadge}</p>
        <h3 data-field="title">${safeTitle}</h3>
        <p data-field="header-summary">${safePort} • ${safeVessel}</p>
      </div>
      <div>
        ${buildStatusChip(request.status)}
      </div>
    </div>
    <div class="modal__body">
      <section aria-label="Detalhes da operação">
        <h4>Detalhes gerais</h4>
        <p><strong>Cliente:</strong> <span data-field="client-name">${safeClientName}</span></p>
        <p><strong>Operador:</strong> <span data-field="operator-name">${safeOperatorName || "A definir"}</span></p>
        <p><strong>Data e horário:</strong> <span data-field="schedule">${safeSchedule}</span></p>
        <p><strong>Porto / Terminal:</strong> <span data-field="port">${safePort}</span></p>
        <p><strong>Embarcação:</strong> <span data-field="vessel">${safeVessel}</span></p>
        <p><strong>Tipo de carga:</strong> <span data-field="cargo">${safeCargo}</span></p>
        <p><strong>Descrição:</strong> <span data-field="description">${safeDescription}</span></p>
        <div class="tag-list" data-field="tags" ${tagListMarkup ? "" : "hidden"}>${tagListMarkup}</div>
      </section>
      <section aria-label="Linha do tempo" class="timeline-section">
        <h4>Histórico</h4>
        <div class="timeline">
          ${request.timeline
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((event) => timelineItem(event))
            .join("")}
        </div>
      </section>
      ${viewer.role === "operator" ? operatorActions(request, viewer) : clientActions(request, viewer, { companyAvailability })}
      ${createUploadArea(request.id)}
    </div>
    <div class="modal__footer">
      ${request.report ? `<button class="secondary-button" type="button" data-export>Gerar relatório</button>` : ""}
      <button class="ghost-button" type="button" data-close>Fechar</button>
    </div>
  `;

  document.body.appendChild(dialog);
  dialog.showModal();

  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("close", () => {
    dialog.remove();
    renderApp();
  });

  if (viewer.role === "operator") {
    dialog
      .querySelector("#statusForm")
      ?.addEventListener("submit", (event) => handleStatusUpdate(event, request, viewer, dialog));

    dialog
      .querySelector("#progressForm")
      ?.addEventListener("submit", (event) => handleProgressUpdate(event, request, viewer, dialog));

    dialog
      .querySelector("#reportForm")
      ?.addEventListener("submit", (event) => handleReportSubmission(event, request, viewer, dialog));
  } else {
    dialog
      .querySelector("#clientNoteForm")
      ?.addEventListener("submit", (event) => handleClientNote(event, request, viewer, dialog));
    setupClientManagement(dialog, request, viewer);
  }

  dialog.querySelector("[data-export]")?.addEventListener("click", () => exportReport(request));

  // Inicializar sistema de upload
  const uploadHelpers = {
    findRequestById: (id) => state.requests.find((r) => r.id === id),
    findRequestByEvidenceId: (evidenceId) => state.requests.find((r) => r.evidence && r.evidence.find((e) => e.id === evidenceId)),
    findUserById: (id) => state.users.find((u) => u.id === id),
    showErrorNotification,
    showSuccessNotification,
    showWarningNotification,
    uid,
    saveState,
    escapeHtml,
    formatDate,
    confirm: (msg) => confirm(msg),
  };
  initializeUploadArea(request.id, request, uploadHelpers);
}

// `operatorActions` and `clientActions` moved to `src/handlers/actions.js` (imported above)

// Client management handlers moved to `src/handlers/client.js`

// Metrics handlers moved to `src/handlers/metrics.js` (imported above)

// `buildRequestTable` moved to `src/components/requests.js` (imported above)
// `buildOperatorBoard` moved to `src/components/dashboards.js` (imported above)
// `emptyState` moved to `src/components/dashboards.js` (imported above)
// `buildStatusChip` moved to `src/components/ui.js` (imported above)

// `buildStatusFilterTab` moved to `src/components/ui.js`

// timelineItem moved to `src/components/timeline.js`

function exportReport(request) {
  if (!request.report) return;
  const client = resolveUserWrapper(request.clientId);
  const operator = resolveUserWrapper(request.report.operatorId || request.assignedOperatorId);

  // Usar exclusivamente o import ESM `jsPDF` (dependência explícita em package.json)
  if (typeof jsPDF === 'undefined') {
    showErrorNotification(
      'Biblioteca não carregada',
      'A biblioteca PDF não está disponível. Execute `npm install` para instalar dependências.',
      5000
    );
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Configurações do documento
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;
    
    // Função para adicionar texto com quebra de linha
    const addText = (text, x = margin, y = yPosition, options = {}) => {
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, x, y, options);
      return y + (lines.length * 6) + 5;
    };
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    yPosition = addText(`Relatório B&B Educacão - ${request.title}`, margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(`Código: ${request.id.toUpperCase()} • ${formatDate(request.report.generatedAt)}`, margin, yPosition);
    
    // Linha separadora
    yPosition += 10;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Resumo executivo
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Resumo Executivo', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(request.report.summary, margin, yPosition);
    yPosition += 10;
    
    // Achados
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Achados / Ocorrências', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(request.report.findings, margin, yPosition);
    yPosition += 10;
    
    // Recomendações
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Recomendações', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(request.report.recommendations, margin, yPosition);
    yPosition += 10;
    
    // Dados da operação
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Dados da Operação', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(`Cliente: ${client.name}`, margin, yPosition);
    yPosition = addText(`Operador: ${operator.name}`, margin, yPosition);
    yPosition = addText(`Porto: ${request.port}`, margin, yPosition);
    yPosition = addText(`Embarcação: ${request.vessel}`, margin, yPosition);
    yPosition = addText(`Data: ${formatDate(request.scheduledFor)}`, margin, yPosition);
    yPosition += 10;
    
    // Evidências
    if (request.evidence && request.evidence.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      yPosition = addText('Evidências Anexadas', margin, yPosition);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      request.evidence.forEach(evidence => {
        yPosition = addText(`• ${evidence.name} (${formatFileSize(evidence.size)})`, margin, yPosition);
      });
      yPosition += 10;
    }
    
    // Linha do tempo
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Linha do Tempo', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const sortedTimeline = request.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    sortedTimeline.forEach(event => {
      yPosition = addText(`${formatDate(event.timestamp)} - ${event.title}`, margin, yPosition);
      yPosition = addText(`Por: ${event.actor?.name || 'Usuário'}`, margin + 10, yPosition);
      yPosition = addText(event.description, margin + 10, yPosition);
      yPosition += 5;
    });
    
    // Rodapé
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('B&B Educacão • Fiscalização marítima com cães farejadores', pageWidth/2, pageHeight - 10, { align: 'center' });
    
    // Salvar o PDF
    const fileName = `relatorio_${request.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showSuccessNotification(
      "PDF gerado!",
      `Relatório ${request.id.toUpperCase()} foi exportado como PDF`,
      4000
    );
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    showErrorNotification(
      "Erro ao gerar PDF",
      "Ocorreu um erro ao gerar o arquivo PDF. Tente novamente.",
      5000
    );
  }
}

// `loadState`, `saveState`, `loadSession`, `saveSession` moved to `src/utils/storage.js`

// Wrapper functions to maintain compatibility
const loadState = () => loadStateFromStorage(defaultState);
const saveState = () => saveStateToStorage(state);
const loadSession = () => loadSessionFromStorage();
const saveSession = () => saveSessionToStorage(session);

function handleLogout() {
  session = null;
  saveSession();
  hideUserInfo(); // Limpar informações do usuário
  logoutButton.hidden = true; // Garantir que o botão sair seja escondido
  renderApp();
  focusMain();
}

// Sistema de Notificações Visuais
// (moved to `src/ui/notifications.js`)

// Search functions moved to `src/components/search.js`

function focusMain() {
  requestAnimationFrame(() => {
    app?.focus();
  });
}

// `loadTheme`, `applyTheme`, `toggleTheme`, `updateThemeToggleLabel` moved to `src/ui/theme.js`

// Wrapper functions to maintain compatibility
const loadTheme = () => loadThemeFromStorage(THEME_KEY);
const applyTheme = (theme) => applyThemeToDOM(theme, THEME_KEY, themeToggle);
const toggleTheme = () => toggleThemeInDOM(THEME_KEY, themeToggle);

// Função para atualizar informações do usuário no header
function updateUserInfo(user) {
  if (!user || !userInfo || !userName || !userRole || !userAvatar) return;

  // Mostrar informações do usuário
  userInfo.hidden = false;
  
  // Atualizar nome
  userName.textContent = user.name;
  
  // Atualizar role com texto mais amigável
  const roleText = user.role === "client" ? "Cliente" : "Operador";
  userRole.textContent = roleText;
  
  // Atualizar avatar baseado no role
  if (user.role === "operator") {
    userAvatar.textContent = "🔧";
    userInfo.className = "user-info operator";
    
    // Adicionar tooltip com certificação
    const certification = user.certification || "Certificação não informada";
    userInfo.title = `${user.name} (${roleText})\n${certification}`;
  } else {
    userAvatar.textContent = "🏢";
    userInfo.className = "user-info client";
    
    // Adicionar tooltip com empresa
    const company = user.company || "Empresa não informada";
    userInfo.title = `${user.name} (${roleText})\n${company}`;
  }
}

// Função para esconder informações do usuário
function hideUserInfo() {
  if (userInfo) {
    userInfo.hidden = true;
    // Limpar dados do card
    if (userName) userName.textContent = "";
    if (userRole) userRole.textContent = "";
    if (userAvatar) userAvatar.textContent = "👤";
    // Remover classes específicas do role
    userInfo.className = "user-info";
    // Limpar tooltip
    userInfo.title = "";
  }
}

// ========== INICIALIZAÇÃO DA APLICAÇÃO ==========

document.addEventListener('DOMContentLoaded', () => {
  // Atualizar ano no footer
  const yearSpan = document.querySelector('#year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  // Renderizar aplicação com base no estado de sessão
  if (session.currentUserId) {
    const currentUser = state.users.find((u) => u.id === session.currentUserId);
    if (currentUser) {
      renderApp();
    } else {
      renderLogin({ message: "Sessão inválida. Faça login novamente.", type: "error" });
    }
  } else {
    renderLogin();
  }

  // Configurar evento de toggle de tema
  const themeToggle = document.querySelector('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleThemeInDOM();
    });
  }

  // Configurar evento de logout
  const logoutButton = document.querySelector('#logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
});
