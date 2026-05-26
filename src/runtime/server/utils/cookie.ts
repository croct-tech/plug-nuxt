import type {H3Event} from 'h3';
import {setCookie} from 'h3';
import type {Token} from '@croct/sdk/token';
import {useRuntimeConfig} from '#imports';

function getProductionDefaults(): {secure?: boolean, sameSite?: 'none'} {
    if (process.env.NODE_ENV !== 'production') {
        return {};
    }

    return {secure: true, sameSite: 'none'};
}

export function setUserTokenCookie(event: H3Event, token: Token): void {
    const config = useRuntimeConfig().public.croct.cookie.userToken;

    setCookie(event, config.name, token.toString(), {
        maxAge: config.duration,
        path: '/',
        ...(config.domain !== '' ? {domain: config.domain} : {}),
        ...getProductionDefaults(),
        httpOnly: true,
    });
}

export {getProductionDefaults};
