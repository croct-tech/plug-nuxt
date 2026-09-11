import {defineConfig} from 'eslint/config';
import {configs} from '@croct/eslint-plugin';
import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';

export default defineConfig(
    configs.typescript,
    {
        settings: {
            /*
            Without an explicit resolver, import-x falls back to the legacy "node" one, which is
            not installed. Resolution then silently yields nothing, and no-cycle walking into
            node_modules loads whatever sits at <package>/node as the resolver, which crashes the
            run on packages shipping native bindings there, such as lightningcss.
            This resolver also understands the tsconfig paths for #app and #imports.
            */
            'import-x/resolver-next': [createTypeScriptImportResolver({project: './tsconfig.json'})],
        },
    },
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
            'src/runtime/plugin.ts',
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
        files: [
            'e2e/specs/**/*.spec.ts',
        ],
        rules: {
            '@croct/parameter-destructuring': 'off',
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
            '**/*.d.ts',
        ],
    },
);
