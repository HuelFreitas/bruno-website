export function isPastDate(dateString) {
  return new Date(dateString) < new Date();
}

export function isToday(dateString) {
  const d = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return d < tomorrow;
}
