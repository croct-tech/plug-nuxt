import {defineConfig} from '@playwright/test';

// Validates that the module works with a prerendered (statically generated) Nuxt app.
// Unlike the dev-server config, this builds the app for production and serves the Nitro
// output so that route rules (`prerender: true`/`false`) take effect.
const croctEnv = {
    PORT: '3201',
    NUXT_PUBLIC_CROCT_APP_ID: '00000000-0000-0000-0000-000000000000',
    NUXT_PUBLIC_CROCT_TEST: 'true',
    NUXT_PUBLIC_CROCT_BASE_ENDPOINT_URL: 'http://localhost:3210',
    NUXT_CROCT_API_KEY: '00000000-0000-0000-0000-000000000000',
    NUXT_CROCT_DISABLE_USER_TOKEN_AUTHENTICATION: 'true',
};

export default defineConfig({
    testDir: './e2e/specs/prerender',
    timeout: 30000,
    use: {
        baseURL: 'http://localhost:3201',
    },
    webServer: [
        {
            command: 'npx tsx e2e/mock-server.ts',
            port: 3210,
            reuseExistingServer: true,
        },
        {
            command: 'npx nuxi build e2e/app && node e2e/app/.output/server/index.mjs',
            port: 3201,
            reuseExistingServer: true,
            timeout: 180000,
            env: croctEnv,
        },
    ],
    projects: [
        {
            name: 'chromium',
            use: {browserName: 'chromium'},
        },
    ],
});
