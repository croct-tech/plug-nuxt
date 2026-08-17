import type {EvaluationContext} from '@croct/sdk/evaluator';
import {mergeContext} from '../../utils/context';
import type {CroctRequestContext} from '../../../types';

/**
 * Resolves the context in which content and queries must be evaluated.
 *
 * The context reported by the caller takes precedence over the one derived from
 * the request, as the request may not be the page originating the evaluation,
 * like when it comes from the internal API routes.
 */
export function resolveContext(request: CroctRequestContext, context?: EvaluationContext): EvaluationContext {
    return mergeContext(
        request.uri !== undefined
            ? {
                page: {
                    url: request.uri,
                    ...(request.referrer !== undefined ? {referrer: request.referrer} : {}),
                },
            }
            : {},
        context,
    );
}
