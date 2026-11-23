import {describe, it, expect, beforeAll, afterEach} from 'vitest';
import type {IncomingMessage} from 'node:http';
import {createServer, get} from 'node:http';
import type {AddressInfo} from 'node:net';
import {useRuntimeConfig} from '#imports';
import {startTiming, trackResponse} from '../../../../src/runtime/server/utils/serverTiming';

describe('serverTiming', () => {
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

    it('should not time calls when disabled', () => {
        config.croct.serverTiming = false;

        expect(startTiming('Croct evaluate')).toBeUndefined();
        expect(Reflect.has(globalThis, storageKey)).toBe(false);
    });

    it('should not time calls when no response is tracked', () => {
        config.croct.serverTiming = true;

        expect(startTiming('Croct evaluate')).toBeUndefined();
    });

    it('should report timings as headers until the response starts and as trailers afterwards', async () => {
        config.croct.serverTiming = true;

        const server = createServer(async (_, response) => {
            await trackResponse(response, async () => {
                await Promise.resolve().finally(startTiming('Croct fetch home-hero@1'));

                response.write('shell');

                await Promise.reject(new Error('timeout'))
                    .finally(startTiming('Croct "evaluate",\r\n'))
                    .catch(() => {});

                await Promise.resolve().finally(startTiming('Croct fetch home-banner@2'));

                response.end();
            });
        });

        await new Promise<void>(resolve => {
            server.listen(0, '127.0.0.1', resolve);
        });

        const response = await new Promise<IncomingMessage>((resolve, reject) => {
            get({port: (server.address() as AddressInfo).port, host: '127.0.0.1', agent: false}, message => {
                message.resume().on('end', () => resolve(message));
            }).on('error', reject);
        });

        server.close();

        expect(response.headers['server-timing']).toMatch(/^croct;desc="Croct fetch home-hero@1";dur=\d+\.\d$/);
        expect(response.trailers['server-timing']).toMatch(
            /^croct;desc="Croct evaluate";dur=\d+\.\d, croct;desc="Croct fetch home-banner@2";dur=\d+\.\d$/,
        );
    });

    it('should inherit the outer response on nested calls', async () => {
        config.croct.serverTiming = true;

        const server = createServer(async (_, outerResponse) => {
            const innerResponse = {
                headersSent: false,
                writableEnded: false,
                appendHeader: () => {
                    throw new Error('Inner response should not receive timings');
                },
                addTrailers: () => {
                    throw new Error('Inner response should not receive timings');
                },
            } as unknown as typeof outerResponse;

            await trackResponse(outerResponse, async () => {
                await trackResponse(innerResponse, async () => {
                    await Promise.resolve().finally(startTiming('Croct fetch home-hero@1'));
                });

                outerResponse.end('ok');
            });
        });

        await new Promise<void>(resolve => {
            server.listen(0, '127.0.0.1', resolve);
        });

        const response = await new Promise<IncomingMessage>((resolve, reject) => {
            get({port: (server.address() as AddressInfo).port, host: '127.0.0.1', agent: false}, message => {
                message.resume().on('end', () => resolve(message));
            }).on('error', reject);
        });

        server.close();

        expect(response.headers['server-timing']).toMatch(/^croct;desc="Croct fetch home-hero@1";dur=\d+\.\d$/);
    });

    it('should isolate timings across concurrent requests', async () => {
        config.croct.serverTiming = true;

        const server = createServer(async (request, response) => {
            const slot = request.url?.slice(1) ?? 'unknown';

            await trackResponse(response, async () => {
                await new Promise(resolve => {
                    setTimeout(resolve, slot === 'slot-a' ? 20 : 5);
                }).finally(startTiming(`Croct fetch ${slot}`));

                response.end(slot);
            });
        });

        await new Promise<void>(resolve => {
            server.listen(0, '127.0.0.1', resolve);
        });

        const {port} = server.address() as AddressInfo;

        const fetchSlot = (slot: string): Promise<IncomingMessage> => new Promise((resolve, reject) => {
            get({port: port, host: '127.0.0.1', path: `/${slot}`, agent: false}, message => {
                message.resume().on('end', () => resolve(message));
            }).on('error', reject);
        });

        const [responseA, responseB] = await Promise.all([
            fetchSlot('slot-a'),
            fetchSlot('slot-b'),
        ]);

        server.close();

        expect(responseA.headers['server-timing']).toMatch(/^croct;desc="Croct fetch slot-a";dur=\d+\.\d$/);
        expect(responseB.headers['server-timing']).toMatch(/^croct;desc="Croct fetch slot-b";dur=\d+\.\d$/);
    });

    it('should ignore timings that complete after the response has ended', async () => {
        config.croct.serverTiming = true;

        let stopLateTiming: (() => void) | undefined;

        const server = createServer((_, response) => {
            trackResponse(response, () => {
                stopLateTiming = startTiming('Croct evaluate');
                response.end('done');
            });
        });

        await new Promise<void>(resolve => {
            server.listen(0, '127.0.0.1', resolve);
        });

        const response = await new Promise<IncomingMessage>((resolve, reject) => {
            get({port: (server.address() as AddressInfo).port, host: '127.0.0.1', agent: false}, message => {
                message.resume().on('end', () => resolve(message));
            }).on('error', reject);
        });

        server.close();

        expect(() => stopLateTiming?.()).not.toThrow();
        expect(response.headers['server-timing']).toBeUndefined();
    });
});
