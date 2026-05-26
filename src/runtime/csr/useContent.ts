import type {MaybeRefOrGetter, Ref} from 'vue';
import {toValue} from 'vue';
import type {VersionedSlotId} from '@croct/plug/slot';
import {useContent as useContentVue} from '@croct/plug-vue';
import type {UseContentOptions, UseContentResult} from '@croct/plug-vue';
import {useRuntimeConfig, useNuxtApp} from '#app';

declare module '#app' {
    interface NuxtApp {
        $i18n?: {
            locale: Ref<string>,
        };
    }
}

function useContentNuxt(
    id: MaybeRefOrGetter<VersionedSlotId>,
    options: MaybeRefOrGetter<UseContentOptions<any, any>> = {},
): UseContentResult<any> {
    const resolvedOptions = toValue(options);
    const locale = resolveLocale(resolvedOptions.preferredLocale);

    return useContentVue(id, {
        ...resolvedOptions,
        ...(locale !== undefined ? {preferredLocale: locale} : {}),
    });
}

function resolveLocale(explicitLocale?: string): string | undefined {
    if (explicitLocale !== undefined && explicitLocale !== '') {
        return explicitLocale;
    }

    const i18nLocale = useNuxtApp().$i18n?.locale.value;

    if (i18nLocale !== undefined) {
        return i18nLocale;
    }

    const config = useRuntimeConfig().public.croct;

    if (config.defaultPreferredLocale !== '') {
        return config.defaultPreferredLocale;
    }

    return undefined;
}

export const useContent: typeof useContentVue = useContentNuxt;
