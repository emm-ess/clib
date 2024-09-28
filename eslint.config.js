import baseConfig from '@emm-ess-configs/eslint-config/typeChecked'
import globals from 'globals'

export default [
    {
        ignores: [
            '!.*',
            '!package.json',
            '**/node_modules',
            'dist/*',
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    },
    ...baseConfig,
    {
        rules: {
            '@stylistic/block-spacing': ['error', 'never'],
        },
    },
]
