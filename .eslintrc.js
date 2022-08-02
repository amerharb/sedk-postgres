module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  ignorePatterns: '*.js',
  overrides: [
    {
      files: ['src/**/*.ts', 'test/**/*.ts'],
      rules: {
        'indent': ['error', 'tab'],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['warn', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
        'semi': ['warn', 'never'],
        'object-curly-spacing': [
          'warn', 'always', { 'objectsInObjects': true, 'arraysInObjects': true },
        ],
        'no-empty-function': ['error', { 'allow': ['constructors'] }],
        'no-explicit-any': ['off'],
        'no-console': 'warn',
        'no-unused-private-class-members': ['off'],
        'no-trailing-spaces': ['warn'],
      },
    },
  ],
}
