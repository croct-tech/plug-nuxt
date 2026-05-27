import {test, expect} from '@playwright/test';

test.describe('server fetchContent', () => {
    test('should fetch valid slot content', async ({request}) => {
        const response = await request.get('/api/content?slotId=home-hero');

        expect(response.ok()).toBe(true);

        const data = await response.json();

        expect(data.content.headline).toBe('Mock Headline');
    });

    test('should return an error for an invalid slot', async ({request}) => {
        const response = await request.get('/api/content?slotId=nonexistent-slot');

        expect(response.ok()).toBe(false);
    });

    test('should render server-fetched content on a page', async ({page}) => {
        await page.goto('/server/content');

        await expect(page.getByTestId('result')).toContainText('Mock Headline');
    });

    test('should fetch localized content with explicit locale', async ({request}) => {
        const response = await request.get('/api/content?slotId=home-hero&locale=pt-br');

        expect(response.ok()).toBe(true);

        const data = await response.json();

        expect(data.content.headline).toBe('Título Simulado');
    });
});
