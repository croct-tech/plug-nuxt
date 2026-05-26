import {describe, it, expect} from 'vitest';
import {mountSuspended, registerEndpoint} from '@nuxt/test-utils/runtime';
import SlotContent from './SlotContent';

describe('SlotContent', () => {
    type SlotResponse = {
        content: {
            headline: string,
        },
        metadata?: {
            version: string,
        },
    };

    it('should render content from the API', async () => {
        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: (): SlotResponse => ({
                content: {
                    headline: 'Test Headline',
                },
            }),
        });

        const component = await mountSuspended(SlotContent, {
            props: {
                id: 'home-hero',
            },
            slots: {
                default: (props: SlotResponse) => props.content.headline,
            },
        });

        expect(component.text()).toContain('Test Headline');
    });

    it('should pass metadata to the default slot when available', async () => {
        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: (): SlotResponse => ({
                content: {
                    headline: 'Hello',
                },
                metadata: {
                    version: '2.0',
                },
            }),
        });

        const component = await mountSuspended(SlotContent, {
            props: {
                id: 'home-hero',
            },
            slots: {
                default: (props: SlotResponse) => (
                    `${props.content.headline} v${props.metadata?.version ?? 'none'}`
                ),
            },
        });

        expect(component.text()).toContain('Hello v2.0');
    });

    it('should render the Vue error slot on failure', async () => {
        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: () => createError({
                statusCode: 500,
                statusMessage: 'Fetch failed',
            }),
        });

        const component = await mountSuspended(SlotContent, {
            props: {
                id: 'invalid-slot',
            },
            slots: {
                error: () => 'Something went wrong',
            },
        });

        expect(component.text()).toContain('Something went wrong');
    });

    it('should render the loading slot when the response has no content', async () => {
        registerEndpoint('/api/_croct/content', {
            method: 'POST',
            handler: (): string => 'not-an-object',
        });

        const component = await mountSuspended(SlotContent, {
            props: {
                id: 'home-hero',
            },
            slots: {
                loading: () => 'Loading content...',
            },
        });

        expect(component.text()).toContain('Loading content...');
    });
});
