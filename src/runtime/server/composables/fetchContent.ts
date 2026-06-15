import type {SlotContent, VersionedSlotId} from '@croct/plug/slot';
import type {JsonObject} from '@croct/plug/sdk/json';
import type {FetchResponseOptions} from '@croct/sdk/contentFetcher';
import type {
    DynamicContentOptions as DynamicOptions,
    StaticContentOptions as StaticOptions,
    FetchResponse,
} from '@croct/plug/api';
import {fetchContent as loadContent} from '@croct/plug/api';
import {FilteredLogger} from '@croct/sdk/logging/filteredLogger';
import {ConsoleLogger} from '@croct/sdk/logging/consoleLogger';
import {useEvent, useRuntimeConfig} from '#imports';
import {getApiKey} from '../utils/security';

export type DynamicContentOptions<T extends JsonObject = JsonObject> = Omit<DynamicOptions<T>, 'apiKey' | 'appId'>;

export type StaticContentOptions<T extends JsonObject = JsonObject> = Omit<StaticOptions<T>, 'apiKey' | 'appId'>;

export type FetchContentOptions<T extends JsonObject = JsonObject> = DynamicContentOptions<T> | StaticContentOptions<T>;

export type {FetchResponse};

export async function fetchContent<
    I extends VersionedSlotId,
    C extends JsonObject,
    O extends FetchResponseOptions = FetchResponseOptions,
>(
    slotId: I,
    options: Pick<O, keyof FetchResponseOptions> & FetchContentOptions<SlotContent<I, C>> = {},
): Promise<FetchResponse<I, C, never, O>> {
    const event = useEvent();
    const context = event.context.croct;

    if (context === undefined) {
        throw new Error(
            'Croct\'s request context is missing. '
            + 'Make sure the @croct/plug-nuxt module is installed in your nuxt.config.ts. '
            + 'For help, see: https://croct.help/sdk/nuxt/missing-module',
        );
    }

    const config = useRuntimeConfig();
    const timeout = config.public.croct.defaultFetchTimeout;
    const {logger, ...rest} = options;

    const commonOptions = {
        apiKey: getApiKey(),
        ...(typeof config.public.croct.baseEndpointUrl === 'string' && config.public.croct.baseEndpointUrl !== ''
            ? {baseEndpointUrl: config.public.croct.baseEndpointUrl}
            : {}
        ),
        ...(typeof timeout === 'number' && timeout > 0 ? {timeout: timeout} : {}),
        logger: logger ?? FilteredLogger.include(new ConsoleLogger(), ['warn', 'error']),
    };

    if ('static' in rest && (rest as {static?: boolean}).static === true) {
        const preferredLocale = rest.preferredLocale
            ?? (config.public.croct.defaultPreferredLocale !== ''
                ? config.public.croct.defaultPreferredLocale
                : undefined);

        return loadContent<I, C, O>(slotId, {
            ...commonOptions,
            ...rest,
            ...(preferredLocale !== undefined ? {preferredLocale: preferredLocale} : {}),
        });
    }

    return loadContent<I, C, O>(slotId, {
        clientIp: context.clientIp,
        ...(context.previewToken !== undefined ? {previewToken: context.previewToken} : {}),
        ...(context.userToken !== undefined ? {userToken: context.userToken} : {}),
        ...(context.clientId !== undefined ? {clientId: context.clientId} : {}),
        ...(context.clientAgent !== undefined ? {clientAgent: context.clientAgent} : {}),
        ...(context.preferredLocale !== undefined ? {preferredLocale: context.preferredLocale} : {}),
        ...(context.uri !== undefined
            ? {
                context: {
                    page: {
                        url: context.uri,
                        ...(context.referrer !== undefined ? {referrer: context.referrer} : {}),
                    },
                },
            }
            : {}
        ),
        extra: {cache: 'no-store'},
        ...commonOptions,
        ...rest,
    });
}
