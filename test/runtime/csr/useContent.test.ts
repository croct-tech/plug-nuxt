import {describe, it, expect, afterEach, vi} from 'vitest';
import {useContent as useContentVue} from '@croct/plug-vue';
import {useContent} from '../../../src/runtime/csr/useContent';

import {resolveLocale} from '../../../src/runtime/utils/locale';

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

vi.mock(
    '../../../src/runtime/utils/locale',
    () => ({
        resolveLocale: vi.fn(),
    }),
);

describe('CSR useContent', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should delegate to the Vue SDK', () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        useContent('home-hero');

        expect(useContentVue).toHaveBeenCalledWith('home-hero', {});
    });

    it('should include the resolved locale in the request', () => {
        vi.mocked(resolveLocale).mockReturnValue('pt-br');

        useContent('home-hero');

        expect(useContentVue).toHaveBeenCalledWith(
            'home-hero',
            expect.objectContaining({preferredLocale: 'pt-br'}),
        );
    });

    it('should not include a locale when none is resolved', () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        useContent('home-hero');

        expect(useContentVue).toHaveBeenCalledWith('home-hero', {});
    });
});
