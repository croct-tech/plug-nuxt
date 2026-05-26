import {test, expect} from '@playwright/test';

test.describe('CSR useContent', () => {
    test('should render initial value then hydrate with real content', async ({page}) => {
        await page.goto('/csr/use-content/valid', {waitUntil: 'commit'});

        await expect(page.getByTestId('headline')).toHaveText('Loading...');
        await expect(page.getByTestId('headline')).toHaveText('Mock Headline', {timeout: 10000});
    });

    test('should show error for an invalid slot', async ({page}) => {
        await page.goto('/csr/use-content/invalid');

        await expect(page.getByTestId('error')).toBeVisible({timeout: 10000});
    });

    test('should render fallback content for an invalid slot with fallback', async ({page}) => {
        await page.goto('/csr/use-content/fallback');

        await expect(page.getByTestId('headline')).toHaveText('Fallback Headline', {timeout: 10000});
    });
});
