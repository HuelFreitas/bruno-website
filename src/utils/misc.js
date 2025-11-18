export function formatDate(value) {
  if (!value) return "Não informado";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function combineDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return "";
  const [hours, minutes] = String(timeValue).split(":");
  if (!hours || !minutes) return "";
  const normalizedHours = hours.padStart(2, "0");
  const normalizedMinutes = minutes.padStart(2, "0");
  const isoLike = `${dateValue}T${normalizedHours}:${normalizedMinutes}:00`;
  const parsed = new Date(isoLike);
  if (Number.isNaN(parsed.getTime())) return "";
  return isoLike;
}

export function getDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
