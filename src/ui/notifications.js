import { escapeHtml } from '../utils/string.js';

/**
 * Exibe uma notificação visual na tela
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duração em ms (0 = sem auto-remover)
 * @returns {HTMLElement|null} O elemento da notificação
 */
export function showNotification(title, message, type = 'info', duration = 5000) {
  const container = document.getElementById('notificationContainer');
  if (!container) return null;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  notification.innerHTML = `
    <div class="notification__header">
      <div style="display: flex; align-items: center;">
        <span class="notification__icon">${icons[type] || icons.info}</span>
        <h4 class="notification__title">${escapeHtml(title)}</h4>
      </div>
      <button class="notification__close" type="button" aria-label="Fechar notificação">×</button>
    </div>
    <p class="notification__message">${escapeHtml(message)}</p>
    <div class="notification__progress"></div>
  `;

  // Adicionar evento de fechamento
  const closeButton = notification.querySelector('.notification__close');
  closeButton.addEventListener('click', () => {
    hideNotification(notification);
  });

  container.appendChild(notification);

  // Animar entrada
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });

  // Auto-remover após duração
  if (duration > 0) {
    setTimeout(() => {
      hideNotification(notification);
    }, duration);
  }

  return notification;
}

/**
 * Remove uma notificação da tela com animação
 * @param {HTMLElement} notification - O elemento da notificação
 */
export function hideNotification(notification) {
  if (!notification || !notification.parentNode) return;

  notification.classList.remove('show');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

/**
 * Exibe uma notificação de sucesso
 * @param {string} title - Título
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms
 */
export function showSuccessNotification(title, message, duration = 4000) {
  return showNotification(title, message, 'success', duration);
}

/**
 * Exibe uma notificação de erro
 * @param {string} title - Título
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms
 */
export function showErrorNotification(title, message, duration = 6000) {
  return showNotification(title, message, 'error', duration);
}

/**
 * Exibe uma notificação de aviso
 * @param {string} title - Título
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms
 */
export function showWarningNotification(title, message, duration = 5000) {
  return showNotification(title, message, 'warning', duration);
}

/**
 * Exibe uma notificação de informação
 * @param {string} title - Título
 * @param {string} message - Mensagem
 * @param {number} duration - Duração em ms
 */
export function showInfoNotification(title, message, duration = 4000) {
  return showNotification(title, message, 'info', duration);
}
