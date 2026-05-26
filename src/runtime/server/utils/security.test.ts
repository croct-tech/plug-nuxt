import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {useRuntimeConfig} from '#imports';
import {getApiKey, getAuthenticationKey, isUserTokenAuthenticationEnabled, issueToken} from './security';

describe('security', () => {
    const identifier = '00000000-0000-0000-0000-000000000000';

    const privateKey = 'ES256;MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQge1bnNunjop'
        + '/VA7LxIk91sUQpnTb0wNOF/pOPQpPozXihRANCAARl+g1Uuu5PyWNwMnmAKQ/9tyDhvaY1l9ONgr'
        + '/rWQYMCHDTPqXbZQbPkWaPvmvlMyQdVK9olB8U70q9r02uHngq';

    const config = useRuntimeConfig();
    const originalApiKey = config.croct.apiKey;
    const originalDisable = config.croct.disableUserTokenAuthentication;
    const originalDuration = config.croct.tokenDuration;

    afterEach(() => {
        config.croct.apiKey = originalApiKey;
        config.croct.disableUserTokenAuthentication = originalDisable;
        config.croct.tokenDuration = originalDuration;
    });

    describe('getApiKey', () => {
        it('should return the API key when valid', () => {
            config.croct.apiKey = `${identifier}:${privateKey}`;

            expect(getApiKey().getIdentifier()).toBe(identifier);
        });

        it('should throw when the API key is empty', () => {
            config.croct.apiKey = '';

            expect(() => getApiKey()).toThrow('API key is missing');
        });

        it('should throw when the API key is invalid', () => {
            config.croct.apiKey = 'invalid';

            expect(() => getApiKey()).toThrow('API key is invalid');
        });
    });

    describe('getAuthenticationKey', () => {
        it('should return the key when it has a private key', () => {
            config.croct.apiKey = `${identifier}:${privateKey}`;

            expect(getAuthenticationKey().hasPrivateKey()).toBe(true);
        });

        it('should throw when the key has no private key', () => {
            config.croct.apiKey = identifier;

            expect(() => getAuthenticationKey()).toThrow('does not have a private key');
        });
    });

    describe('isUserTokenAuthenticationEnabled', () => {
        it('should return false when the API key is empty', () => {
            config.croct.apiKey = '';

            expect(isUserTokenAuthenticationEnabled()).toBe(false);
        });

        it('should return false when authentication is disabled', () => {
            config.croct.apiKey = identifier;
            config.croct.disableUserTokenAuthentication = true;

            expect(isUserTokenAuthenticationEnabled()).toBe(false);
        });

        it('should return true when the API key is set and authentication is enabled', () => {
            config.croct.apiKey = identifier;
            config.croct.disableUserTokenAuthentication = false;

            expect(isUserTokenAuthenticationEnabled()).toBe(true);
        });
    });

    describe('issueToken', () => {
        beforeEach(() => {
            config.croct.apiKey = '';
            config.croct.tokenDuration = 3600;
        });

        it('should issue an anonymous token', async () => {
            const token = await issueToken();

            expect(token.isAnonymous()).toBe(true);
            expect(token.getApplicationId()).toBe(config.public.croct.appId);
        });

        it('should issue a token with the specified user ID', async () => {
            const token = await issueToken('user-123');

            expect(token.isSubject('user-123')).toBe(true);
        });

        it('should issue a signed token when authentication is enabled', async () => {
            config.croct.apiKey = `${identifier}:${privateKey}`;
            config.croct.disableUserTokenAuthentication = false;

            const token = await issueToken();

            expect(token.isSigned()).toBe(true);
        });

        it('should issue an unsigned token when authentication is disabled', async () => {
            const token = await issueToken();

            expect(token.isSigned()).toBe(false);
        });

        it('should use the provided token ID', async () => {
            const tokenId = '12345678-1234-1234-1234-123456789abc';

            config.croct.apiKey = `${identifier}:${privateKey}`;
            config.croct.disableUserTokenAuthentication = false;

            const token = await issueToken(null, tokenId);

            expect(token.getTokenId()).toBe(tokenId);
        });
    });
});
