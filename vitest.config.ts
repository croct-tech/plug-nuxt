import {defineVitestConfig} from '@nuxt/test-utils/config';

export default defineVitestConfig({
    test: {
        environment: 'nuxt',
        environmentOptions: {
            nuxt: {
                rootDir: './e2e/app',
                domEnvironment: 'happy-dom',
            },
        },
        include: ['test/**/*.test.ts'],
        alias: {
            '#croct/resolvers': new URL('test/stubs/croct-resolvers.ts', import.meta.url).pathname,
        },
        coverage: {
            include: ['src/**/*.ts'],
            exclude: ['src/types.ts'],
        },
    },
});
