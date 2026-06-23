import {test, expect, type APIResponse, type Page, type Request, type Response} from '@playwright/test';
import {Token} from '@croct/sdk/token';
import {APP_PORT, MOCK_SERVER_URL, DEFAULT_CREDENTIALS, TENANT_CREDENTIALS, TENANT_HOST} from '../constants';

test.describe('credentials resolver', () => {
    // The default host falls back to the statically configured credentials; requests
    // carrying the tenant host trigger the credentials resolver, which fetches the
    // tenant's app ID and API key from the mock secrets service over HTTP.
    const tenantHost = `${TENANT_HOST}:${APP_PORT}`;

    test('issues the user token for the configured app on the default host', async ({request}) => {
        const response = await request.get('/tenant');

        const token = Token.parse(getCookieValue(response, 'ct.user_token'));

        expect(token.getApplicationId()).toBe(DEFAULT_CREDENTIALS.appId);
    });

    test('issues the user token for the app resolved on the tenant host', async ({request}) => {
        const response = await request.get('/tenant', {headers: {host: tenantHost}});

        const token = Token.parse(getCookieValue(response, 'ct.user_token'));

        expect(token.getApplicationId()).toBe(TENANT_CREDENTIALS.appId);
    });

    test('creates the browser plug with the configured app on the default host', async ({page}) => {
        const apiCall = page.waitForRequest(isClientApiCall);

        await page.goto('/tenant');

        expect((await apiCall).headers()['x-app-id']).toBe(DEFAULT_CREDENTIALS.appId);
    });

    test('creates the browser plug with the app resolved on the tenant host', async ({page}) => {
        const apiCall = page.waitForRequest(isClientApiCall);

        await page.goto(`http://${tenantHost}/tenant`);

        expect((await apiCall).headers()['x-app-id']).toBe(TENANT_CREDENTIALS.appId);
    });

    test('serves content using the credentials resolved over HTTP', async ({request}) => {
        const response = await request.get('/api/content?slotId=home-hero', {headers: {host: tenantHost}});

        expect(response.ok()).toBe(true);
        expect((await response.json()).content.headline).toBe('Mock Headline');
    });

    test('never exposes the API key to the client on the default host', async ({page}) => {
        const traffic = await captureClientTraffic(page, '/tenant');
        const [, privateKey] = DEFAULT_CREDENTIALS.apiKey.split(':');

        // The public app ID does reach the browser (so the checks are meaningful),
        // but the API key and its private key never appear in any request,
        // response body (HTML, scripts, JSON), or header the browser sees.
        expect(traffic).toContain(DEFAULT_CREDENTIALS.appId);
        expect(traffic).not.toContain(DEFAULT_CREDENTIALS.apiKey);
        expect(traffic).not.toContain(privateKey);
    });

    test('never exposes the API key to the client on the tenant host', async ({page}) => {
        const traffic = await captureClientTraffic(page, `http://${tenantHost}/tenant`);
        const [, privateKey] = TENANT_CREDENTIALS.apiKey.split(':');

        expect(traffic).toContain(TENANT_CREDENTIALS.appId);
        expect(traffic).not.toContain(TENANT_CREDENTIALS.apiKey);
        expect(traffic).not.toContain(privateKey);
    });

    async function captureClientTraffic(page: Page, url: string): Promise<string> {
        const captured: string[] = [];
        const bodies: Array<Promise<unknown>> = [];

        const onRequest = (request: Request): void => {
            captured.push(request.url(), JSON.stringify(request.headers()), request.postData() ?? '');
        };

        const onResponse = (response: Response): void => {
            captured.push(response.url(), JSON.stringify(response.headersArray()));
            bodies.push(response.text().then(body => captured.push(body), () => undefined));
        };

        page.on('request', onRequest);
        page.on('response', onResponse);

        await page.goto(url, {waitUntil: 'networkidle'});
        await Promise.all(bodies);

        page.off('request', onRequest);
        page.off('response', onResponse);

        return captured.join('\n');
    }

    function getCookieValue(response: APIResponse, name: string): string {
        const cookie = response.headersArray()
            .filter(header => header.name.toLowerCase() === 'set-cookie')
            .map(header => header.value)
            .find(value => value.startsWith(`${name}=`));

        if (cookie === undefined) {
            throw new Error(`The "${name}" cookie was not set.`);
        }

        return decodeURIComponent(cookie.slice(name.length + 1).split(';')[0]);
    }

    function isClientApiCall(request: Request): boolean {
        return request.url().startsWith(MOCK_SERVER_URL) && request.method() === 'POST';
    }
});
