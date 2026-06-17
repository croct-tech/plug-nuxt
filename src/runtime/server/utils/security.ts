import {ApiKey} from '@croct/sdk/apiKey';
import {Token} from '@croct/sdk/token';
import {useRuntimeConfig} from '#imports';

export function getApiKey(): ApiKey {
    const {apiKey} = useRuntimeConfig().croct;

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

export function getAuthenticationKey(): ApiKey {
    const apiKey = getApiKey();

    if (!apiKey.hasPrivateKey()) {
        throw new Error(
            'Croct\'s API key does not have a private key. '
            + 'Please generate an API key with authenticate permissions and update '
            + 'the NUXT_CROCT_API_KEY environment variable.',
        );
    }

    return apiKey;
}

export function isUserTokenAuthenticationEnabled(): boolean {
    const config = useRuntimeConfig().croct;

    return config.apiKey !== ''
        && config.disableUserTokenAuthentication !== true;
}

export function issueToken(
    userId: string | null = null,
    tokenId?: string,
): Promise<Token> {
    const config = useRuntimeConfig();
    const {appId} = config.public.croct;

    const token = Token.issue(appId, userId)
        .withDuration(config.croct.tokenDuration);

    if (isUserTokenAuthenticationEnabled()) {
        return token.withTokenId(tokenId ?? crypto.randomUUID())
            .signedWith(getAuthenticationKey());
    }

    return Promise.resolve(token);
}
