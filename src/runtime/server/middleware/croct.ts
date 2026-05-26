import {
    defineEventHandler,
    getRequestURL,
    getHeader,
    getCookie,
    setCookie,
    deleteCookie,
    getQuery,
} from 'h3';
import {Token} from '@croct/sdk/token';
import {base64UrlDecode} from '@croct/sdk/base64Url';
import {useRuntimeConfig} from '#imports';
import {setUserTokenCookie, getProductionDefaults} from '../utils/cookie';
import {getAuthenticationKey, isUserTokenAuthenticationEnabled, issueToken} from '../utils/security';
import type {CroctRequestContext} from '../../../types';

const CLIENT_ID_PATTERN = /^(?:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9]{32})$/;
const PREVIEW_QUERY_PARAM = 'croct-preview';

const SKIP_EXTENSIONS = /\.(?:js|css|map|ico|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|webp|avif|json|xml|txt)$/;
const SKIP_PREFIXES = ['/_nuxt/', '/__nuxt_error'];

function shouldSkip(pathname: string): boolean {
    if (SKIP_EXTENSIONS.test(pathname)) {
        return true;
    }

    return SKIP_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export default defineEventHandler(async event => {
    const url = getRequestURL(event);

    if (shouldSkip(url.pathname)) {
        return;
    }

    const config = useRuntimeConfig();
    const {cookie} = config.public.croct;

    const clientId = resolveClientId(getCookie(event, cookie.clientId.name));
    const userToken = await resolveUserToken(getCookie(event, cookie.userToken.name));
    const preferredLocale = config.public.croct.defaultPreferredLocale !== ''
        ? config.public.croct.defaultPreferredLocale
        : undefined;

    const previewToken = resolvePreviewToken(
        getQuery(event)[PREVIEW_QUERY_PARAM] as string | undefined,
        getCookie(event, cookie.previewToken.name),
    );

    const clientIp = getHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
        ?? getHeader(event, 'x-real-ip')
        ?? undefined;

    const context: CroctRequestContext = {
        clientId: clientId,
        userToken: userToken.toString(),
        uri: stripPreviewParam(url),
        ...(clientIp !== undefined ? {clientIp: clientIp} : {}),
        ...(preferredLocale !== undefined ? {preferredLocale: preferredLocale} : {}),
        ...(previewToken !== null && previewToken !== 'exit' ? {previewToken: previewToken} : {}),
        clientAgent: getHeader(event, 'user-agent'),
        referrer: getHeader(event, 'referer'),
    };

    event.context.croct = context;

    const productionDefaults = getProductionDefaults();

    if (previewToken === 'exit') {
        deleteCookie(event, cookie.previewToken.name);
    } else if (previewToken !== null) {
        setCookie(event, cookie.previewToken.name, previewToken, {
            path: '/',
            ...(cookie.previewToken.domain !== '' ? {domain: cookie.previewToken.domain} : {}),
            ...productionDefaults,
            httpOnly: true,
        });
    }

    setUserTokenCookie(event, userToken);

    setCookie(event, cookie.clientId.name, clientId, {
        maxAge: cookie.clientId.duration,
        path: '/',
        ...(cookie.clientId.domain !== '' ? {domain: cookie.clientId.domain} : {}),
        ...productionDefaults,
        httpOnly: true,
    });
});

function resolveClientId(cookieValue: string | undefined): string {
    if (cookieValue !== undefined && CLIENT_ID_PATTERN.test(cookieValue)) {
        return cookieValue;
    }

    return crypto.randomUUID();
}

async function resolveUserToken(cookieValue: string | undefined): Promise<Token> {
    const {appId} = useRuntimeConfig().public.croct;
    let token: Token | null = null;

    if (cookieValue !== undefined) {
        try {
            token = Token.parse(cookieValue);
        } catch {
            // Ignore invalid tokens
        }
    }

    if (
        token === null
        || (isUserTokenAuthenticationEnabled() && !token.isSigned())
        || !token.isValidNow()
    ) {
        return issueToken();
    }

    const tokenAppId = token.getApplicationId();

    if (tokenAppId !== null && tokenAppId !== appId) {
        return issueToken();
    }

    if (token.isSigned() && !await token.matchesKeyId(getAuthenticationKey())) {
        return issueToken(token.getSubject(), token.getTokenId() ?? undefined);
    }

    return token;
}

function resolvePreviewToken(
    queryParam: string | undefined,
    cookieValue: string | undefined,
): string | null {
    const value = queryParam ?? cookieValue;

    if (value === undefined) {
        return null;
    }

    if (isPreviewTokenValid(value)) {
        return value;
    }

    return 'exit';
}

function isPreviewTokenValid(token: unknown): token is string {
    if (typeof token !== 'string' || token === 'exit') {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);

    try {
        const payload = JSON.parse(base64UrlDecode(token.split('.')[1]).toString());

        return Number.isInteger(payload.exp) && payload.exp > now;
    } catch {
        return false;
    }
}

function stripPreviewParam(url: URL): string {
    const cleaned = new URL(url.toString());

    cleaned.searchParams.delete(PREVIEW_QUERY_PARAM);

    return cleaned.toString();
}
