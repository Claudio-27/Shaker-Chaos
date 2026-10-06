import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.npm-logs/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', URL: 'readonly' } },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        'react', 'react-dom', 'react-dom/*', '../application/*', '../content/*',
        '../ui/*', '../platform/*', '../boundaries/*',
      ] }],
      'no-restricted-globals': ['error', 'window', 'document', 'navigator', 'localStorage',
        'sessionStorage', 'fetch', 'performance', 'Date', 'setInterval', 'setTimeout'],
      'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Domain logic must be deterministic.' }],
    },
  },
);
