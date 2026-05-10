export function handleProgressUpdate(event, request, operator, dialog, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const title = helpers.safeTrim(data.get('title'));
  const details = helpers.safeTrim(data.get('details'));
  const next = helpers.safeTrim(data.get('next'));

  if (!title || !details) return;

  const entry = helpers.createTimelineEntry({
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
  if (timeline) timeline.insertAdjacentHTML('afterbegin', helpers.timelineItem(entry));
  helpers.announce('Checkpoint registrado.');
  helpers.showInfoNotification(
    'Checkpoint registrado!',
    `Nova atualização adicionada à solicitação ${request.id.toUpperCase()}`,
    4000
  );
  helpers.renderApp();
}
