import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './e2e/specs',
    // Prerender specs require a production build; they have their own config.
    testIgnore: '**/prerender/**',
    timeout: 30000,
    use: {
        baseURL: 'http://localhost:3200',
    },
    webServer: [
        {
            command: 'npx tsx e2e/mock-server.ts',
            port: 3210,
            reuseExistingServer: true,
        },
        {
            command: 'npx nuxi dev e2e/app --port 3200',
            port: 3200,
            reuseExistingServer: true,
            timeout: 60000,
            env: {
                NUXT_PUBLIC_CROCT_APP_ID: '00000000-0000-0000-0000-000000000000',
                NUXT_PUBLIC_CROCT_TEST: 'true',
                NUXT_PUBLIC_CROCT_BASE_ENDPOINT_URL: 'http://localhost:3210',
                NUXT_CROCT_API_KEY: '00000000-0000-0000-0000-000000000000',
                NUXT_CROCT_DISABLE_USER_TOKEN_AUTHENTICATION: 'true',
            },
        },
    ],
    projects: [
        {
            name: 'chromium',
            use: {browserName: 'chromium'},
        },
    ],
});
