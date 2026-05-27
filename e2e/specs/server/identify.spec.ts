import {test, expect} from '@playwright/test';
import {Token} from '@croct/sdk/token';

test.describe('server identify', () => {
    test('should issue a user token with the given user ID', async ({page, request}) => {
        await page.goto('/');

        const response = await request.post('/api/identify', {
            data: {userId: 'user-123'},
        });

        expect(response.ok()).toBe(true);

        const cookies = response.headersArray()
            .filter(header => header.name.toLowerCase() === 'set-cookie')
            .map(header => header.value);

        const tokenCookie = cookies.find(cookie => cookie.startsWith('ct.user_token='));

        expect(tokenCookie).toBeDefined();

        const tokenValue = tokenCookie!.split('=')[1].split(';')[0];
        const token = Token.parse(tokenValue);

        expect(token.getSubject()).toBe('user-123');
    });
});
