import {test, expect} from '@playwright/test';

test.describe('SSR useContent', () => {
    test('should server-render content', async ({page}) => {
        await page.goto('/ssr/use-content/valid');

        await expect(page.getByTestId('headline')).toHaveText('Mock Headline');
    });

    test('should show an error for an invalid slot', async ({page}) => {
        await page.goto('/ssr/use-content/invalid');

        await expect(page.getByTestId('error')).toBeVisible();
    });

    test('should fetch localized content with explicit locale', async ({page}) => {
        await page.goto('/ssr/use-content/localized');

        await expect(page.getByTestId('headline')).toHaveText('Título Simulado');
    });
});
