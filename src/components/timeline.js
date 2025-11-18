import { escapeHtml } from '../utils/string.js';
import { formatDate } from '../utils/misc.js';

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
