/**
 * Utilitários gerais para manipulação de dados
 */

/**
 * Converte um valor de tempo (timestamp/ISO string) para formato HH:MM
 * @param {string|number} value - Timestamp ou string ISO
 * @returns {string} Tempo formatado como HH:MM ou string vazia
 */
export function getTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Parseia uma string de tags separadas por vírgula
 * @param {string} raw - String com tags separadas por vírgula
 * @returns {string[]} Array de tags
 */
export function parseTags(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Traduz status de requisição para português
 * @param {string} status - Status em inglês (pending, in-progress, completed)
 * @returns {string} Status traduzido
 */
export function translateStatus(status) {
  return {
    pending: "Pendente",
    "in-progress": "Em andamento",
    completed: "Concluída",
  }[status] || "Pendente";
}

/**
 * Encontra um usuário no estado global pelo ID
 * @param {string} id - ID do usuário
 * @param {Object} stateUsers - Array de usuários do estado
 * @returns {Object} Objeto do usuário ou objeto com nome padrão
 */
export function resolveUser(id, stateUsers = []) {
  return stateUsers.find((user) => user.id === id) || { name: "Usuário" };
}
