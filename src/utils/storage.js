/**
 * Gerenciamento de armazenamento e estado persistido
 */

import { clone } from './dom.js';

const STORAGE_KEY = "guardcan:data:v1";
const SESSION_KEY = "guardcan:session";

/**
 * Carrega o estado da aplicação do localStorage ou retorna estado padrão
 * @param {Object} defaultState - Estado padrão da aplicação
 * @returns {Object} Estado carregado ou padrão
 */
export function loadState(defaultState) {
  if (typeof localStorage === "undefined") {
    return clone(defaultState);
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return clone(defaultState);
    const parsed = JSON.parse(stored);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : clone(defaultState.users),
      requests: Array.isArray(parsed.requests) ? parsed.requests : clone(defaultState.requests),
    };
  } catch (error) {
    console.error("Erro ao carregar estado, utilizando padrão", error);
    return clone(defaultState);
  }
}

/**
 * Salva o estado atual no localStorage
 * @param {Object} state - Estado da aplicação a salvar
 */
export function saveState(state) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Carrega a sessão do usuário do localStorage
 * @returns {Object|null} Dados da sessão ou null
 */
export function loadSession() {
  if (typeof localStorage === "undefined") return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Salva a sessão do usuário no localStorage
 * @param {Object|null} session - Dados da sessão a salvar
 */
export function saveSession(session) {
  if (typeof localStorage === "undefined") return;
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}
