import type {JsonObject} from '@croct/plug/sdk/json';
import type {VersionedSlotId, VersionedSlotMap} from '@croct/plug/slot';
import type {FetchResponseOptions} from '@croct/sdk/contentFetcher';
import type {FetchResponse} from '@croct/plug/api';
import type {AsyncData, NuxtError} from '#app';
import {useAsyncData, useRequestFetch} from '#app';
import type {DynamicContentOptions} from '../server/composables/fetchContent';
import {resolveLocale} from '../utils/locale';

export type UseContentOptions<T extends JsonObject = JsonObject> = DynamicContentOptions<T>;

type UseContentHook = {
    <P extends JsonObject, O extends FetchResponseOptions = FetchResponseOptions>(
        id: keyof VersionedSlotMap extends never ? string : never,
        options?: O & UseContentOptions,
    ): AsyncData<FetchResponse<VersionedSlotId, P, never, O>, NuxtError | null>,

    <P extends JsonObject, F extends JsonObject, O extends FetchResponseOptions = FetchResponseOptions>(
        id: keyof VersionedSlotMap extends never ? string : never,
        options: O & UseContentOptions<F>,
    ): AsyncData<FetchResponse<VersionedSlotId, P, F, O>, NuxtError | null>,

    <S extends VersionedSlotId, O extends FetchResponseOptions = FetchResponseOptions>(
        id: S,
        options?: O & UseContentOptions,
    ): AsyncData<FetchResponse<S, JsonObject, never, O>, NuxtError | null>,

    <F extends JsonObject, S extends VersionedSlotId, O extends FetchResponseOptions = FetchResponseOptions>(
        id: S,
        options: O & UseContentOptions<F>,
    ): AsyncData<FetchResponse<S, JsonObject, F, O>, NuxtError | null>,
};

function useContentNuxt(slotId: string, options: UseContentOptions = {}): any {
    const {preferredLocale, ...rest} = options;
    const locale = resolveLocale(preferredLocale);

    const resolvedOptions = {
        ...(locale !== undefined ? {preferredLocale: locale} : {}),
        ...rest,
    };

    const cacheKey = `croct:content:${slotId}:${JSON.stringify(resolvedOptions)}`;

    return useAsyncData(
        cacheKey,
        () => useRequestFetch()('/api/_croct/content', {
            method: 'POST',
            body: {slotId: slotId, ...resolvedOptions},
        }),
    );
}

export const useContent: UseContentHook = useContentNuxt;
