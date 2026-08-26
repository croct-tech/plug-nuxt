import {test, expect} from '@playwright/test';

test.describe('identity', () => {
    test('should evaluate as the visitor the response identifies, on a first visit', async ({page}) => {
        // No cookies yet, so the middleware issues the identity while rendering
        await page.goto('/identity');

        const cookies = await page.context().cookies();
        const clientId = cookies.find(cookie => cookie.name === 'ct.client_id');
        const userToken = cookies.find(cookie => cookie.name === 'ct.user_token');

        await expect(page.getByTestId('client-id')).toHaveText(clientId!.value);
        await expect(page.getByTestId('token')).toHaveText(userToken!.value);
    });

    test('should evaluate as the visitor the cookies identify, on a later visit', async ({page}) => {
        await page.goto('/identity');

        const [{value: clientId}] = (await page.context().cookies())
            .filter(cookie => cookie.name === 'ct.client_id');

        await page.goto('/identity');

        await expect(page.getByTestId('client-id')).toHaveText(clientId);
    });
});
