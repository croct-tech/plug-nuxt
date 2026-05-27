import type {MaybeRefOrGetter} from 'vue';
import {toValue} from 'vue';
import type {VersionedSlotId} from '@croct/plug/slot';
import {useContent as useContentVue} from '@croct/plug-vue';
import type {UseContentOptions, UseContentResult} from '@croct/plug-vue';
import {resolveLocale} from '../utils/locale';

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

export const useContent: typeof useContentVue = useContentNuxt;
