import {describe, it, expect, afterEach, vi} from 'vitest';
import {mountSuspended, registerEndpoint} from '@nuxt/test-utils/runtime';
import {readBody} from 'h3';
import type {H3Event} from 'h3';
import type {EvaluationContext} from '@croct/sdk/evaluator';
import {clearNuxtData} from '#app';
import Personalization from '../../../src/runtime/components/Personalization';

describe('Personalization', () => {
    afterEach(() => {
        clearNuxtData();
        vi.resetAllMocks();

        window.history.replaceState({}, '', '/');
    });

    it('should render the evaluation result', async () => {
        registerEndpoint('/api/_croct/evaluate', {
            method: 'POST',
            handler: (): string => '2026-01-01T00:00:00',
        });

        const component = await mountSuspended(Personalization, {
            props: {
                query: 'now',
            },
            slots: {
                default: (props: {result: string}) => props.result,
            },
        });

        expect(component.text()).toContain('2026-01-01');
    });

    it('should render null results', async () => {
        registerEndpoint('/api/_croct/evaluate', {
            method: 'POST',
            handler: (): null => null,
        });

        const component = await mountSuspended(Personalization, {
            props: {
                query: 'now',
            },
            slots: {
                default: (props: {result: unknown}) => `result:${String(props.result)}`,
            },
        });

        expect(component.text()).toMatch(/result:(null|undefined)/);
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

        await mountSuspended(Personalization, {
            props: {
                query: 'page',
            },
            slots: {
                default: (props: {result: string}) => props.result,
            },
        });

        expect(receivedContext?.page?.url).toBe('http://localhost:3000/products/1?foo=bar');
    });

    it('should report the attributes as part of the context', async () => {
        let receivedContext: EvaluationContext | undefined;

        registerEndpoint('/api/_croct/evaluate', {
            method: 'POST',
            handler: async (event: H3Event): Promise<string> => {
                receivedContext = (await readBody(event)).context;

                return 'result';
            },
        });

        await mountSuspended(Personalization, {
            props: {
                query: 'attributed',
                attributes: {plan: 'pro'},
            },
            slots: {
                default: (props: {result: string}) => props.result,
            },
        });

        expect(receivedContext?.attributes).toEqual({plan: 'pro'});
    });

    it('should render the error slot on failure', async () => {
        registerEndpoint('/api/_croct/evaluate', {
            method: 'POST',
            handler: () => createError({statusCode: 500, statusMessage: 'Query failed'}),
        });

        const component = await mountSuspended(Personalization, {
            props: {
                query: 'invalid',
            },
            slots: {
                error: () => 'Something went wrong',
            },
        });

        expect(component.text()).toContain('Something went wrong');
    });
});
