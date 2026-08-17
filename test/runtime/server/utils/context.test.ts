import {describe, it, expect} from 'vitest';

import {resolveContext} from '../../../../src/runtime/server/utils/context';
import type {CroctRequestContext} from '../../../../src/types';

describe('resolveContext', () => {
    // The route the composables call, which must not be reported as the page
    const routeUri = 'http://localhost:3000/api/_croct/content';
    const pageUri = 'http://localhost:3000/products/1';

    const request: CroctRequestContext = {
        clientId: '00000000-0000-0000-0000-0000000000ff',
        userToken: 'token',
        uri: routeUri,
        referrer: pageUri,
    };

    it('should report the page reported by the caller', () => {
        expect(resolveContext(request, {page: {url: pageUri}})).toEqual({
            page: {url: pageUri},
        });
    });

    it('should preserve the context reported by the caller', () => {
        const context = resolveContext(request, {
            page: {url: pageUri, referrer: 'https://google.com/'},
            attributes: {plan: 'pro'},
        });

        expect(context).toEqual({
            page: {url: pageUri, referrer: 'https://google.com/'},
            attributes: {plan: 'pro'},
        });
    });

    it('should report the page of the request when the caller reports no page', () => {
        expect(resolveContext(request, {attributes: {plan: 'pro'}})).toEqual({
            page: {url: routeUri, referrer: pageUri},
            attributes: {plan: 'pro'},
        });
    });

    it('should report the page of the request when the caller reports no context', () => {
        expect(resolveContext(request)).toEqual({
            page: {url: routeUri, referrer: pageUri},
        });
    });

    it('should omit the referrer when the request has none', () => {
        expect(resolveContext({...request, referrer: undefined})).toEqual({
            page: {url: routeUri},
        });
    });

    it('should not report a page when the request has no URI', () => {
        const incompleteRequest = {
            clientId: request.clientId,
            userToken: request.userToken,
        } as CroctRequestContext;

        expect(resolveContext(incompleteRequest)).toEqual({});
    });
});
