import {test, expect} from '@playwright/test';

test.describe('server middleware', () => {
    test.describe('cookies', () => {
        test('should set a valid UUID client ID cookie', async ({page}) => {
            await page.goto('/');

            const cookies = await page.context().cookies();
            const clientIdCookie = cookies.find(cookie => cookie.name === 'ct.client_id');

            expect(clientIdCookie).toBeDefined();
            expect(clientIdCookie!.value).toMatch(
                /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
            );
        });

        test('should set a JWT user token cookie', async ({page}) => {
            await page.goto('/');

            const cookies = await page.context().cookies();
            const userTokenCookie = cookies.find(cookie => cookie.name === 'ct.user_token');

            expect(userTokenCookie).toBeDefined();
            expect(userTokenCookie!.value.split('.')).toHaveLength(3);
        });

        test('should persist the client ID across page navigations', async ({page}) => {
            await page.goto('/');

            const firstCookies = await page.context().cookies();
            const firstClientId = firstCookies.find(cookie => cookie.name === 'ct.client_id')!.value;

            await page.goto('/ssr/use-content/valid');

            const secondCookies = await page.context().cookies();
            const secondClientId = secondCookies.find(cookie => cookie.name === 'ct.client_id')!.value;

            expect(firstClientId).toBe(secondClientId);
        });

        test('should not set cookies on static assets', async ({request}) => {
            const response = await request.get('/_nuxt/@vite/client', {
                failOnStatusCode: false,
            });

            const setCookieHeader = response.headers()['set-cookie'] ?? '';

            expect(setCookieHeader).not.toContain('ct.client_id');
        });
    });

    test.describe('preview tokens', () => {
        function createValidPreviewToken(): string {
            const header = Buffer.from('{"alg":"none"}').toString('base64url');
            const payload = Buffer.from('{"exp":9999999999}').toString('base64url');

            return `${header}.${payload}.`;
        }

        test('should set preview cookie from a valid query parameter', async ({page}) => {
            const previewToken = createValidPreviewToken();

            await page.goto(`/?croct-preview=${previewToken}`);

            const cookies = await page.context().cookies();
            const previewCookie = cookies.find(cookie => cookie.name === 'ct.preview_token');

            expect(previewCookie).toBeDefined();
            expect(previewCookie!.value).toBe(previewToken);
        });

        test('should persist preview cookie across navigations', async ({page}) => {
            const previewToken = createValidPreviewToken();

            await page.goto(`/?croct-preview=${previewToken}`);

            const cookiesAfterSet = await page.context().cookies();

            expect(cookiesAfterSet.find(cookie => cookie.name === 'ct.preview_token')).toBeDefined();

            await page.goto('/ssr/use-content/valid');

            const cookiesAfterNav = await page.context().cookies();
            const previewCookie = cookiesAfterNav.find(cookie => cookie.name === 'ct.preview_token');

            expect(previewCookie).toBeDefined();
            expect(previewCookie!.value).toBe(previewToken);
        });

        test('should clear preview cookie for an invalid token', async ({page}) => {
            const header = Buffer.from('{"alg":"none"}').toString('base64url');
            const payload = Buffer.from('{"exp":0}').toString('base64url');
            const expiredToken = `${header}.${payload}.`;

            await page.goto(`/?croct-preview=${expiredToken}`);

            const cookies = await page.context().cookies();

            expect(cookies.find(cookie => cookie.name === 'ct.preview_token')).toBeUndefined();
        });

        test('should clear preview cookie on exit', async ({page}) => {
            const previewToken = createValidPreviewToken();

            await page.goto(`/?croct-preview=${previewToken}`);

            const cookiesAfterSet = await page.context().cookies();

            expect(cookiesAfterSet.find(cookie => cookie.name === 'ct.preview_token')).toBeDefined();

            await page.goto('/?croct-preview=exit');

            const cookiesAfterExit = await page.context().cookies();

            expect(cookiesAfterExit.find(cookie => cookie.name === 'ct.preview_token')).toBeUndefined();
        });
    });
});
