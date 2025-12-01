/**
 * Configuração do Vitest com suporte a testes e coverage
 */
module.exports = {
  test: {
    globals: true,
    environment: 'jsdom',
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'json', 'text-summary'],
    exclude: [
      'node_modules/',
      'test/',
      'dist/',
      '**/*.config.*',
      'coverage/',
    ],
    include: ['src/**/*.js'],
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
    all: true,
  },
};
