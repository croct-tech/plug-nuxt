export default defineNuxtConfig({
    modules: ['../../src/module', '@nuxtjs/i18n'],
    croct: {
        appId: '00000000-0000-0000-0000-000000000000',
        userIdResolver: './croct/resolveUserId',
        localeResolver: './croct/resolveLocale',
        urlSanitizer: './croct/sanitizeUrl',
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
