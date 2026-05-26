import {test, expect} from '@playwright/test';

test.describe('server fetchContent', () => {
    test('should fetch valid slot content via API route', async ({request}) => {
        const response = await request.post('/api/_croct/content', {
            data: {slotId: 'home-hero'},
        });

        expect(response.ok()).toBe(true);

        const result = await response.json();

        expect(result.content.headline).toBe('Mock Headline');
    });

    test('should return an error for an invalid slot ID via API route', async ({request}) => {
        const response = await request.post('/api/_croct/content', {
            data: {slotId: 'nonexistent-slot'},
        });

        expect(response.ok()).toBe(false);
    });

    test('should render server-fetched content on a page', async ({page}) => {
        await page.goto('/server/content');

        await expect(page.getByTestId('result')).toContainText('Mock Headline');
    });
});
