import {describe, it, expect, afterEach, vi} from 'vitest';
import {useContent as useContentVue} from '@croct/plug-vue';
import {useRuntimeConfig, useNuxtApp} from '#app';
import {useContent} from '../../../src/runtime/csr/useContent';

vi.mock(
    '@croct/plug-vue',
    () => ({
        useContent: vi.fn(
            () => ({
                data: {value: undefined},
                metadata: {value: undefined},
                isLoading: {value: false},
                error: {value: null},
            }),
        ),
    }),
);

describe('CSR useContent', () => {
    const config = useRuntimeConfig();
    const originalLocale = config.public.croct.defaultPreferredLocale;

    afterEach(() => {
        vi.resetAllMocks();
        config.public.croct.defaultPreferredLocale = originalLocale;
    });

    it('should delegate to the Vue SDK useContent', () => {
        useContent('home-hero');

        expect(useContentVue).toHaveBeenCalledWith('home-hero', {});
    });

    it('should use the explicit preferred locale', () => {
        config.public.croct.defaultPreferredLocale = 'pt-BR';

        useContent('home-hero', {preferredLocale: 'en'});

        expect(useContentVue).toHaveBeenCalledWith(
            'home-hero',
            expect.objectContaining({preferredLocale: 'en'}),
        );
    });

    it('should fall back to the default locale from config', () => {
        config.public.croct.defaultPreferredLocale = 'fr';

        useContent('home-hero');

        expect(useContentVue).toHaveBeenCalledWith(
            'home-hero',
            expect.objectContaining({preferredLocale: 'fr'}),
        );
    });

    it('should not set locale when neither explicit nor default is provided', () => {
        config.public.croct.defaultPreferredLocale = '';

        useContent('home-hero');

        expect(useContentVue).toHaveBeenCalledWith('home-hero', {});
    });

    it('should resolve locale from @nuxtjs/i18n when available', () => {
        const nuxtApp = useNuxtApp();

        (nuxtApp as Record<string, unknown>).$i18n = {locale: {value: 'de'}};

        config.public.croct.defaultPreferredLocale = '';

        useContent('home-hero');

        expect(useContentVue).toHaveBeenCalledWith(
            'home-hero',
            expect.objectContaining({preferredLocale: 'de'}),
        );

        delete (nuxtApp as Record<string, unknown>).$i18n;
    });
});
