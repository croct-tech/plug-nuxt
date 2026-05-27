import type {Ref} from 'vue';
import {useNuxtApp, useRuntimeConfig} from '#app';

declare module '#app' {
    interface NuxtApp {
        $i18n?: {
            locale: Ref<string>,
        };
    }
}

export function resolveLocale(explicitLocale?: string): string | undefined {
    if (explicitLocale !== undefined && explicitLocale !== '') {
        return explicitLocale;
    }

    const config = useRuntimeConfig().public.croct;

    if (config.defaultPreferredLocale !== '') {
        return config.defaultPreferredLocale;
    }

    const i18nLocale = useNuxtApp().$i18n?.locale.value;

    if (i18nLocale !== undefined) {
        return i18nLocale;
    }

    return undefined;
}
