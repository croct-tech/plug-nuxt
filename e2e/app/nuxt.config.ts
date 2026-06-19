import {DEFAULT_CREDENTIALS} from '../constants';

export default defineNuxtConfig({
    modules: ['../../src/module', '@nuxtjs/i18n'],
    croct: {
        appId: DEFAULT_CREDENTIALS.appId,
        userIdResolver: './croct/resolveUserId',
        localeResolver: './croct/resolveLocale',
        credentialsResolver: './croct/resolveCredentials',
        urlSanitizer: './croct/sanitizeUrl',
    },
    routeRules: {
        // Keep the page in the prerendered set; personalization loads client-side (CSR).
        '/prerender/csr': {prerender: true},
        // Opt the page out of prerendering; render it on demand on the server (SSR).
        '/prerender/ssr': {prerender: false},
    },
    i18n: {
        locales: ['en', 'pt-br'],
        defaultLocale: 'en',
        strategy: 'prefix_except_default',
    },
    devtools: {
        enabled: false
    },
});
