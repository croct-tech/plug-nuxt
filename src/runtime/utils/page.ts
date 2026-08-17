import type {EvaluationContext} from '@croct/sdk/evaluator';
import {useRequestEvent, useRequestHeaders, useRequestURL} from '#app';
import {urlSanitizer} from '#croct/client-options';
import {mergeContext} from './context';

const UNKNOWN_TIME_ZONE = 'Etc/Unknown';

/**
 * Extends the given context with the page that originates the request.
 *
 * Content and queries must be evaluated in the context of the page that
 * originated the request. However, the internal API routes handle requests
 * whose URL is the route itself, so the page must be reported by the caller.
 */
export function resolvePageContext(context: EvaluationContext = {}): EvaluationContext {
    return mergeContext(capturePageContext(), context);
}

function capturePageContext(): EvaluationContext {
    // While rendering on the server, the page is the request being rendered.
    // Neither the title nor the time zone are reported: the page is not rendered
    // yet, and the time zone of the server is not the time zone of the user.
    if (useRequestEvent() !== undefined) {
        const referrer = useRequestHeaders(['referer']).referer;

        return {
            page: {
                url: sanitizeUrl(useRequestURL().href),
                ...(referrer !== undefined && referrer !== '' ? {referrer: sanitizeUrl(referrer)} : {}),
            },
        };
    }

    const timeZone = detectTimeZone();

    return {
        page: {
            url: sanitizeUrl(window.location.href),
            title: document.title,
            // The referrer of the request is the page itself,
            // so the referrer of the page comes from the document.
            ...(document.referrer !== '' ? {referrer: sanitizeUrl(document.referrer)} : {}),
        },
        ...(timeZone !== undefined ? {timeZone: timeZone} : {}),
    };
}

function sanitizeUrl(url: string): string {
    const normalizedUrl = encodeURI(decodeURI(url));

    return urlSanitizer !== undefined ? urlSanitizer(normalizedUrl).toString() : normalizedUrl;
}

function detectTimeZone(): string | undefined {
    const {timeZone} = Intl.DateTimeFormat().resolvedOptions();

    return timeZone === UNKNOWN_TIME_ZONE ? undefined : timeZone;
}
