import {createCroct} from '@croct/plug-vue';
import {defineNuxtPlugin, useRuntimeConfig} from '#app';
import {urlSanitizer} from '#croct/client-options';

export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig().public.croct;

    const plugin = createCroct({
        appId: config.appId,
        disableCidMirroring: true,
        ...(config.debug === true ? {debug: true} : {}),
        ...(config.test === true ? {test: true} : {}),
        ...(urlSanitizer !== undefined ? {urlSanitizer: urlSanitizer} : {}),
        ...(typeof config.baseEndpointUrl === 'string' && config.baseEndpointUrl !== ''
            ? {baseEndpointUrl: config.baseEndpointUrl}
            : {}
        ),
        ...(config.defaultPreferredLocale !== '' ? {defaultPreferredLocale: config.defaultPreferredLocale} : {}),
        ...(typeof config.defaultFetchTimeout === 'number'
            ? {defaultFetchTimeout: config.defaultFetchTimeout}
            : {}
        ),
        cookie: {
            clientId: {
                name: config.cookie.clientId.name,
                maxAge: config.cookie.clientId.duration,
                path: '/',
                ...(config.cookie.clientId.domain !== '' ? {domain: config.cookie.clientId.domain} : {}),
            },
            userToken: {
                name: config.cookie.userToken.name,
                maxAge: config.cookie.userToken.duration,
                path: '/',
                ...(config.cookie.userToken.domain !== '' ? {domain: config.cookie.userToken.domain} : {}),
            },
            previewToken: {
                name: config.cookie.previewToken.name,
                path: '/',
                ...(config.cookie.previewToken.domain !== '' ? {domain: config.cookie.previewToken.domain} : {}),
            },
        },
    });

    nuxtApp.vueApp.use(plugin);
});
