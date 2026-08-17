import {describe, it, expect, afterEach, vi} from 'vitest';
import {registerEndpoint} from '@nuxt/test-utils/runtime';
import {readBody} from 'h3';
import type {H3Event} from 'h3';
import type {EvaluationContext} from '@croct/sdk/evaluator';
import {clearNuxtData} from '#app';
import {useEvaluation} from '../../../src/runtime/composables/useEvaluation';

describe('useEvaluation', () => {
    afterEach(() => {
        clearNuxtData();
        vi.resetAllMocks();

        window.history.replaceState({}, '', '/');
    });

    it('should evaluate a query via the internal API route', async () => {
        registerEndpoint('/api/_croct/evaluate', {
            method: 'POST',
            handler: () => '2026-01-01T00:00:00',
        });

        const {data} = await useEvaluation('now');

        expect(data.value).toBe('2026-01-01T00:00:00');
    });

    it('should report the page that originated the request', async () => {
        window.history.replaceState({}, '', '/products/1?foo=bar');

        let receivedContext: EvaluationContext | undefined;

        registerEndpoint('/api/_croct/evaluate', {
            method: 'POST',
            handler: async (event: H3Event): Promise<string> => {
                receivedContext = (await readBody(event)).context;

                return 'result';
            },
        });

        await useEvaluation('page');

        expect(receivedContext?.page?.url).toBe('http://localhost:3000/products/1?foo=bar');
    });
});
