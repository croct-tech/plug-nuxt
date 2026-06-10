import type {JsonValue} from '@croct/plug/sdk/json';
import type {EvaluationOptions as BaseEvaluationOptions} from '@croct/plug/api';
import {evaluate as executeQuery} from '@croct/plug/api';
import {FilteredLogger} from '@croct/sdk/logging/filteredLogger';
import {ConsoleLogger} from '@croct/sdk/logging/consoleLogger';
import {useEvent, useRuntimeConfig} from '#imports';
import {getApiKey} from '../utils/security';

export type EvaluationOptions<T extends JsonValue = JsonValue> = Omit<BaseEvaluationOptions<T>, 'apiKey' | 'appId'>;

export async function evaluate<T extends JsonValue>(
    query: string,
    options: EvaluationOptions<T> = {},
): Promise<T> {
    const event = useEvent();
    const context = event.context.croct;

    if (context === undefined) {
        throw new Error(
            'Croct\'s request context is missing. '
            + 'Make sure the @croct/plug-nuxt module is installed in your nuxt.config.ts. '
            + 'For help, see: https://croct.help/sdk/nuxt/missing-middleware',
        );
    }

    const config = useRuntimeConfig();
    const timeout = config.public.croct.defaultFetchTimeout;

    return executeQuery<T>(query, {
        apiKey: getApiKey(event),
        clientIp: context.clientIp ?? '127.0.0.1',
        ...(context.previewToken !== undefined ? {previewToken: context.previewToken} : {}),
        ...(context.userToken !== undefined ? {userToken: context.userToken} : {}),
        ...(context.clientId !== undefined ? {clientId: context.clientId} : {}),
        ...(context.clientAgent !== undefined ? {clientAgent: context.clientAgent} : {}),
        ...(typeof config.public.croct.baseEndpointUrl === 'string' && config.public.croct.baseEndpointUrl !== ''
            ? {baseEndpointUrl: config.public.croct.baseEndpointUrl}
            : {}
        ),
        ...(typeof timeout === 'number' && timeout > 0 ? {timeout: timeout} : {}),
        extra: {cache: 'no-store'},
        logger: FilteredLogger.include(new ConsoleLogger(), ['warn', 'error']),
        ...options,
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
    });
}
