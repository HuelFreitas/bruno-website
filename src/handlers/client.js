import { isPastDate } from '../utils/validators.js';
import { safeTrim } from '../utils/string.js';
import { combineDateTime, formatDate } from '../utils/misc.js';
import { parseTags } from '../utils/helpers.js';
import { announce } from '../utils/dom.js';
import { createTimelineEntry, timelineItem, updateRequestDetailsInModal } from '../components/timeline.js';
import { showErrorNotification, showWarningNotification } from '../ui/notifications.js';

export function handleClientNote(event, request, client, dialog, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const note = safeTrim(data.get('note'));
  if (!note) return;

  const entry = createTimelineEntry({
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
  if (timeline) timeline.insertAdjacentHTML('afterbegin', timelineItem(entry));
  announce('Mensagem adicionada ao histórico.');
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
    handleRequestEdit(event, request, client, dialog, editToggle, editFormContainer, helpers)
  );

  dialog.querySelector('[data-delete-request]')?.addEventListener('click', () =>
    handleRequestDelete(request, dialog, helpers)
  );
}

export function handleRequestEdit(event, request, client, dialog, toggleButton, formContainer, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);

  const title = safeTrim(data.get('title'));
  const port = safeTrim(data.get('port'));
  const vessel = safeTrim(data.get('vessel'));
  const cargo = safeTrim(data.get('cargo')) || 'Não informado';
  const description = safeTrim(data.get('description'));
  const scheduledDateValue = typeof data.get('scheduledFor') === 'string' ? data.get('scheduledFor') : '';
  const scheduledTimeValue = typeof data.get('scheduledTime') === 'string' ? data.get('scheduledTime') : '';
  const scheduledFor = combineDateTime(scheduledDateValue, scheduledTimeValue);
  const tags = parseTags(data.get('tags'));

  if (scheduledDateValue && scheduledTimeValue) {
    if (isPastDate(scheduledFor)) {
      showErrorNotification(
        'Data inválida',
        'Não é possível agendar inspeções no passado. Selecione uma data futura.',
        6000
      );
      return;
    }

    const diffHours = Math.abs(new Date(scheduledFor) - new Date(request.scheduledFor)) / (1000 * 60 * 60);
    if (diffHours > 24) {
      showWarningNotification(
        'Data alterada',
        `A data da inspeção foi alterada de ${formatDate(new Date(request.scheduledFor))} para ${formatDate(new Date(scheduledFor))}`,
        5000
      );
    }
  }

  if (!title || !port || !vessel || !description || !scheduledFor) {
    announce('Preencha todos os campos obrigatórios antes de salvar.');
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

  const entry = createTimelineEntry({
    actor: client,
    title: 'Cliente atualizou a solicitação',
    description: 'Detalhes do serviço revisados pelo solicitante.',
    category: 'client',
  });
  request.timeline.push(entry);

  helpers.saveState();
  updateRequestDetailsInModal(dialog, request);

  const timeline = dialog.querySelector('.timeline');
  if (timeline) timeline.insertAdjacentHTML('afterbegin', timelineItem(entry));

  if (toggleButton && formContainer) {
    formContainer.setAttribute('hidden', '');
    toggleButton.textContent = 'Editar solicitação';
  }

  form.querySelector('textarea')?.blur();
  announce('Solicitação atualizada com sucesso.');
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
  announce('Solicitação removida. A equipe será notificada.');
  showWarningNotification(
    'Solicitação removida',
    `A solicitação ${request.id.toUpperCase()} foi excluída permanentemente`,
    5000
  );
}
