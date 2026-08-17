import {describe, it, expect, afterEach, vi} from 'vitest';
import type {H3Event} from 'h3';

import {resolveContext} from '../../../src/runtime/utils/context';

let mockRequestEvent: H3Event | undefined;
let mockRequestHeaders: Record<string, string> = {};

const clientOptions = vi.hoisted(
    () => ({
        urlSanitizer: undefined as ((url: string) => URL) | undefined,
    }),
);

vi.mock('#croct/client-options', () => clientOptions);

vi.mock('#app', async () => {
    const actual: Record<string, unknown> = await vi.importActual('#app');

    return {
        ...actual,
        useRequestEvent: () => mockRequestEvent,
        useRequestHeaders: () => mockRequestHeaders,
    };
});

describe('resolveContext', () => {
    afterEach(() => {
        vi.restoreAllMocks();

        mockRequestEvent = undefined;
        mockRequestHeaders = {};
        clientOptions.urlSanitizer = undefined;

        document.title = '';

        setDocumentReferrer('');

        window.history.replaceState({}, '', '/');
    });

    function setDocumentReferrer(referrer: string): void {
        Object.defineProperty(document, 'referrer', {
            value: referrer,
            configurable: true,
        });
    }

    function mockTimeZone(timeZone: string): void {
        vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
            .mockReturnValue({timeZone: timeZone} as Intl.ResolvedDateTimeFormatOptions);
    }

    function sanitizeToken(url: string): URL {
        const sanitized = new URL(url);

        sanitized.searchParams.delete('token');

        return sanitized;
    }

    describe('in the browser', () => {
        it('should report the URL, title and time zone of the current page', () => {
            mockTimeZone('America/Sao_Paulo');

            window.history.replaceState({}, '', '/products/1?foo=bar');

            document.title = 'Product 1';

            expect(resolveContext()).toEqual({
                page: {
                    url: 'http://localhost:3000/products/1?foo=bar',
                    title: 'Product 1',
                },
                timeZone: 'America/Sao_Paulo',
            });
        });

        it('should report the referrer of the document', () => {
            setDocumentReferrer('https://google.com/');

            expect(resolveContext().page?.referrer).toBe('https://google.com/');
        });

        it('should omit the referrer when the document has none', () => {
            expect(resolveContext().page).not.toHaveProperty('referrer');
        });

        it('should omit the time zone when it cannot be detected', () => {
            mockTimeZone('Etc/Unknown');

            expect(resolveContext()).not.toHaveProperty('timeZone');
        });

        it('should sanitize the URL and the referrer', () => {
            clientOptions.urlSanitizer = sanitizeToken;

            window.history.replaceState({}, '', '/products/1?token=secret&foo=bar');

            setDocumentReferrer('https://google.com/?token=secret&foo=bar');

            expect(resolveContext().page).toEqual({
                url: 'http://localhost:3000/products/1?foo=bar',
                title: '',
                referrer: 'https://google.com/?foo=bar',
            });
        });
    });

    describe('while rendering on the server', () => {
        it('should report the URL of the page being rendered', () => {
            mockRequestEvent = {} as H3Event;

            window.history.replaceState({}, '', '/products/1?foo=bar');

            expect(resolveContext()).toEqual({
                page: {url: 'http://localhost:3000/products/1?foo=bar'},
            });
        });

        it('should report the referrer of the request being rendered', () => {
            mockRequestEvent = {} as H3Event;
            mockRequestHeaders = {referer: 'https://google.com/'};

            // The document referrer must not leak into the server-side context
            setDocumentReferrer('https://example.com/');

            expect(resolveContext().page?.referrer).toBe('https://google.com/');
        });

        it('should omit the referrer when the request has none', () => {
            mockRequestEvent = {} as H3Event;

            expect(resolveContext().page).not.toHaveProperty('referrer');
        });

        it('should not report the title nor the time zone', () => {
            mockRequestEvent = {} as H3Event;

            document.title = 'Product 1';

            expect(resolveContext()).toEqual({
                page: {url: 'http://localhost:3000/'},
            });
        });

        it('should sanitize the URL and the referrer', () => {
            mockRequestEvent = {} as H3Event;
            mockRequestHeaders = {referer: 'https://google.com/?token=secret&foo=bar'};

            clientOptions.urlSanitizer = sanitizeToken;

            window.history.replaceState({}, '', '/products/1?token=secret&foo=bar');

            expect(resolveContext().page).toEqual({
                url: 'http://localhost:3000/products/1?foo=bar',
                referrer: 'https://google.com/?foo=bar',
            });
        });
    });

    describe('with a context from the caller', () => {
        it('should preserve the context reported by the caller', () => {
            mockRequestEvent = {} as H3Event;

            expect(resolveContext({attributes: {plan: 'pro'}})).toEqual({
                page: {url: 'http://localhost:3000/'},
                attributes: {plan: 'pro'},
            });
        });

        it('should give precedence to the page reported by the caller', () => {
            mockRequestEvent = {} as H3Event;

            expect(resolveContext({page: {url: 'https://example.com/landing'}}).page).toEqual({
                url: 'https://example.com/landing',
            });
        });
    });
});
