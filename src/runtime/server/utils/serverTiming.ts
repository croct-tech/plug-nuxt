import {AsyncLocalStorage} from 'node:async_hooks';
import type {ServerResponse} from 'node:http';
import {useRuntimeConfig} from '#imports';

type TimedResponse = {
    response: ServerResponse,
    // Node.js replaces the trailers on every addTrailers() call, so they are accumulated here.
    trailers: string[],
};

type Storage = AsyncLocalStorage<TimedResponse>;

// Shared across bundles and ESM/CJS copies so the Nitro plugin and server composables
// share a single request scope.
const STORAGE_KEY = Symbol.for('@croct/plug-nuxt/server-timing');

function getStorage(create = false): Storage | null {
    const existing = Reflect.get(globalThis, STORAGE_KEY) as Storage | undefined;

    if (existing !== undefined) {
        return existing;
    }

    if (!create) {
        return null;
    }

    const storage = new AsyncLocalStorage<TimedResponse>();

    Object.defineProperty(globalThis, STORAGE_KEY, {value: storage, configurable: true});

    return storage;
}

/**
 * Runs a callback with the given response tracked for Server-Timing reporting.
 *
 * Nested calls (such as internal subrequests issued via useRequestFetch during SSR)
 * inherit the outer response so timings are reported on the response being rendered.
 *
 * @internal
 */
export function trackResponse<T>(response: ServerResponse, callback: () => T): T {
    const storage = getStorage(true)!;

    if (storage.getStore() !== undefined) {
        return callback();
    }

    return storage.run({response: response, trailers: []}, callback);
}

/**
 * Starts timing a call, returning the function that reports the elapsed time in the
 * Server-Timing of the current response, if any.
 *
 * @internal
 */
export function startTiming(description: string): (() => void) | undefined {
    if (useRuntimeConfig().croct.serverTiming !== true) {
        return undefined;
    }

    const scope = getStorage()?.getStore();

    if (scope === undefined) {
        return undefined;
    }

    const {response, trailers} = scope;

    const start = performance.now();

    return () => {
        if (response.writableEnded) {
            return;
        }

        const duration = (performance.now() - start).toFixed(1);
        // Descriptions may carry caller input, strip anything that could break out of the quoted string.
        const metric = `croct;desc="${description.replace(/[^\w@. -]/g, '')}";dur=${duration}`;

        if (response.headersSent) {
            // Ignored by Node.js unless the response is chunked, which is always
            // the case for streamed renders.
            trailers.push(metric);
            response.addTrailers({'Server-Timing': trailers.join(', ')});
        } else {
            response.appendHeader('Server-Timing', metric);
        }
    };
}
