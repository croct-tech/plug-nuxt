import {describe, it, expect} from 'vitest';
import {mountSuspended, registerEndpoint} from '@nuxt/test-utils/runtime';
import Personalization from '../../../src/runtime/components/Personalization';

describe('Personalization', () => {
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
