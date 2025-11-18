/**
 * Configuração mínima do Vitest em CommonJS para evitar conflitos com ESM-only Vite.
 */
module.exports = {
  test: {
    globals: true,
    environment: 'node'
  }
};
