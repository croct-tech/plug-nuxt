import {test, expect} from '@playwright/test';

test.describe('CSR Personalization', () => {
    test('should render initial value then hydrate with real result', async ({page}) => {
        await page.goto('/csr/personalization/valid');

        await expect(page.getByTestId('result')).toHaveText('Initial Value');
        await expect(page.getByTestId('result')).toHaveText('2026-01-01T00:00:00.000000', {timeout: 10000});
    });

    test('should render fallback value for an invalid query with fallback', async ({page}) => {
        await page.goto('/csr/personalization/fallback');

        await expect(page.getByTestId('result')).toHaveText('Fallback Result', {timeout: 10000});
    });
});
