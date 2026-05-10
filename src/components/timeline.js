import { escapeHtml } from '../utils/string.js';
import { formatDate } from '../utils/misc.js';
import { uid } from '../utils/misc.js';

export function timelineItem(event) {
  return `
    <article class="timeline__item">
      <header>
        <strong>${escapeHtml(event.title)}</strong>
      </header>
      <p>${escapeHtml(event.description)}</p>
      <p class="timeline__meta">${formatDate(event.timestamp)} • ${escapeHtml(event.actor?.name || 'Usuário')}</p>
    </article>
  `;
}

/**
 * Cria uma entrada de timeline com informações do ator
 * @param {Object} options - Opções da entrada
 * @param {Object} options.actor - Dados do ator (id, name, role)
 * @param {string} options.title - Título do evento
 * @param {string} options.description - Descrição do evento
 * @param {string} options.category - Categoria do evento
 * @returns {Object} Objeto de entrada de timeline
 */
export function createTimelineEntry({ actor, title, description, category }) {
  return {
    id: uid("event"),
    timestamp: new Date().toISOString(),
    actor: {
      id: actor.id,
      name: actor.name,
      role: actor.role,
    },
    title,
    description,
    category,
  };
}

/**
 * Atualiza os detalhes de uma requisição no modal
 * @param {HTMLElement} dialog - Elemento do modal
 * @param {Object} request - Dados da requisição
 */
export function updateRequestDetailsInModal(dialog, request) {
  const titleField = dialog.querySelector('[data-field="title"]');
  if (titleField) titleField.textContent = request.title;

  const summaryField = dialog.querySelector('[data-field="header-summary"]');
  if (summaryField) summaryField.textContent = `${request.port} • ${request.vessel}`;

  const portField = dialog.querySelector('[data-field="port"]');
  if (portField) portField.textContent = request.port;

  const vesselField = dialog.querySelector('[data-field="vessel"]');
  if (vesselField) vesselField.textContent = request.vessel;

  const cargoField = dialog.querySelector('[data-field="cargo"]');
  if (cargoField) cargoField.textContent = request.cargo || "Não informado";

  const descriptionField = dialog.querySelector('[data-field="description"]');
  if (descriptionField) descriptionField.textContent = request.description;

  const scheduleField = dialog.querySelector('[data-field="schedule"]');
  if (scheduleField) scheduleField.textContent = formatDate(request.scheduledFor);

  const tagsContainer = dialog.querySelector('[data-field="tags"]');
  if (tagsContainer) {
    if (request.tags?.length) {
      tagsContainer.innerHTML = request.tags
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");
      tagsContainer.removeAttribute("hidden");
    } else {
      tagsContainer.innerHTML = "";
      tagsContainer.setAttribute("hidden", "");
    }
  }
}
