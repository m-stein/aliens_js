import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',

            /* allow browser globals like 'window' or 'document' although their definition is missing */
            globals: { ...globals.browser },
        },
        plugins: { prettier },
        rules: {
            indent: ['error', 4, { SwitchCase: 1 }],
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            camelcase: ['error'],
            'new-cap': ['error'],
            'func-names': ['error'],
            'prettier/prettier': 'error',
            'no-unused-vars': [
                'error',
                { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
            ],
        },
    },
];
