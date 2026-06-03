import {test, expect} from '@playwright/test';

/**
 * These tests run against a production build served from the Nitro output, so that
 * Nuxt route rules actually take effect. They cover the two ways to combine
 * prerendering (static generation) with Croct's dynamic content:
 *
 *   - Keep the page prerendered and load personalized content on the client (CSR).
 *   - Opt the page out of prerendering and render it on demand on the server (SSR).
 */
test.describe('Prerendering with Croct', () => {
    test.describe('prerendered page, client-side personalization (CSR)', () => {
        test('serves the static prerendered HTML with the initial content', async ({request}) => {
            const response = await request.get('/prerender/csr');
            const html = await response.text();

            expect(response.status()).toBe(200);

            // The page is served as a static asset, so the Croct middleware never runs.
            expect(response.headers()['set-cookie']).toBeUndefined();

            // The build-time HTML carries the initial value, never the dynamic content.
            expect(html).toContain('Initial Hero');
            expect(html).not.toContain('Mock Headline');
        });

        test('hydrates the prerendered page with personalized content on the client', async ({page}) => {
            await page.goto('/prerender/csr', {waitUntil: 'commit'});

            // The prerendered initial content is visible immediately...
            await expect(page.getByTestId('headline')).toHaveText('Initial Hero');

            // ...then the client-side fetch replaces it with the personalized content.
            await expect(page.getByTestId('headline')).toHaveText('Mock Headline', {timeout: 10000});
        });
    });

    test.describe('page opted out of prerendering, rendered on demand (SSR)', () => {
        test('server-renders the personalized content per request', async ({request}) => {
            const response = await request.get('/prerender/ssr');
            const html = await response.text();

            expect(response.status()).toBe(200);

            // The Croct middleware runs on every request for a dynamic route.
            expect(response.headers()['set-cookie']).toBeDefined();

            // The personalized content is already present in the initial HTML.
            expect(html).toContain('Mock Headline');
        });
    });
});
