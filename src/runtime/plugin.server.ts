import {defineNuxtPlugin, useRuntimeConfig, useRequestEvent, useState} from '#app';

export default defineNuxtPlugin(() => {
    const event = useRequestEvent();
    const fallback = useRuntimeConfig().public.croct.appId;

    useState('croct:app-id', () => event?.context.croctCredentials?.appId ?? fallback);
});
