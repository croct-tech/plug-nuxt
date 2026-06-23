import {getRequestHost} from 'h3';
import type {CredentialsResolver, CroctCredentials} from '@croct/plug-nuxt/types';
import {MOCK_SERVER_URL, TENANT_HOST, TENANT_NAME} from '../../constants';

// The default host uses the statically configured credentials; the secondary
// host represents a second tenant whose app ID and API key live in an external
// service fetched over HTTP per request (you would cache this in production).
const resolveCredentials: CredentialsResolver = async event => {
    const host = getRequestHost(event);

    if (!host.startsWith(TENANT_HOST)) {
        return null;
    }

    return $fetch<CroctCredentials>(`${MOCK_SERVER_URL}/credentials`, {query: {tenant: TENANT_NAME}});
};

export default resolveCredentials;
