import { safeTrim } from '../utils/string.js';
import { translateStatus } from '../utils/helpers.js';
import { announce } from '../utils/dom.js';
import { createTimelineEntry, timelineItem } from '../components/timeline.js';
import { buildStatusChip } from '../components/ui.js';
import { showSuccessNotification } from '../ui/notifications.js';

export function handleStatusUpdate(event, request, operator, dialog, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const status = data.get('status');
  const notes = safeTrim(data.get('notes'));
  const now = new Date().toISOString();

  if (!status) return;

  request.status = status;
  request.updatedAt = now;
  request.assignedOperatorId = operator.id;
  const entry = createTimelineEntry({
    actor: operator,
    title: `Status atualizado para ${translateStatus(status)}`,
    description: notes || 'Status modificado sem observações adicionais.',
    category: 'status',
  });
  request.timeline.push(entry);

  helpers.saveState();
  const select = form.querySelector('#statusSelect');
  if (select) select.value = status;
  const notesField = form.querySelector('#statusNotes');
  if (notesField) notesField.value = '';
  const statusChip = dialog.querySelector('.modal__header .status-chip');
  if (statusChip) statusChip.outerHTML = buildStatusChip(status);
  const timeline = dialog.querySelector('.timeline');
  if (timeline) timeline.insertAdjacentHTML('afterbegin', timelineItem(entry));
  helpers.renderApp();
  announce('Status atualizado com sucesso.');
  showSuccessNotification(
    'Status atualizado!',
    `Solicitação ${request.id.toUpperCase()} agora está: ${translateStatus(status)}`,
    4000
  );
}
