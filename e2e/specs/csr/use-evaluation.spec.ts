import {test, expect} from '@playwright/test';

test.describe('CSR useEvaluation', () => {
    test('should render initial value then hydrate with real result', async ({page}) => {
        await page.goto('/csr/use-evaluation/valid');

        await expect(page.getByTestId('result')).toHaveText('loading...');
        await expect(page.getByTestId('result')).toHaveText('2026-01-01T00:00:00.000000', {timeout: 10000});
    });

    test('should show error for an invalid query', async ({page}) => {
        await page.goto('/csr/use-evaluation/invalid');

        await expect(page.getByTestId('error')).toBeVisible({timeout: 10000});
    });

    test('should render fallback value for an invalid query with fallback', async ({page}) => {
        await page.goto('/csr/use-evaluation/fallback');

        await expect(page.getByTestId('result')).toHaveText('Fallback Value', {timeout: 10000});
    });
});
