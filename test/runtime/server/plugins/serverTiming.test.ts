import {describe, it, expect, beforeAll, afterEach} from 'vitest';
import type {App} from 'h3';
import {createEvent, defineEventHandler} from 'h3';
import {IncomingMessage, ServerResponse} from 'node:http';
import {Socket} from 'node:net';
import {useRuntimeConfig} from '#imports';
import plugin from '../../../../src/runtime/server/plugins/serverTiming';
import {startTiming} from '../../../../src/runtime/server/utils/serverTiming';

describe('serverTiming plugin', () => {
    const storageKey = Symbol.for('@croct/plug-nuxt/server-timing');

    let config: ReturnType<typeof useRuntimeConfig>;
    let originalServerTiming: boolean;

    beforeAll(() => {
        config = useRuntimeConfig();
        originalServerTiming = config.croct.serverTiming;
    });

    afterEach(() => {
        config.croct.serverTiming = originalServerTiming;
        Reflect.deleteProperty(globalThis, storageKey);
    });

    function createMockEvent(): ReturnType<typeof createEvent> {
        const request = new IncomingMessage(new Socket());

        request.url = '/';

        return createEvent(request, new ServerResponse(request));
    }

    it('should not wrap the handler when serverTiming is disabled', () => {
        config.croct.serverTiming = false;

        const originalHandler = defineEventHandler(() => 'ok');
        const nitroApp = {h3App: {handler: originalHandler} as unknown as App};

        plugin(nitroApp);

        expect(nitroApp.h3App.handler).toBe(originalHandler);
        expect(Reflect.has(globalThis, storageKey)).toBe(false);
    });

    it('should track responses through h3App.handler when serverTiming is enabled', async () => {
        config.croct.serverTiming = true;

        const originalHandler = defineEventHandler(async () => {
            await Promise.resolve().finally(startTiming('Croct fetch home-hero@1'));

            return 'ok';
        });

        const nitroApp = {h3App: {handler: originalHandler} as unknown as App};

        plugin(nitroApp);

        const event = createMockEvent();

        await expect(nitroApp.h3App.handler(event)).resolves.toBe('ok');

        expect(event.node.res.getHeader('server-timing')).toMatch(
            /^croct;desc="Croct fetch home-hero@1";dur=\d+\.\d$/,
        );
    });

    it('should report nested subrequest timings on the outer response', async () => {
        config.croct.serverTiming = true;

        const innerEvent = createMockEvent();
        const outerEvent = createMockEvent();

        const nitroApp: {h3App: App} = {
            h3App: {
                handler: defineEventHandler(async (event): Promise<unknown> => {
                    if (event === outerEvent) {
                        return nitroApp.h3App.handler(innerEvent);
                    }

                    await Promise.resolve().finally(startTiming('Croct evaluate'));

                    return 'inner';
                }),
            } as unknown as App,
        };

        plugin(nitroApp);

        await expect(nitroApp.h3App.handler(outerEvent)).resolves.toBe('inner');

        expect(outerEvent.node.res.getHeader('server-timing')).toMatch(
            /^croct;desc="Croct evaluate";dur=\d+\.\d$/,
        );
        expect(innerEvent.node.res.getHeader('server-timing')).toBeUndefined();
    });
});
