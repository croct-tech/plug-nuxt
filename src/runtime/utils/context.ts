import type {EvaluationContext} from '@croct/sdk/evaluator';

/**
 * Merges two evaluation contexts, giving precedence to the override.
 *
 * The page is not merged field by field, but reported as a whole, so the
 * page of the override never inherits parts of another page.
 */
export function mergeContext(base: EvaluationContext, override: EvaluationContext = {}): EvaluationContext {
    const page = override.page ?? base.page;

    return {
        ...base,
        ...override,
        ...(page !== undefined ? {page: page} : {}),
    };
}
