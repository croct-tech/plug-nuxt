import {test, expect} from '@playwright/test';
import {APP_PORT} from '../../constants';

const APP_URL = `http://localhost:${APP_PORT}`;

test.describe('server evaluate', () => {
    test('should evaluate a valid query', async ({request}) => {
        const response = await request.get('/api/evaluate?query=now');

        expect(response.ok()).toBe(true);

        const data = await response.json();

        expect(data.result).toBe('2026-01-01T00:00:00.000000');
    });

    test('should evaluate in the context of the request, sanitized', async ({request}) => {
        // The mock API echoes the context it receives
        const response = await request.get('/api/evaluate?query=context&token=secret&foo=bar');

        expect(response.ok()).toBe(true);

        const {result} = await response.json();

        expect(result.page.url).toBe(`${APP_URL}/api/evaluate?query=context&foo=bar`);
    });

    test('should return an error for an invalid query', async ({request}) => {
        const response = await request.get('/api/evaluate?query=invalid+cql+!!!');

        expect(response.ok()).toBe(false);
    });

    test('should render server-evaluated result on a page', async ({page}) => {
        await page.goto('/server/evaluate');

        await expect(page.getByTestId('result')).toContainText('2026-01-01T00:00:00.000000');
    });
});
