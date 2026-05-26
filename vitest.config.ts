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
        coverage: {
            include: ['src/**/*.ts'],
            exclude: ['src/types.ts'],
        },
    },
});
