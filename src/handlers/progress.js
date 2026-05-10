import { safeTrim } from '../utils/string.js';
import { announce } from '../utils/dom.js';
import { createTimelineEntry, timelineItem } from '../components/timeline.js';
import { showInfoNotification } from '../ui/notifications.js';

export function handleProgressUpdate(event, request, operator, dialog, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const title = safeTrim(data.get('title'));
  const details = safeTrim(data.get('details'));
  const next = safeTrim(data.get('next'));

  if (!title || !details) return;

  const entry = createTimelineEntry({
    actor: operator,
    title,
    description: `${details}${next ? ` Próximos passos: ${next}.` : ''}`,
    category: 'operation',
  });
  request.timeline.push(entry);
  request.updatedAt = new Date().toISOString();
  request.assignedOperatorId = operator.id;

  helpers.saveState();
  form.reset();
  const timeline = dialog.querySelector('.timeline');
  if (timeline) timeline.insertAdjacentHTML('afterbegin', timelineItem(entry));
  announce('Checkpoint registrado.');
  showInfoNotification(
    'Checkpoint registrado!',
    `Nova atualização adicionada à solicitação ${request.id.toUpperCase()}`,
    4000
  );
  helpers.renderApp();
}
