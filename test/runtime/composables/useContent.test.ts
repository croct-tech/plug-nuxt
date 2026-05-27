import {describe, it, expect, afterEach, vi} from 'vitest';
import {registerEndpoint} from '@nuxt/test-utils/runtime';
import {readBody} from 'h3';
import type {H3Event} from 'h3';
import {useContent} from '../../../src/runtime/composables/useContent';

import {resolveLocale} from '../../../src/runtime/utils/locale';

vi.mock(
    '../../../src/runtime/utils/locale',
    () => ({
        resolveLocale: vi.fn(),
    }),
);

describe('useContent', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    type ContentResponse = {
        content: {
            headline: string,
        },
        metadata?: {
            version: string,
        },
    };

    it('should fetch content from the server', async () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: (): ContentResponse => ({
                content: {
                    headline: 'SSR Content',
                },
                metadata: {
                    version: '1.0',
                },
            }),
        });

        const {data} = await useContent('home-hero');

        expect(data.value.content.headline).toBe('SSR Content');
    });

    it('should include the resolved locale in the request', async () => {
        vi.mocked(resolveLocale).mockReturnValue('pt-br');

        let receivedLocale: string | undefined;

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: async (event: H3Event): Promise<ContentResponse> => {
                receivedLocale = (await readBody(event)).preferredLocale;

                return {
                    content: {headline: 'Localized'},
                };
            },
        });

        await useContent('home-hero');

        expect(receivedLocale).toBe('pt-br');
    });

    it('should not include a locale when none is resolved', async () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        let receivedLocale: string | undefined;

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: async (event: H3Event): Promise<ContentResponse> => {
                receivedLocale = (await readBody(event)).preferredLocale;

                return {
                    content: {headline: 'No Locale'},
                };
            },
        });

        await useContent('home-hero');

        expect(receivedLocale).toBeUndefined();
    });
});
