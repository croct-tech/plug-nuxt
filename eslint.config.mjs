import {defineConfig} from 'eslint/config';
import {configs} from '@croct/eslint-plugin';

export default defineConfig(
    configs.typescript,
    {
        rules: {
            'func-names': 'off',
            '@typescript-eslint/only-throw-error': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            'no-param-reassign': ['error', {props: false}],
        },
        settings: {
            jest: {
                version: 29,
            },
        },
    },
    {
        files: [
            'src/module.ts',
            'src/runtime/plugin.client.ts',
            'src/runtime/server/middleware/**/*.ts',
            'src/runtime/server/api/**/*.ts',
            'src/runtime/components/**/*.ts',
        ],
        rules: {
            'import-x/no-default-export': 'off',
        },
    },
    {
        files: [
            'e2e/**/*.ts',
            '*.config.ts',
        ],
        rules: {
            'import-x/no-default-export': 'off',
        },
    },
    {
        ignores: [
            'dist/',
            'coverage/',
            'e2e/app/',
            'node_modules/',
            '.nuxt/',
            '*.mjs',
        ],
    },
);
