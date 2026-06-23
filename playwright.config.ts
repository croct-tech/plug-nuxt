import {defineConfig} from '@playwright/test';
import {APP_PORT, MOCK_SERVER_PORT, MOCK_SERVER_URL, DEFAULT_CREDENTIALS} from './e2e/constants';

export default defineConfig({
    testDir: './e2e/specs',
    // Prerender specs require a production build; they have their own config.
    testIgnore: '**/prerender/**',
    timeout: 30000,
    use: {
        baseURL: `http://localhost:${APP_PORT}`,
    },
    webServer: [
        {
            command: 'npx tsx e2e/mock-server.ts',
            port: MOCK_SERVER_PORT,
            reuseExistingServer: true,
        },
        {
            // Bind to all interfaces so the e2e can reach the app via both
            // localhost and 127.0.0.1 (used to exercise per-host tenant resolution).
            command: `npx nuxi dev e2e/app --port ${APP_PORT} --host`,
            port: APP_PORT,
            reuseExistingServer: true,
            timeout: 60000,
            env: {
                NUXT_PUBLIC_CROCT_APP_ID: DEFAULT_CREDENTIALS.appId,
                NUXT_PUBLIC_CROCT_TEST: 'true',
                NUXT_PUBLIC_CROCT_BASE_ENDPOINT_URL: MOCK_SERVER_URL,
                NUXT_CROCT_API_KEY: DEFAULT_CREDENTIALS.apiKey,
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
