/**
 * Modal utilities: attach handlers and show modal.
 * These functions are implementation-light: they receive a `helpers` object
 * with all external dependencies to keep the module testable.
 */

export function attachRequestModalHandlers(container, user, helpers) {
  const root = container || document;
  root.querySelectorAll('[data-request]').forEach((button) => {
    // remove previous handlers by cloning
    const existing = button;
    const newBtn = existing.cloneNode(true);
    existing.parentNode.replaceChild(newBtn, existing);
    newBtn.addEventListener('click', () => {
      const requestId = newBtn.dataset.request;
      const request = helpers.findRequestById(requestId);
      if (request) helpers.showRequestModal(request, user);
    });
  });
}

export function showRequestModal(request, viewer, helpers) {
  const { resolveUser, escapeHtml, formatDate, timelineItem, operatorActions, clientActions, createUploadArea, initializeUploadArea, handleStatusUpdate, handleProgressUpdate, handleReportSubmission, handleClientNote, setupClientManagement, exportReport, renderApp, announce, buildStatusChip } = helpers;

  const dialog = document.createElement('dialog');
  dialog.className = 'modal';

  const assignedOperator = request.assignedOperatorId ? helpers.findUserById(request.assignedOperatorId) : null;
  const client = resolveUser(request.clientId);

  const safeRequestIdBadge = escapeHtml(request.id.toUpperCase());
  const safeTitle = escapeHtml(request.title);
  const safePort = escapeHtml(request.port);
  const safeVessel = escapeHtml(request.vessel);
  const safeDescription = escapeHtml(request.description);
  const safeCargo = escapeHtml(request.cargo || 'Não informado');
  const safeClientName = escapeHtml(client.name);
  const safeOperatorName = assignedOperator ? escapeHtml(assignedOperator.name) : '';
  const safeSchedule = escapeHtml(formatDate(request.scheduledFor));
  const tagListMarkup = request.tags?.length ? request.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('') : '';

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
        <p><strong>Operador:</strong> <span data-field="operator-name">${safeOperatorName || 'A definir'}</span></p>
        <p><strong>Data e horário:</strong> <span data-field="schedule">${safeSchedule}</span></p>
        <p><strong>Porto / Terminal:</strong> <span data-field="port">${safePort}</span></p>
        <p><strong>Embarcação:</strong> <span data-field="vessel">${safeVessel}</span></p>
        <p><strong>Tipo de carga:</strong> <span data-field="cargo">${safeCargo}</span></p>
        <p><strong>Descrição:</strong> <span data-field="description">${safeDescription}</span></p>
        <div class="tag-list" data-field="tags" ${tagListMarkup ? '' : 'hidden'}>${tagListMarkup}</div>
      </section>
      <section aria-label="Linha do tempo" class="timeline-section">
        <h4>Histórico</h4>
        <div class="timeline">
          ${request.timeline.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).map((event)=>timelineItem(event)).join('')}
        </div>
      </section>
      ${viewer.role === 'operator' ? operatorActions(request, viewer) : clientActions(request, viewer)}
      ${createUploadArea(request.id)}
    </div>
    <div class="modal__footer">
      ${request.report ? `<button class="secondary-button" type="button" data-export>Gerar relatório</button>` : ''}
      <button class="ghost-button" type="button" data-close>Fechar</button>
    </div>
  `;

  document.body.appendChild(dialog);
  dialog.showModal();

  dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('close', () => {
    dialog.remove();
    renderApp();
  });

  if (viewer.role === 'operator') {
    dialog.querySelector('#statusForm')?.addEventListener('submit', (e)=>handleStatusUpdate(e, request, viewer, dialog));
    dialog.querySelector('#progressForm')?.addEventListener('submit', (e)=>handleProgressUpdate(e, request, viewer, dialog));
    dialog.querySelector('#reportForm')?.addEventListener('submit', (e)=>handleReportSubmission(e, request, viewer, dialog));
  } else {
    dialog.querySelector('#clientNoteForm')?.addEventListener('submit', (e)=>handleClientNote(e, request, viewer, dialog));
    setupClientManagement(dialog, request, viewer);
  }

  dialog.querySelector('[data-export]')?.addEventListener('click', () => exportReport(request));

  initializeUploadArea(request.id, request);
  announce('Modal aberto');
}
