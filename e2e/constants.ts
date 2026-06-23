// Shared fixtures for the e2e app, mock server, and specs. Keep all values that
// must agree across those files here so a change stays in one place.

export const APP_PORT = 3200;

export const MOCK_SERVER_PORT = 3210;
export const MOCK_SERVER_URL = `http://localhost:${MOCK_SERVER_PORT}`;

// A throwaway ES256 private key, so the API keys carry real secret material and
// the leak test proves none of it reaches the client. The API key identifiers
// are deliberately different from the app IDs so the leak test can tell themI
// apart (the app ID is public and does reach the browser).
const PRIVATE_KEY = 'ES256;MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQge1bnNunjop'
    + '/VA7LxIk91sUQpnTb0wNOF/pOPQpPozXihRANCAARl+g1Uuu5PyWNwMnmAKQ/9tyDhvaY1l9ONgr'
    + '/rWQYMCHDTPqXbZQbPkWaPvmvlMyQdVK9olB8U70q9r02uHngq';

// Statically configured credentials used for the default host.
export const DEFAULT_CREDENTIALS = {
    appId: '00000000-0000-0000-0000-000000000000',
    apiKey: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa:${PRIVATE_KEY}`,
};

// A second tenant whose credentials live in the mock secrets service, keyed by
// name, and are resolved for requests arriving on the tenant host.
export const TENANT_NAME = 'tenant-b';
export const TENANT_HOST = '127.0.0.1';
export const TENANT_CREDENTIALS = {
    appId: '11111111-1111-1111-1111-111111111111',
    apiKey: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb:${PRIVATE_KEY}`,
};
