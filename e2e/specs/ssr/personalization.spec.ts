import {test, expect} from '@playwright/test';

test.describe('SSR Personalization', () => {
    test('should server-render the evaluation result', async ({page}) => {
        await page.goto('/ssr/personalization/valid');

        await expect(page.getByTestId('result')).toHaveText('2026-01-01T00:00:00.000000');
    });

    test('should show an error for an invalid query', async ({page}) => {
        await page.goto('/ssr/personalization/invalid');

        await expect(page.getByTestId('error')).toBeVisible();
    });
});
