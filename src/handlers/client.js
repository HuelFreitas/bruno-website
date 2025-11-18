export function handleClientNote(event, request, client, dialog, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const note = helpers.safeTrim(data.get('note'));
  if (!note) return;

  const entry = helpers.createTimelineEntry({
    actor: client,
    title: 'Cliente adicionou observação',
    description: note,
    category: 'client',
  });
  request.timeline.push(entry);
  request.updatedAt = new Date().toISOString();
  helpers.saveState();
  form.reset();
  const timeline = dialog.querySelector('.timeline');
  if (timeline) timeline.insertAdjacentHTML('afterbegin', helpers.timelineItem(entry));
  helpers.announce('Mensagem adicionada ao histórico.');
  helpers.renderApp();
}

export function setupClientManagement(dialog, request, client, helpers) {
  const editToggle = dialog.querySelector('[data-toggle-edit]');
  const editFormContainer = dialog.querySelector('[data-edit-form]');
  const editForm = dialog.querySelector('#editRequestForm');

  if (editToggle && editFormContainer) {
    editToggle.addEventListener('click', () => {
      const isHidden = editFormContainer.hasAttribute('hidden');
      if (isHidden) {
        editFormContainer.removeAttribute('hidden');
        editToggle.textContent = 'Fechar edição';
      } else {
        editFormContainer.setAttribute('hidden', '');
        editToggle.textContent = 'Editar solicitação';
      }
    });
  }

  editForm?.addEventListener('submit', (event) =>
    helpers.handleRequestEdit(event, request, client, dialog, editToggle, editFormContainer, helpers)
  );

  dialog.querySelector('[data-delete-request]')?.addEventListener('click', () =>
    helpers.handleRequestDelete(request, dialog, helpers)
  );
}

export function handleRequestEdit(event, request, client, dialog, toggleButton, formContainer, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);

  const title = helpers.safeTrim(data.get('title'));
  const port = helpers.safeTrim(data.get('port'));
  const vessel = helpers.safeTrim(data.get('vessel'));
  const cargo = helpers.safeTrim(data.get('cargo')) || 'Não informado';
  const description = helpers.safeTrim(data.get('description'));
  const scheduledDateValue = typeof data.get('scheduledFor') === 'string' ? data.get('scheduledFor') : '';
  const scheduledTimeValue = typeof data.get('scheduledTime') === 'string' ? data.get('scheduledTime') : '';
  const scheduledFor = helpers.combineDateTime(scheduledDateValue, scheduledTimeValue);
  const tags = helpers.parseTags(data.get('tags'));

  if (scheduledDateValue && scheduledTimeValue) {
    const scheduledDateTime = new Date(scheduledFor);
    const now = new Date();
    const originalDateTime = new Date(request.scheduledFor);

    if (scheduledDateTime < now) {
      helpers.showErrorNotification(
        'Data inválida',
        'Não é possível agendar inspeções no passado. Selecione uma data futura.',
        6000
      );
      return;
    }

    const diffHours = Math.abs(scheduledDateTime - originalDateTime) / (1000 * 60 * 60);
    if (diffHours > 24) {
      helpers.showWarningNotification(
        'Data alterada',
        `A data da inspeção foi alterada de ${helpers.formatDate(originalDateTime)} para ${helpers.formatDate(
          scheduledDateTime
        )}`,
        5000
      );
    }
  }

  if (!title || !port || !vessel || !description || !scheduledFor) {
    helpers.announce('Preencha todos os campos obrigatórios antes de salvar.');
    return;
  }

  request.title = title;
  request.port = port;
  request.vessel = vessel;
  request.cargo = cargo;
  request.description = description;
  request.scheduledFor = scheduledFor;
  request.tags = tags;
  request.updatedAt = new Date().toISOString();

  const entry = helpers.createTimelineEntry({
    actor: client,
    title: 'Cliente atualizou a solicitação',
    description: 'Detalhes do serviço revisados pelo solicitante.',
    category: 'client',
  });
  request.timeline.push(entry);

  helpers.saveState();
  helpers.updateRequestDetailsInModal(dialog, request);

  const timeline = dialog.querySelector('.timeline');
  if (timeline) timeline.insertAdjacentHTML('afterbegin', helpers.timelineItem(entry));

  if (toggleButton && formContainer) {
    formContainer.setAttribute('hidden', '');
    toggleButton.textContent = 'Editar solicitação';
  }

  form.querySelector('textarea')?.blur();
  helpers.announce('Solicitação atualizada com sucesso.');
  helpers.renderApp();

  const descriptionField = form.querySelector('#editDescription');
  if (descriptionField) descriptionField.value = description;
  const titleField = form.querySelector('#editTitle');
  if (titleField) titleField.value = title;
  const portField = form.querySelector('#editPort');
  if (portField) portField.value = port;
  const vesselField = form.querySelector('#editVessel');
  if (vesselField) vesselField.value = vessel;
  const cargoField = form.querySelector('#editCargo');
  if (cargoField) cargoField.value = cargo === 'Não informado' ? '' : cargo;
  const dateField = form.querySelector('#editDate');
  if (dateField) dateField.value = scheduledDateValue;
  const timeField = form.querySelector('#editTime');
  if (timeField) timeField.value = scheduledTimeValue;
  const tagsField = form.querySelector('#editTags');
  if (tagsField) tagsField.value = tags.join(', ');
}

export function handleRequestDelete(request, dialog, helpers) {
  const confirmed = helpers.confirm('Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.');
  if (!confirmed) return;

  const index = helpers.state.requests.findIndex((item) => item.id === request.id);
  if (index >= 0) {
    helpers.state.requests.splice(index, 1);
    helpers.saveState();
  }

  dialog.close();
  helpers.renderApp();
  helpers.announce('Solicitação removida. A equipe será notificada.');
  helpers.showWarningNotification(
    'Solicitação removida',
    `A solicitação ${request.id.toUpperCase()} foi excluída permanentemente`,
    5000
  );
}
