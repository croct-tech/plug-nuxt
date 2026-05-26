import {describe, it, expect, afterEach} from 'vitest';
import {createEvent} from 'h3';
import {IncomingMessage, ServerResponse} from 'http';
import {Socket} from 'net';
import {Token} from '@croct/sdk/token';
import {ApiKey} from '@croct/sdk/apiKey';
import {useRuntimeConfig} from '#imports';
import handler from './croct';

async function handleRequest(event: ReturnType<typeof createEvent>): Promise<void> {
    return (handler as (event: ReturnType<typeof createEvent>) => Promise<void>)(event);
}

describe('middleware', () => {
    const config = useRuntimeConfig();
    const {appId} = config.public.croct;

    const privateKeyA = 'ES256;MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQge1bnNunjop'
        + '/VA7LxIk91sUQpnTb0wNOF/pOPQpPozXihRANCAARl+g1Uuu5PyWNwMnmAKQ/9tyDhvaY1l9ONgr'
        + '/rWQYMCHDTPqXbZQbPkWaPvmvlMyQdVK9olB8U70q9r02uHngq';

    const privateKeyB = 'ES256;MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3TbbvRM7DNwxY3XGWDmlSRPSfZ9b'
        + '+ch9TO3jQ68Zyj+hRANCAASmJj/EiEhUaLAWnbXMTb/85WADkuFgoELGZ5ByV7YP'
        + 'lbb2wY6oLjzGkpF6z8iDrvJ4kV6EhaJ4n0HwSQckVLNE';

    const UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

    const originalLocale = config.public.croct.defaultPreferredLocale;
    const originalApiKey = config.croct.apiKey;
    const originalDisableAuth = config.croct.disableUserTokenAuthentication;

    afterEach(() => {
        config.public.croct.defaultPreferredLocale = originalLocale;
        config.croct.apiKey = originalApiKey;
        config.croct.disableUserTokenAuthentication = originalDisableAuth;
    });

    function createMockEvent(
        url = 'http://localhost:3000/',
        headers: Record<string, string> = {},
    ): ReturnType<typeof createEvent> {
        const request = new IncomingMessage(new Socket());

        request.method = 'GET';

        const parsedUrl = new URL(url);

        request.url = parsedUrl.pathname + parsedUrl.search;
        request.headers.host = parsedUrl.host;

        for (const [name, value] of Object.entries(headers)) {
            request.headers[name] = value;
        }

        return createEvent(request, new ServerResponse(request));
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

    function createValidPreviewToken(): string {
        const header = Buffer.from('{"alg":"none"}').toString('base64url');
        const payload = Buffer.from('{"exp":9999999999}').toString('base64url');

        return `${header}.${payload}.`;
    }

    describe('route skipping', () => {
        it('should process page requests', async () => {
            const event = createMockEvent('http://localhost:3000/');

            await handleRequest(event);

            expect(event.context.croct).toBeDefined();
        });

        it('should process nested page requests', async () => {
            const event = createMockEvent('http://localhost:3000/products/123');

            await handleRequest(event);

            expect(event.context.croct).toBeDefined();
        });

        it('should skip static asset requests', async () => {
            const event = createMockEvent('http://localhost:3000/style.css');

            await handleRequest(event);

            expect(event.context.croct).toBeUndefined();
        });

        it('should skip /_nuxt/ requests', async () => {
            const event = createMockEvent('http://localhost:3000/_nuxt/entry.js');

            await handleRequest(event);

            expect(event.context.croct).toBeUndefined();
        });

        it('should skip /__nuxt_error requests', async () => {
            const event = createMockEvent('http://localhost:3000/__nuxt_error');

            await handleRequest(event);

            expect(event.context.croct).toBeUndefined();
        });
    });

    describe('client ID', () => {
        it('should generate a new client ID when cookie is missing', async () => {
            const event = createMockEvent();

            await handleRequest(event);

            expect(event.context.croct!.clientId).toMatch(UUID_PATTERN);
        });

        it('should reuse a valid client ID from cookie', async () => {
            const existingId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
            const event = createMockEvent();

            event.node.req.headers.cookie = `ct.client_id=${existingId}`;

            await handleRequest(event);

            expect(event.context.croct!.clientId).toBe(existingId);
        });

        it('should generate a new client ID when cookie is invalid', async () => {
            const event = createMockEvent();

            event.node.req.headers.cookie = 'ct.client_id=not-a-uuid';

            await handleRequest(event);

            expect(event.context.croct!.clientId).toMatch(UUID_PATTERN);
            expect(event.context.croct!.clientId).not.toBe('not-a-uuid');
        });

        it('should set the client ID cookie in the response', async () => {
            const event = createMockEvent();

            await handleRequest(event);

            const cookies = getSetCookies(event);

            expect(cookies.some(cookie => cookie.startsWith('ct.client_id='))).toBe(true);
        });
    });

    describe('user token', () => {
        it('should issue a new token when cookie is missing', async () => {
            const event = createMockEvent();

            await handleRequest(event);

            expect(event.context.croct!.userToken).toBeTruthy();
        });

        it('should issue a new token when cookie is invalid', async () => {
            const event = createMockEvent();

            event.node.req.headers.cookie = 'ct.user_token=not-a-jwt';

            await handleRequest(event);

            expect(event.context.croct!.userToken).toBeTruthy();
        });

        it('should reuse a valid unsigned token', async () => {
            config.croct.apiKey = '';

            const validToken = Token.issue(appId).withDuration(3600);
            const event = createMockEvent();

            event.node.req.headers.cookie = `ct.user_token=${validToken.toString()}`;

            await handleRequest(event);

            const contextToken = Token.parse(event.context.croct!.userToken);

            expect(contextToken.getApplicationId()).toBe(appId);
        });

        it('should replace a token from a different app', async () => {
            const foreignToken = Token.issue('00000000-0000-0000-0000-000000000000').withDuration(3600);
            const event = createMockEvent();

            event.node.req.headers.cookie = `ct.user_token=${foreignToken.toString()}`;

            await handleRequest(event);

            const contextToken = Token.parse(event.context.croct!.userToken);

            expect(contextToken.getApplicationId()).toBe(appId);
        });

        it('should replace an unsigned token when authentication is required', async () => {
            config.croct.apiKey = `${appId}:${privateKeyA}`;
            config.croct.disableUserTokenAuthentication = false;

            const unsignedToken = Token.issue(appId).withDuration(3600);
            const event = createMockEvent();

            event.node.req.headers.cookie = `ct.user_token=${unsignedToken.toString()}`;

            await handleRequest(event);

            const contextToken = Token.parse(event.context.croct!.userToken);

            expect(contextToken.isSigned()).toBe(true);
        });

        it('should re-sign a token when the API key changes', async () => {
            const oldKeyId = '00000000-0000-0000-0000-000000000001';
            const newKeyId = '00000000-0000-0000-0000-000000000002';

            const oldKey = ApiKey.parse(`${oldKeyId}:${privateKeyA}`);

            const signedToken = await Token.issue(appId)
                .withDuration(3600)
                .withTokenId(crypto.randomUUID())
                .signedWith(oldKey);

            config.croct.apiKey = `${newKeyId}:${privateKeyB}`;
            config.croct.disableUserTokenAuthentication = false;

            const event = createMockEvent();

            event.node.req.headers.cookie = `ct.user_token=${signedToken.toString()}`;

            await handleRequest(event);

            const contextToken = Token.parse(event.context.croct!.userToken);

            expect(contextToken.isSigned()).toBe(true);
            expect(contextToken.getSubject()).toBe(signedToken.getSubject());
        });
    });

    describe('request context', () => {
        it('should set the request URI', async () => {
            const event = createMockEvent('http://localhost:3000/page');

            await handleRequest(event);

            expect(event.context.croct!.uri).toBe('http://localhost:3000/page');
        });

        it('should resolve the client IP from x-forwarded-for', async () => {
            const event = createMockEvent('http://localhost:3000/', {
                'x-forwarded-for': '192.168.1.1, 10.0.0.1',
            });

            await handleRequest(event);

            expect(event.context.croct!.clientIp).toBe('192.168.1.1');
        });

        it('should resolve the client IP from x-real-ip', async () => {
            const event = createMockEvent('http://localhost:3000/', {
                'x-real-ip': '10.0.0.5',
            });

            await handleRequest(event);

            expect(event.context.croct!.clientIp).toBe('10.0.0.5');
        });

        it('should capture the user-agent', async () => {
            const event = createMockEvent('http://localhost:3000/', {
                'user-agent': 'TestBot/1.0',
            });

            await handleRequest(event);

            expect(event.context.croct!.clientAgent).toBe('TestBot/1.0');
        });

        it('should capture the referrer', async () => {
            const event = createMockEvent('http://localhost:3000/', {
                referer: 'https://google.com/',
            });

            await handleRequest(event);

            expect(event.context.croct!.referrer).toBe('https://google.com/');
        });

        it('should set the preferred locale from config', async () => {
            config.public.croct.defaultPreferredLocale = 'pt-BR';

            const event = createMockEvent();

            await handleRequest(event);

            expect(event.context.croct!.preferredLocale).toBe('pt-BR');
        });

        it('should not set the preferred locale when empty', async () => {
            config.public.croct.defaultPreferredLocale = '';

            const event = createMockEvent();

            await handleRequest(event);

            expect(event.context.croct!.preferredLocale).toBeUndefined();
        });
    });

    describe('preview token', () => {
        it('should set preview token from a valid query parameter', async () => {
            const previewToken = createValidPreviewToken();
            const event = createMockEvent(`http://localhost:3000/?croct-preview=${previewToken}`);

            await handleRequest(event);

            expect(event.context.croct!.previewToken).toBe(previewToken);
        });

        it('should not set preview token for an invalid token', async () => {
            const event = createMockEvent('http://localhost:3000/?croct-preview=garbage');

            await handleRequest(event);

            expect(event.context.croct!.previewToken).toBeUndefined();
        });

        it('should not set preview token when exiting preview', async () => {
            const event = createMockEvent('http://localhost:3000/?croct-preview=exit');

            await handleRequest(event);

            expect(event.context.croct!.previewToken).toBeUndefined();
        });

        it('should strip the preview query parameter from the URI', async () => {
            const event = createMockEvent('http://localhost:3000/page?croct-preview=token&foo=bar');

            await handleRequest(event);

            expect(event.context.croct!.uri).toBe('http://localhost:3000/page?foo=bar');
        });

        it('should set the preview cookie for a valid token', async () => {
            const previewToken = createValidPreviewToken();
            const event = createMockEvent(`http://localhost:3000/?croct-preview=${previewToken}`);

            await handleRequest(event);

            const cookies = getSetCookies(event);

            const previewCookie = cookies.find(
                cookie => cookie.startsWith('ct.preview_token='),
            );

            expect(previewCookie).toContain(previewToken);
        });

        it('should delete the preview cookie on exit', async () => {
            const event = createMockEvent('http://localhost:3000/?croct-preview=exit');

            await handleRequest(event);

            const cookies = getSetCookies(event);

            const previewCookie = cookies.find(
                cookie => cookie.startsWith('ct.preview_token='),
            );

            expect(previewCookie).toContain('Max-Age=0');
        });
    });
});
