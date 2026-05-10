import { safeTrim } from '../utils/string.js';
import { uid, combineDateTime } from '../utils/misc.js';
import { parseTags } from '../utils/helpers.js';
import { isPastDate, isToday } from '../utils/validators.js';
import { createTimelineEntry } from '../components/timeline.js';
import { announce } from '../utils/dom.js';
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '../ui/notifications.js';

export function handleCreateRequest(event, user, { state, saveState, rerender }) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const scheduledDate = typeof data.get("scheduledFor") === "string" ? data.get("scheduledFor") : "";
  const scheduledTime = typeof data.get("scheduledTime") === "string" ? data.get("scheduledTime") : "";
  const scheduledFor = combineDateTime(scheduledDate, scheduledTime);

  if (scheduledDate && scheduledTime) {
    if (isPastDate(scheduledFor)) {
      showErrorNotification(
        "Data inválida",
        "Não é possível agendar inspeções no passado. Selecione uma data futura.",
        6000
      );
      return;
    }
    if (isToday(scheduledFor)) {
      showWarningNotification(
        "Atenção",
        "Você está agendando para hoje. Certifique-se de que há tempo suficiente para preparação.",
        5000
      );
    }
  }

  const request = {
    id: uid("req"),
    clientId: user.id,
    assignedOperatorId: null,
    title: safeTrim(data.get("title")),
    port: safeTrim(data.get("port")),
    vessel: safeTrim(data.get("vessel")),
    cargo: safeTrim(data.get("cargo")) || "Não informado",
    scheduledFor,
    description: safeTrim(data.get("description")),
    status: "pending",
    tags: parseTags(data.get("tags")),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      createTimelineEntry({
        actor: user,
        title: "Solicitação registrada",
        description: "Cliente abriu uma nova inspeção via portal.",
        category: "request",
      }),
    ],
    report: null,
  };

  if (
    !request.title ||
    !request.port ||
    !request.vessel ||
    !request.description ||
    !scheduledDate ||
    !scheduledTime ||
    !request.scheduledFor
  ) {
    announce("Preencha todos os campos obrigatórios da solicitação.");
    return;
  }

  state.requests.unshift(request);
  saveState();
  form.reset();
  form.querySelector("input, select, textarea")?.focus();
  rerender(user);
  announce("Solicitação registrada com sucesso.");
  showSuccessNotification(
    "Solicitação criada!",
    `Inspeção "${request.title}" foi registrada com sucesso. ID: ${request.id.toUpperCase()}`,
    6000
  );
}
