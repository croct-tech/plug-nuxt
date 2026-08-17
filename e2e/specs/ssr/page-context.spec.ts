import {test, expect} from '@playwright/test';
import {APP_PORT} from '../../constants';

const APP_URL = `http://localhost:${APP_PORT}`;

// The sensitive parameter must be stripped by the URL sanitizer configured in the app
const PAGE_URL = `${APP_URL}/ssr/page-context?foo=bar`;

test.describe('page context', () => {
    test.use({timezoneId: 'America/Sao_Paulo'});

    test('should report the page being rendered on the server', async ({page}) => {
        await page.goto('/ssr/page-context?token=secret&foo=bar', {referer: 'https://google.com/'});

        await expect(page.getByTestId('evaluation-url')).toHaveText(PAGE_URL);
        await expect(page.getByTestId('evaluation-referrer')).toHaveText('https://google.com/');
        await expect(page.getByTestId('evaluation-attributes')).toHaveText('pro');
        await expect(page.getByTestId('content-url')).toHaveText(PAGE_URL);

        // The page is not rendered yet, and the time zone of the server is not the user's
        await expect(page.getByTestId('evaluation-title')).toHaveText('none');
        await expect(page.getByTestId('evaluation-time-zone')).toHaveText('none');
    });

    test('should report the page navigated to on the client', async ({page}) => {
        await page.goto('/');

        await page.getByRole('link', {name: 'page context'}).click();

        await expect(page.getByTestId('evaluation-url')).toHaveText(PAGE_URL);
        await expect(page.getByTestId('evaluation-time-zone')).toHaveText('America/Sao_Paulo');
        await expect(page.getByTestId('evaluation-attributes')).toHaveText('pro');
        await expect(page.getByTestId('content-url')).toHaveText(PAGE_URL);
    });

    test('should report the context of the tab when refetching in the browser', async ({page}) => {
        await page.goto('/ssr/page-context?token=secret&foo=bar');

        // Retried because the click has no effect until the page is hydrated
        await expect(async () => {
            await page.getByTestId('refresh').click();

            await expect(page.getByTestId('evaluation-title')).toHaveText('Page context', {timeout: 1000});
        }).toPass({timeout: 15000});

        await expect(page.getByTestId('evaluation-url')).toHaveText(PAGE_URL);
        await expect(page.getByTestId('evaluation-time-zone')).toHaveText('America/Sao_Paulo');
    });
});
