module.exports = {
  root: true,
  extends: [
    'airbnb',
    'airbnb/hooks',
    'next',
    'next/core-web-vitals',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.base.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [1, { 'extensions': ['.tsx'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        'ts': 'never',
        'tsx': 'never',
        'js': 'never',
        'jsx': 'never'
      }
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/test/**',
          '**/setupTests.ts'
        ]
      }
    ]
  },
  ignorePatterns: ['node_modules/', 'dist/', '.next/'],
}; 