import {describe, it, expect, afterEach, vi} from 'vitest';
import {useRuntimeConfig} from '#app';

import {resolveLocale} from '../../../src/runtime/utils/locale';

let mockI18nLocale: string | undefined;

vi.mock('#app', async () => {
    const actual: Record<string, unknown> = await vi.importActual('#app');

    return {
        ...actual,
        useNuxtApp: () => ({
            ...(actual.useNuxtApp as () => object)(),
            get $i18n() {
                return mockI18nLocale !== undefined
                    ? {locale: {value: mockI18nLocale}}
                    : undefined;
            },
        }),
    };
});

describe('resolveLocale', () => {
    const config = useRuntimeConfig();
    const originalLocale = config.public.croct.defaultPreferredLocale;

    afterEach(() => {
        config.public.croct.defaultPreferredLocale = originalLocale;
        mockI18nLocale = undefined;
    });

    it('should return the explicit locale', () => {
        expect(resolveLocale('en')).toBe('en');
    });

    it('should ignore an empty explicit locale', () => {
        config.public.croct.defaultPreferredLocale = 'fr';

        expect(resolveLocale('')).toBe('fr');
    });

    it('should fall back to the configured default locale', () => {
        config.public.croct.defaultPreferredLocale = 'fr';

        expect(resolveLocale()).toBe('fr');
    });

    it('should prefer the explicit locale over the configured default', () => {
        config.public.croct.defaultPreferredLocale = 'fr';

        expect(resolveLocale('en')).toBe('en');
    });

    it('should prefer the configured default locale over the i18n locale', () => {
        config.public.croct.defaultPreferredLocale = 'fr';
        mockI18nLocale = 'de';

        expect(resolveLocale()).toBe('fr');
    });

    it('should fall back to the i18n locale when no configured default exists', () => {
        config.public.croct.defaultPreferredLocale = '';
        mockI18nLocale = 'de';

        expect(resolveLocale()).toBe('de');
    });

    it('should return undefined when no locale source is available', () => {
        config.public.croct.defaultPreferredLocale = '';

        expect(resolveLocale()).toBeUndefined();
    });
});
