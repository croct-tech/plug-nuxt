import {test, expect} from '@playwright/test';

test.describe('server evaluate', () => {
    test('should evaluate a valid query', async ({request}) => {
        const response = await request.get('/api/evaluate?query=now');

        expect(response.ok()).toBe(true);

        const data = await response.json();

        expect(data.result).toBe('2026-01-01T00:00:00.000000');
    });

    test('should return an error for an invalid query', async ({request}) => {
        const response = await request.get('/api/evaluate?query=invalid+cql+!!!');

        expect(response.ok()).toBe(false);
    });

    test('should render server-evaluated result on a page', async ({page}) => {
        await page.goto('/server/evaluate');

        await expect(page.getByTestId('result')).toContainText('2026-01-01T00:00:00.000000');
    });
});
