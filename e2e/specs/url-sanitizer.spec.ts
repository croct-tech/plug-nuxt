import {test, expect} from '@playwright/test';

test.describe('URL sanitizer', () => {
    test('should strip sensitive query parameters from tracked URLs', async ({page}) => {
        await page.goto('/url-sanitizer?token=secret123&email=user@example.com&utm_source=google');

        await expect(page.getByTestId('sanitized-url')).not.toHaveText('pending', {timeout: 10000});

        const trackedUrl = await page.getByTestId('sanitized-url').textContent();
        const sanitizedUrl = new URL(trackedUrl!);

        expect(sanitizedUrl.searchParams.has('token')).toBe(false);
        expect(sanitizedUrl.searchParams.has('email')).toBe(false);
        expect(sanitizedUrl.searchParams.get('utm_source')).toBe('google');
    });
});
