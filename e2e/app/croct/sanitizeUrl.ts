import type {UrlSanitizer} from '@croct/plug-nuxt/types';

const SENSITIVE_PARAMS = ['token', 'email', 'session_id'];

const sanitizeUrl: UrlSanitizer = url => {
    const sanitized = new URL(url);

    for (const param of SENSITIVE_PARAMS) {
        sanitized.searchParams.delete(param);
    }

    return sanitized;
};

export default sanitizeUrl;
