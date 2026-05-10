import { formatDate } from '../utils/misc.js';

/**
 * Constrói as métricas para o dashboard do cliente
 * @param {Array} requests - Lista de solicitações
 * @returns {Object} Objeto com métricas: total, inProgress, completed, nextInspectionLabel
 */
export function buildMetrics(requests) {
  const total = requests.length;
  const pending = requests.filter((item) => item.status === 'pending').length;
  const inProgress = requests.filter((item) => item.status === 'in-progress').length;
  const completed = requests.filter((item) => item.status === 'completed').length;
  const upcomingDates = requests
    .map((item) => item.scheduledFor)
    .filter(Boolean)
    .map((date) => new Date(date))
    .filter((date) => date >= new Date());
  const nextInspection = upcomingDates.sort((a, b) => a - b)[0];

  return {
    total,
    pending,
    inProgress,
    completed,
    nextInspectionLabel: nextInspection ? formatDate(nextInspection.toISOString()) : 'Sem agenda',
  };
}

/**
 * Constrói as métricas para o dashboard do operador
 * @param {Array} requests - Lista de solicitações
 * @param {string} operatorId - ID do operador
 * @returns {Object} Objeto com métricas: assignedToOperator, pending, completed, nextInspectionLabel
 */
export function buildOperatorMetrics(requests, operatorId) {
  const assignedToOperator = requests.filter((request) => request.assignedOperatorId === operatorId).length;
  const pending = requests.filter((request) => request.status === 'pending').length;
  const inProgress = requests.filter((request) => request.status === 'in-progress').length;
  const completed = requests.filter((request) => request.status === 'completed').length;
  const upcomingDates = requests
    .filter((request) => request.assignedOperatorId === operatorId)
    .map((item) => item.scheduledFor)
    .filter(Boolean)
    .map((date) => new Date(date))
    .filter((date) => date >= new Date());
  const nextInspection = upcomingDates.sort((a, b) => a - b)[0];

  return {
    assignedToOperator,
    pending,
    inProgress,
    completed,
    nextInspectionLabel: nextInspection ? formatDate(nextInspection.toISOString()) : 'Sem agenda',
  };
}
