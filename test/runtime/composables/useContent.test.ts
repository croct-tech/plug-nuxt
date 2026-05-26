import {describe, it, expect, afterEach} from 'vitest';
import {registerEndpoint} from '@nuxt/test-utils/runtime';
import {readBody} from 'h3';
import type {H3Event} from 'h3';
import {useRuntimeConfig} from '#app';
import {useContent} from '../../../src/runtime/composables/useContent';

describe('useContent', () => {
    const config = useRuntimeConfig();
    const originalLocale = config.public.croct.defaultPreferredLocale;

    afterEach(() => {
        config.public.croct.defaultPreferredLocale = originalLocale;
    });

    type ContentResponse = {
        content: {
            headline: string,
        },
        metadata?: {
            version: string,
        },
    };

    it('should fetch content via the internal API route', async () => {
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

    it('should use the explicit preferred locale over the default', async () => {
        config.public.croct.defaultPreferredLocale = 'pt-BR';

        let receivedLocale: string | undefined;

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: async (event: H3Event): Promise<ContentResponse> => {
                receivedLocale = (await readBody(event)).preferredLocale;

                return {
                    content: {
                        headline: 'Localized',
                    },
                };
            },
        });

        await useContent('home-hero', {
            preferredLocale: 'en',
        });

        expect(receivedLocale).toBe('en');
    });

    it('should fall back to the default locale from config', async () => {
        config.public.croct.defaultPreferredLocale = 'pt-BR';

        let receivedLocale: string | undefined;

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: async (event: H3Event): Promise<ContentResponse> => {
                receivedLocale = (await readBody(event)).preferredLocale;

                return {
                    content: {
                        headline: 'Default Locale',
                    },
                };
            },
        });

        await useContent('home-hero');

        expect(receivedLocale).toBe('pt-BR');
    });

    it('should not set preferred locale when neither explicit nor default is provided', async () => {
        config.public.croct.defaultPreferredLocale = '';

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
