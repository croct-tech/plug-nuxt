import {EvaluationContext} from '@croct/sdk/evaluator';
import {useRequestEvent, useRequestHeaders, useRequestURL} from '#app';
import {urlSanitizer} from '#croct/client-options';

/**
 * Resolves the context in which content and queries must be evaluated.
 *
 * The evaluation must be based on the page that originated the request, but the
 * internal API routes handle requests whose URL is the route itself, so the page
 * is provided by the caller, which takes precedence over the captured one.
 */
export function resolveContext(context: EvaluationContext = {}): EvaluationContext {
    return EvaluationContext.createPageContext(
        {
            ...capturePage(),
            ...context,
        },
        {urlSanitizer: urlSanitizer},
    );
}

/**
 * Returns the page being rendered on the server.
 *
 * In the browser, the SDK captures the page it runs on, including the title and
 * the time zone, which are unknown while rendering: the page is not rendered
 * yet, and the time zone of the server is not the time zone of the user.
 */
function capturePage(): EvaluationContext {
    if (useRequestEvent() === undefined) {
        return {};
    }

    const referrer = useRequestHeaders(['referer']).referer;

    return {
        page: {
            url: useRequestURL().href,
            ...(referrer !== undefined && referrer !== '' ? {referrer: referrer} : {}),
        },
    };
}
