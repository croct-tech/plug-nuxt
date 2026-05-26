import {test, expect} from '@playwright/test';

test.describe('server evaluate', () => {
    test('should evaluate a valid CQL query via API route', async ({request}) => {
        const response = await request.post('/api/_croct/evaluate', {
            data: {query: 'now'},
        });

        expect(response.ok()).toBe(true);
        expect(await response.text()).toContain('2026-01-01T00:00:00.000000');
    });

    test('should return an error for an invalid query via API route', async ({request}) => {
        const response = await request.post('/api/_croct/evaluate', {
            data: {query: 'invalid cql !!!'},
        });

        expect(response.ok()).toBe(false);
    });

    test('should render server-evaluated result on a page', async ({page}) => {
        await page.goto('/server/evaluate');

        await expect(page.getByTestId('result')).toContainText('2026-01-01T00:00:00.000000');
    });
});
