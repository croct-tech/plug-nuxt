import {describe, it, expect} from 'vitest';
import {registerEndpoint} from '@nuxt/test-utils/runtime';
import {useEvaluation} from '../../../src/runtime/composables/useEvaluation';

describe('useEvaluation', () => {
    it('should evaluate a query via the internal API route', async () => {
        registerEndpoint('/api/_croct/evaluate', {
            method: 'POST',
            handler: () => '2026-01-01T00:00:00',
        });

        const {data} = await useEvaluation('now');

        expect(data.value).toBe('2026-01-01T00:00:00');
    });
});
