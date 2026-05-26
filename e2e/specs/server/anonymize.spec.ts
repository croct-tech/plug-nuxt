import {test, expect} from '@playwright/test';
import {Token} from '@croct/sdk/token';

test.describe('server anonymize', () => {
    test('should issue an anonymous user token', async ({page, request}) => {
        await page.goto('/');

        const identifyResponse = await request.post('/api/identify', {
            data: {userId: 'user-456'},
        });

        expect(identifyResponse.ok()).toBe(true);

        const anonymizeResponse = await request.post('/api/anonymize');

        expect(anonymizeResponse.ok()).toBe(true);

        const cookies = anonymizeResponse.headersArray()
            .filter(header => header.name.toLowerCase() === 'set-cookie')
            .map(header => header.value);

        const tokenCookie = cookies.find(cookie => cookie.startsWith('ct.user_token='));

        expect(tokenCookie).toBeDefined();

        const tokenValue = tokenCookie!.split('=')[1].split(';')[0];
        const token = Token.parse(tokenValue);

        expect(token.isAnonymous()).toBe(true);
    });
});
