import { formatFileSize } from '../utils/misc.js';

export function createUploadArea(requestId) {
  return `
    <div class="card" style="box-shadow:none; border:1px solid var(--border); background: var(--surface-alt);" aria-label="Evidências da operação">
      <h4>Evidências da operação</h4>
      <p>Adicione fotos, documentos ou outros arquivos relevantes para esta inspeção.</p>
      
      <div class="upload-area" id="uploadArea-${requestId}">
        <input type="file" id="fileInput-${requestId}" multiple accept="image/*,.pdf,.doc,.docx,.txt" />
        <div class="upload-icon">📁</div>
        <p class="upload-text">Clique aqui ou arraste arquivos para adicionar evidências</p>
        <p class="upload-hint">Formatos aceitos: JPG, PNG, PDF, DOC, TXT (máx. 10MB por arquivo)</p>
      </div>
      
      <div class="evidence-gallery" id="evidenceGallery-${requestId}">
        <!-- Evidências serão inseridas aqui -->
      </div>
    </div>
  `;
}

export function initializeUploadArea(requestId, request, helpers) {
  const uploadArea = document.getElementById(`uploadArea-${requestId}`);
  const fileInput = document.getElementById(`fileInput-${requestId}`);
  const gallery = document.getElementById(`evidenceGallery-${requestId}`);
  if (!uploadArea || !fileInput || !gallery) return;

  if (request.evidence && request.evidence.length > 0) {
    renderEvidenceGallery(request.evidence, gallery, requestId, helpers);
  }

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFileUpload(e.dataTransfer.files, requestId, helpers);
  });

  uploadArea.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files, requestId, helpers);
    fileInput.value = '';
  });

  // delegate gallery actions
  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const evidenceId = btn.closest('.evidence-item')?.dataset.evidenceId;
    if (action === 'remove' && evidenceId) removeEvidence(evidenceId, requestId, helpers);
    if (action === 'view' && evidenceId) viewEvidence(evidenceId, helpers);
  });
}

export function handleFileUpload(files, requestId, helpers) {
  const request = helpers.findRequestById(requestId);
  if (!request) return;
  if (!request.evidence) request.evidence = [];

  Array.from(files).forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      helpers.showErrorNotification('Arquivo muito grande', `O arquivo "${file.name}" excede o limite de 10MB`, 5000);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      helpers.showErrorNotification('Tipo de arquivo não permitido', `O arquivo "${file.name}" não é um tipo suportado`, 5000);
      return;
    }

    const evidence = {
      id: helpers.uid('evidence'),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      data: null,
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      evidence.data = e.target.result;
      request.evidence.push(evidence);
      helpers.saveState();
      const gallery = document.getElementById(`evidenceGallery-${requestId}`);
      renderEvidenceGallery(request.evidence, gallery, requestId, helpers);
      helpers.showSuccessNotification('Evidência adicionada', `Arquivo "${file.name}" foi adicionado com sucesso`, 3000);
    };
    reader.readAsDataURL(file);
  });
}

export function renderEvidenceGallery(evidenceList, gallery, requestId, helpers) {
  if (!gallery || !evidenceList) return;
  gallery.innerHTML = evidenceList
    .map((evidence) => {
      const isImage = evidence.type.startsWith('image/');
      const fileSize = formatFileSize(evidence.size);
      return `
        <div class="evidence-item" data-evidence-id="${evidence.id}">
          ${isImage ? `<img src="${evidence.data}" alt="${helpers.escapeHtml(evidence.name)}" class="evidence-preview">` : `<div class="file-icon">📄</div>`}
          <div class="evidence-info">
            <div class="evidence-name">${helpers.escapeHtml(evidence.name)}</div>
            <div>${fileSize} • ${helpers.formatDate(evidence.uploadedAt)}</div>
          </div>
          <div class="evidence-actions">
            ${isImage ? `<button class="evidence-action" data-action="view" title="Visualizar">👁️</button>` : ''}
            <button class="evidence-action danger" data-action="remove" title="Remover">🗑️</button>
          </div>
        </div>
      `;
    })
    .join('');
}

export function removeEvidence(evidenceId, requestId, helpers) {
  const request = helpers.findRequestById(requestId);
  if (!request || !request.evidence) return;
  const evidence = request.evidence.find((e) => e.id === evidenceId);
  if (!evidence) return;
  if (!helpers.confirm(`Tem certeza que deseja remover a evidência "${evidence.name}"?`)) return;
  request.evidence = request.evidence.filter((e) => e.id !== evidenceId);
  helpers.saveState();
  const gallery = document.getElementById(`evidenceGallery-${requestId}`);
  renderEvidenceGallery(request.evidence, gallery, requestId, helpers);
  helpers.showWarningNotification('Evidência removida', `O arquivo "${evidence.name}" foi removido`, 3000);
}

export function viewEvidence(evidenceId, helpers) {
  const request = helpers.findRequestByEvidenceId(evidenceId);
  if (!request) return;
  const evidence = request.evidence.find((e) => e.id === evidenceId);
  if (!evidence || !evidence.type.startsWith('image/')) return;
  const modal = document.createElement('dialog');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal__header">
      <h3>${helpers.escapeHtml(evidence.name)}</h3>
      <button class="notification__close" data-close>×</button>
    </div>
    <div class="modal__body">
      <img src="${evidence.data}" alt="${helpers.escapeHtml(evidence.name)}" style="width: 100%; max-height: 70vh; object-fit: contain;">
      <p style="margin-top: 1rem; color: var(--text-secondary);">Tamanho: ${formatFileSize(evidence.size)} • Adicionado em: ${helpers.formatDate(evidence.uploadedAt)}</p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.showModal();
  modal.querySelector('[data-close]')?.addEventListener('click', () => modal.close());
  modal.addEventListener('close', () => modal.remove());
}
