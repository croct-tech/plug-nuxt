import {test, expect} from '@playwright/test';

test.describe('CSR Slot', () => {
    test('should render initial value then hydrate with real content', async ({page}) => {
        await page.goto('/csr/slot-content/valid', {waitUntil: 'commit'});

        await expect(page.getByTestId('headline')).toHaveText('Initial Hero');
        await expect(page.getByTestId('headline')).toHaveText('Mock Headline', {timeout: 10000});
    });

    test('should render fallback content for an invalid slot with fallback', async ({page}) => {
        await page.goto('/csr/slot-content/fallback');

        await expect(page.getByTestId('headline')).toHaveText('Fallback Content', {timeout: 10000});
    });
});
