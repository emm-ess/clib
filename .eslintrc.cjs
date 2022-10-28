require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        project: './tsconfig.json',
    },
    extends: '@emm-ess-configs/eslint-config',
    overrides: [
        {
            files: ['*.ts'],
            extends: '@emm-ess-configs/eslint-config/typescript',
            parserOptions: {
                project: ['./tsconfig.json'],
            },
            rules: {
                // yeah, me being lazy...
                'no-async-promise-executor': 0,
                'prefer-promise-reject-errors': 0,
                '@typescript-eslint/no-floating-promises': 0,
            }
        },
        {
            files: ['./*.js'],
            rules: {
                'unicorn/prefer-module': 'off',
            },
        },
    ],
}
