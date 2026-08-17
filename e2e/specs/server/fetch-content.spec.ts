import {test, expect} from '@playwright/test';
import {APP_PORT} from '../../constants';

const APP_URL = `http://localhost:${APP_PORT}`;

test.describe('server fetchContent', () => {
    test('should fetch valid slot content', async ({request}) => {
        const response = await request.get('/api/content?slotId=home-hero');

        expect(response.ok()).toBe(true);

        const data = await response.json();

        expect(data.content.headline).toBe('Mock Headline');
    });

    test('should fetch in the context of the request, sanitized', async ({request}) => {
        // The mock API echoes the context it receives as the content of the slot
        const response = await request.get('/api/content?slotId=context-echo&token=secret&foo=bar');

        expect(response.ok()).toBe(true);

        const {content} = await response.json();

        expect(content.url).toBe(`${APP_URL}/api/content?slotId=context-echo&foo=bar`);
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
