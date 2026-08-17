import {describe, it, expect} from 'vitest';

import {mergeContext} from '../../../src/runtime/utils/context';

describe('mergeContext', () => {
    it('should report the page of the override context', () => {
        const merged = mergeContext(
            {page: {url: 'http://localhost:3000/api/_croct/content', referrer: 'http://localhost:3000/'}},
            {page: {url: 'http://localhost:3000/products/1'}},
        );

        expect(merged).toEqual({
            page: {url: 'http://localhost:3000/products/1'},
        });
    });

    it('should report the page of the base context when the override has none', () => {
        const merged = mergeContext(
            {page: {url: 'http://localhost:3000/products/1'}},
            {attributes: {plan: 'pro'}},
        );

        expect(merged).toEqual({
            page: {url: 'http://localhost:3000/products/1'},
            attributes: {plan: 'pro'},
        });
    });

    it('should omit the page when neither context reports one', () => {
        expect(mergeContext({}, {timeZone: 'America/Sao_Paulo'})).toEqual({
            timeZone: 'America/Sao_Paulo',
        });
    });

    it('should give precedence to the override context', () => {
        const merged = mergeContext(
            {timeZone: 'America/Sao_Paulo', attributes: {plan: 'free'}},
            {attributes: {plan: 'pro'}},
        );

        expect(merged).toEqual({
            timeZone: 'America/Sao_Paulo',
            attributes: {plan: 'pro'},
        });
    });

    it('should return the base context when there is no override', () => {
        expect(mergeContext({page: {url: 'http://localhost:3000/'}})).toEqual({
            page: {url: 'http://localhost:3000/'},
        });
    });
});
