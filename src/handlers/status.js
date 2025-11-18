export function handleStatusUpdate(event, request, operator, dialog, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const status = data.get('status');
  const notes = helpers.safeTrim(data.get('notes'));
  const now = new Date().toISOString();

  if (!status) return;

  request.status = status;
  request.updatedAt = now;
  request.assignedOperatorId = operator.id;
  const entry = helpers.createTimelineEntry({
    actor: operator,
    title: `Status atualizado para ${helpers.translateStatus(status)}`,
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
  if (statusChip) statusChip.outerHTML = helpers.buildStatusChip(status);
  const timeline = dialog.querySelector('.timeline');
  if (timeline) timeline.insertAdjacentHTML('afterbegin', helpers.timelineItem(entry));
  helpers.renderApp();
  helpers.announce('Status atualizado com sucesso.');
  helpers.showSuccessNotification(
    'Status atualizado!',
    `Solicitação ${request.id.toUpperCase()} agora está: ${helpers.translateStatus(status)}`,
    4000
  );
}
