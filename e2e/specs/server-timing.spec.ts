import {test, expect} from '@playwright/test';

test.describe('Server-Timing', () => {
    test('should report content fetch timing on SSR pages using useContent', async ({request}) => {
        const response = await request.get('/ssr/use-content/valid');

        expect(response.ok()).toBe(true);
        expect(response.headers()['server-timing']).toMatch(
            /^croct;desc="Croct fetch home-hero";dur=\d+\.\d$/,
        );
    });

    test('should report evaluation timing on SSR pages using useEvaluation', async ({request}) => {
        const response = await request.get('/ssr/use-evaluation/valid');

        expect(response.ok()).toBe(true);
        expect(response.headers()['server-timing']).toMatch(
            /^croct;desc="Croct evaluate";dur=\d+\.\d$/,
        );
    });

    test('should report timing for both evaluation and content fetch on the same SSR page', async ({request}) => {
        const response = await request.get('/ssr/page-context');

        expect(response.ok()).toBe(true);

        const timing = response.headers()['server-timing'];

        expect(timing).toMatch(/croct;desc="Croct evaluate";dur=\d+\.\d/);
        expect(timing).toMatch(/croct;desc="Croct fetch context-echo";dur=\d+\.\d/);
    });

    test('should report content fetch timing on SSR pages using Slot', async ({request}) => {
        const response = await request.get('/ssr/slot-content/valid');

        expect(response.ok()).toBe(true);
        expect(response.headers()['server-timing']).toMatch(
            /^croct;desc="Croct fetch home-hero";dur=\d+\.\d$/,
        );
    });

    test('should report evaluation timing on SSR pages using Personalization', async ({request}) => {
        const response = await request.get('/ssr/personalization/valid');

        expect(response.ok()).toBe(true);
        expect(response.headers()['server-timing']).toMatch(
            /^croct;desc="Croct evaluate";dur=\d+\.\d$/,
        );
    });

    test('should report timing on server API routes calling fetchContent', async ({request}) => {
        const response = await request.get('/api/content?slotId=home-hero');

        expect(response.ok()).toBe(true);
        expect(response.headers()['server-timing']).toMatch(
            /^croct;desc="Croct fetch home-hero";dur=\d+\.\d$/,
        );
    });

    test('should report timing on server API routes calling evaluate', async ({request}) => {
        const response = await request.get('/api/evaluate?query=now');

        expect(response.ok()).toBe(true);
        expect(response.headers()['server-timing']).toMatch(
            /^croct;desc="Croct evaluate";dur=\d+\.\d$/,
        );
    });

    test('should still report timing when a fetch fails', async ({request}) => {
        const response = await request.get('/api/content?slotId=nonexistent-slot');

        expect(response.ok()).toBe(false);
        expect(response.headers()['server-timing']).toMatch(
            /^croct;desc="Croct fetch nonexistent-slot";dur=\d+\.\d$/,
        );
    });
});
