import type {H3Event} from 'h3';
import {ApiKey} from '@croct/sdk/apiKey';
import {Token} from '@croct/sdk/token';
import {useRuntimeConfig} from '#imports';

export function getApiKey(event?: H3Event): ApiKey {
    const apiKey = resolveApiKey(event);

    if (apiKey === '') {
        throw new Error(
            'Croct\'s API key is missing. '
            + 'Did you forget to set the NUXT_CROCT_API_KEY environment variable? '
            + 'For help, see: https://croct.help/sdk/nuxt/missing-api-key',
        );
    }

    try {
        return ApiKey.parse(apiKey);
    } catch {
        throw new Error(
            'Croct\'s API key is invalid. '
            + 'Please check the NUXT_CROCT_API_KEY environment variable.',
        );
    }
}

export function getAuthenticationKey(event?: H3Event): ApiKey {
    const apiKey = getApiKey(event);

    if (!apiKey.hasPrivateKey()) {
        throw new Error(
            'Croct\'s API key does not have a private key. '
            + 'Please generate an API key with authenticate permissions and update '
            + 'the NUXT_CROCT_API_KEY environment variable.',
        );
    }

    return apiKey;
}

export function isUserTokenAuthenticationEnabled(event?: H3Event): boolean {
    return resolveApiKey(event) !== ''
        && useRuntimeConfig().croct.disableUserTokenAuthentication !== true;
}

export function issueToken(
    userId: string | null = null,
    tokenId?: string,
    event?: H3Event,
): Promise<Token> {
    const token = Token.issue(resolveAppId(event), userId)
        .withDuration(useRuntimeConfig().croct.tokenDuration);

    if (isUserTokenAuthenticationEnabled(event)) {
        return token.withTokenId(tokenId ?? crypto.randomUUID())
            .signedWith(getAuthenticationKey(event));
    }

    return Promise.resolve(token);
}

function resolveAppId(event?: H3Event): string {
    return event?.context.croctCredentials?.appId ?? useRuntimeConfig().public.croct.appId;
}

function resolveApiKey(event?: H3Event): string {
    return event?.context.croctCredentials?.apiKey ?? useRuntimeConfig().croct.apiKey;
}
