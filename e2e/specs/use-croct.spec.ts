import {test, expect} from '@playwright/test';

test.describe('useCroct', () => {
    test('should server-render without throwing when called in setup', async ({request}) => {
        const response = await request.get('/use-croct');

        expect(response.ok()).toBe(true);
        expect(await response.text()).not.toContain('requires the Croct plugin');
    });

    test('should provide access to the initialized Croct plug instance', async ({page}) => {
        await page.goto('/use-croct');

        await expect(page.getByTestId('initialized')).toHaveText('yes', {timeout: 10000});
    });

    test('should track events', async ({page}) => {
        await page.goto('/use-croct');

        await expect(page.getByTestId('initialized')).toHaveText('yes', {timeout: 10000});

        await page.getByTestId('track-button').click();

        await expect(page.getByTestId('tracked')).toHaveText('tracked');
    });
});
