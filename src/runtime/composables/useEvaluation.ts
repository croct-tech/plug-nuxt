import type {JsonValue} from '@croct/plug/sdk/json';
import type {AsyncData, NuxtError} from '#app';
import {useAsyncData} from '#app';
import type {EvaluationOptions as BaseEvaluationOptions} from '../server/composables/evaluate';

export type EvaluationOptions<T extends JsonValue = JsonValue> = BaseEvaluationOptions<T>;

type UseEvaluationHook = {
    <T extends JsonValue = JsonValue>(
        query: string,
        options?: EvaluationOptions<T>,
    ): AsyncData<T, NuxtError | null>,

    <T extends JsonValue, F>(
        query: string,
        options: EvaluationOptions<T> & {fallback: F},
    ): AsyncData<T | F, NuxtError | null>,
};

function useEvaluationNuxt<T extends JsonValue>(query: string, options: EvaluationOptions<T> = {}): any {
    const cacheKey = `croct:eval:${query}:${JSON.stringify(options)}`;

    return useAsyncData(
        cacheKey,
        (): Promise<T> => $fetch('/api/_croct/evaluate', {
            method: 'POST',
            body: {query: query, ...options},
        }),
    );
}

export const useEvaluation: UseEvaluationHook = useEvaluationNuxt;
