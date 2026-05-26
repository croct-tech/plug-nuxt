import {describe, it, expect, afterEach} from 'vitest';
import {IncomingMessage, ServerResponse} from 'http';
import {Socket} from 'net';
import {createEvent} from 'h3';
import {Token} from '@croct/sdk/token';
import {useRuntimeConfig} from '#imports';
import {setUserTokenCookie, getProductionDefaults} from './cookie';

describe('cookie', () => {
    const config = useRuntimeConfig();
    const {appId} = config.public.croct;

    function createMockEvent(): ReturnType<typeof createEvent> {
        const request = new IncomingMessage(new Socket());
        const response = new ServerResponse(request);

        return createEvent(request, response);
    }

    function getSetCookies(event: ReturnType<typeof createEvent>): string[] {
        const headers = event.node
            .res
            .getHeader('set-cookie');

        if (headers === undefined) {
            return [];
        }

        return Array.isArray(headers) ? headers.map(String) : [String(headers)];
    }

    describe('getProductionDefaults', () => {
        const originalEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should return empty defaults in non-production', () => {
            process.env.NODE_ENV = 'development';

            expect(getProductionDefaults()).toEqual({});
        });

        it('should return secure and sameSite in production', () => {
            process.env.NODE_ENV = 'production';

            expect(getProductionDefaults()).toEqual({
                secure: true,
                sameSite: 'none',
            });
        });
    });

    describe('setUserTokenCookie', () => {
        it('should set the cookie with the token value', () => {
            const event = createMockEvent();
            const token = Token.issue(appId).withDuration(3600);

            setUserTokenCookie(event, token);

            const cookies = getSetCookies(event);

            expect(cookies.some(cookie => cookie.startsWith(`ct.user_token=${token.toString()}`))).toBe(true);
        });

        it('should set the HttpOnly flag', () => {
            const event = createMockEvent();
            const token = Token.issue(appId).withDuration(3600);

            setUserTokenCookie(event, token);

            const cookies = getSetCookies(event);

            expect(cookies.some(cookie => cookie.includes('HttpOnly'))).toBe(true);
        });

        it('should set the cookie max-age from config', () => {
            const event = createMockEvent();
            const token = Token.issue(appId).withDuration(3600);

            setUserTokenCookie(event, token);

            const cookies = getSetCookies(event);
            const expectedMaxAge = config.public.croct.cookie.userToken.duration;

            expect(cookies.some(cookie => cookie.includes(`Max-Age=${expectedMaxAge}`))).toBe(true);
        });
    });
});
