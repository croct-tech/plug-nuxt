import {describe, it, expect, afterEach, vi} from 'vitest';
import {mountSuspended, registerEndpoint} from '@nuxt/test-utils/runtime';
import {readBody} from 'h3';
import type {H3Event} from 'h3';
import Slot from '../../../src/runtime/components/Slot';

import {resolveLocale} from '../../../src/runtime/utils/locale';

vi.mock(
    '../../../src/runtime/utils/locale',
    () => ({
        resolveLocale: vi.fn(),
    }),
);

describe('Slot', () => {
    type SlotResponse = {
        content: {
            headline: string,
        },
        metadata?: {
            version: string,
        },
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should render the content from the server', async () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: (): SlotResponse => ({
                content: {headline: 'Test Headline'},
            }),
        });

        const component = await mountSuspended(Slot, {
            props: {id: 'home-hero'},
            slots: {
                default: (props: SlotResponse) => props.content.headline,
            },
        });

        expect(component.text()).toContain('Test Headline');
    });

    it('should provide content metadata to the default slot', async () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: (): SlotResponse => ({
                content: {headline: 'Hello'},
                metadata: {version: '2.0'},
            }),
        });

        const component = await mountSuspended(Slot, {
            props: {id: 'home-hero'},
            slots: {
                default: (props: SlotResponse) => (
                    `${props.content.headline} v${props.metadata?.version ?? 'none'}`
                ),
            },
        });

        expect(component.text()).toContain('Hello v2.0');
    });

    it('should render the error slot on failure', async () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: () => createError({
                statusCode: 500,
                statusMessage: 'Fetch failed',
            }),
        });

        const component = await mountSuspended(Slot, {
            props: {id: 'invalid-slot'},
            slots: {
                error: () => 'Something went wrong',
            },
        });

        expect(component.text()).toContain('Something went wrong');
    });

    it('should render the loading slot when content is not available', async () => {
        vi.mocked(resolveLocale).mockReturnValue(undefined);

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: (): string => 'not-an-object',
        });

        const component = await mountSuspended(Slot, {
            props: {id: 'home-hero'},
            slots: {
                loading: () => 'Loading content...',
            },
        });

        expect(component.text()).toContain('Loading content...');
    });

    it('should include the resolved locale in the request', async () => {
        vi.mocked(resolveLocale).mockReturnValue('pt-br');

        let receivedLocale: string | undefined;

        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: async (event: H3Event): Promise<SlotResponse> => {
                receivedLocale = (await readBody(event)).preferredLocale;

                return {content: {headline: 'Localized'}};
            },
        });

        await mountSuspended(Slot, {
            props: {id: 'home-hero'},
            slots: {
                default: (props: SlotResponse) => props.content.headline,
            },
        });

        expect(receivedLocale).toBe('pt-br');
    });
});
