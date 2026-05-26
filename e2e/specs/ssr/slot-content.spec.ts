import {test, expect} from '@playwright/test';

test.describe('SSR Slot', () => {
    test('should server-render slot content', async ({page}) => {
        await page.goto('/ssr/slot-content/valid');

        await expect(page.getByTestId('headline')).toHaveText('Mock Headline');
    });

    test('should show an error for an invalid slot', async ({page}) => {
        await page.goto('/ssr/slot-content/invalid');

        await expect(page.getByTestId('error')).toBeVisible();
    });

    test('should render fallback content when slot fails', async ({page}) => {
        await page.goto('/ssr/slot-content/fallback');

        await expect(page.getByTestId('headline')).toHaveText('Fallback Headline');
    });
});
