/**
 * Carrega o tema salvo nas preferências do usuário ou do sistema
 * @param {string} THEME_KEY - Chave de armazenamento no localStorage
 * @returns {string} 'dark' ou 'light'
 */
export function loadTheme(THEME_KEY) {
  if (typeof localStorage === 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return (
    localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

/**
 * Aplica o tema ao documento e salva a preferência
 * @param {string} theme - 'dark' ou 'light'
 * @param {string} THEME_KEY - Chave de armazenamento no localStorage
 * @param {HTMLElement} themeToggle - Elemento do botão de alternância
 */
export function applyTheme(theme, THEME_KEY, themeToggle) {
  document.documentElement.setAttribute('data-theme', theme);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme);
  }
  updateThemeToggleLabel(theme, themeToggle);
}

/**
 * Alterna entre temas claro e escuro
 * @param {string} THEME_KEY - Chave de armazenamento no localStorage
 * @param {HTMLElement} themeToggle - Elemento do botão de alternância
 */
export function toggleTheme(THEME_KEY, themeToggle) {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark', THEME_KEY, themeToggle);
}

/**
 * Atualiza o label do botão de alternância de tema
 * @param {string} theme - 'dark' ou 'light'
 * @param {HTMLElement} themeToggle - Elemento do botão de alternância
 */
export function updateThemeToggleLabel(theme, themeToggle) {
  if (!themeToggle) return;
  themeToggle.textContent = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
}
