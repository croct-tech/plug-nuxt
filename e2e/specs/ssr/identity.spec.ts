import {test, expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {Token} from '@croct/sdk/token';
import {DEFAULT_CREDENTIALS} from '../../constants';

type Identity = {
    clientId: string,
    userToken: string,
};

test.describe('identity', () => {
    async function getIdentity(page: Page): Promise<Identity> {
        const cookies = await page.context().cookies();

        return {
            clientId: cookies.find(cookie => cookie.name === 'ct.client_id')!.value,
            userToken: cookies.find(cookie => cookie.name === 'ct.user_token')!.value,
        };
    }

    async function fetchIdentity(page: Page): Promise<{token: string, preview: boolean}> {
        const {fetched} = await (await page.request.get('/api/identity')).json();

        return fetched;
    }

    test('should expose the identity to the SDK', async ({page}) => {
        await page.goto('/identity');

        const cookies = await page.evaluate(() => document.cookie);

        expect(cookies).toContain('ct.client_id=');
        expect(cookies).toContain('ct.user_token=');
    });

    test('should evaluate and fetch as the identified visitor while rendering a first visit', async ({page}) => {
        // No cookies yet, so the middleware issues the identity while rendering
        await page.goto('/identity');

        const {clientId, userToken} = await getIdentity(page);

        await expect(page.getByTestId('server-evaluation-token')).toHaveText(userToken);
        await expect(page.getByTestId('server-evaluation-client-id')).toHaveText(clientId);
        await expect(page.getByTestId('server-fetch-token')).toHaveText(userToken);
        await expect(page.getByTestId('server-fetch-client-id')).toHaveText(clientId);
    });

    test('should evaluate and fetch as the identified visitor while rendering a later visit', async ({page}) => {
        await page.goto('/identity');

        const {clientId, userToken} = await getIdentity(page);

        await page.goto('/identity');

        await expect(page.getByTestId('server-evaluation-token')).toHaveText(userToken);
        await expect(page.getByTestId('server-evaluation-client-id')).toHaveText(clientId);
        await expect(page.getByTestId('server-fetch-token')).toHaveText(userToken);
    });

    test('should evaluate and fetch as the identified visitor when navigating on the client', async ({page}) => {
        await page.goto('/');

        const {clientId, userToken} = await getIdentity(page);

        await page.getByRole('link', {name: 'identity'}).click();

        await expect(page.getByTestId('server-evaluation-token')).toHaveText(userToken);
        await expect(page.getByTestId('server-fetch-token')).toHaveText(userToken);
        await expect(page.getByTestId('server-fetch-client-id')).toHaveText(clientId);
    });

    test('should evaluate and fetch as the identified visitor in the browser', async ({page}) => {
        await page.goto('/identity');

        const {userToken} = await getIdentity(page);

        await expect(page.getByTestId('browser-evaluation-token')).toHaveText(userToken, {timeout: 10000});
        await expect(page.getByTestId('browser-fetch-token')).toHaveText(userToken, {timeout: 10000});
    });

    test('should evaluate and fetch as the identified visitor in an application route', async ({page}) => {
        await page.goto('/identity');

        const {userToken} = await getIdentity(page);

        // The request shares the cookies of the page
        const response = await page.request.get('/api/identity');

        expect(response.ok()).toBe(true);

        const {evaluated, fetched} = await response.json();

        expect(evaluated.token).toBe(userToken);
        expect(fetched.token).toBe(userToken);
    });

    test('should stop previewing once the preview is exited', async ({page}) => {
        const previewToken = Token.issue(DEFAULT_CREDENTIALS.appId)
            .withDuration(3600)
            .toString();

        await page.goto(`/identity?croct-preview=${previewToken}`);

        expect((await fetchIdentity(page)).preview).toBe(true);

        await page.goto('/identity?croct-preview=exit');

        // The SDK also manages the preview cookie, so exiting settles asynchronously
        await expect
            .poll(async () => (await fetchIdentity(page)).preview)
            .toBe(false);
    });

    test('should keep the identity of an identified user', async ({page}) => {
        // The application resolver identifies the user from a session cookie
        await page.context().addCookies([{
            name: 'app.session_user',
            value: 'user-42',
            url: 'http://localhost:3200',
        }]);

        await page.goto('/identity');

        const {userToken} = await getIdentity(page);

        await expect(page.getByTestId('server-evaluation-token')).toHaveText(userToken);
        await expect(page.getByTestId('server-fetch-token')).toHaveText(userToken);
        await expect(page.getByTestId('browser-evaluation-token')).toHaveText(userToken, {timeout: 10000});
        await expect(page.getByTestId('browser-fetch-token')).toHaveText(userToken, {timeout: 10000});
    });
});
