import type {PropType} from 'vue';
import {defineComponent} from 'vue';
import type {VersionedSlotId} from '@croct/plug/slot';
import type {JsonObject} from '@croct/plug/sdk/json';
import {useAsyncData, useRequestFetch} from '#app';
import {resolveLocale} from '../utils/locale';

export default defineComponent({
    name: 'Slot',
    props: {
        id: {
            type: String as PropType<VersionedSlotId>,
            required: true,
        },
        fallback: {
            type: [Object, String, Number, Boolean, null] as PropType<JsonObject>,
            default: undefined,
        },
        preferredLocale: {
            type: String,
            default: undefined,
        },
        attributes: {
            type: Object as PropType<JsonObject>,
            default: undefined,
        },
    },
    setup: async function (props, {slots}) {
        const locale = resolveLocale(props.preferredLocale);

        const options = {
            ...(props.fallback !== undefined ? {fallback: props.fallback} : {}),
            ...(locale !== undefined ? {preferredLocale: locale} : {}),
            ...(props.attributes !== undefined ? {attributes: props.attributes} : {}),
        };

        const {data, error} = await useAsyncData(
            `croct:slot:${props.id}:${JSON.stringify(options)}`,
            () => useRequestFetch()('/api/_croct/content', {
                method: 'POST',
                body: {slotId: props.id, ...options},
            }),
        );

        return () => {
            const response = data.value as {content?: unknown, metadata?: unknown} | null;

            if (response !== null && typeof response === 'object' && 'content' in response) {
                return slots.default?.({
                    content: response.content,
                    ...(response.metadata !== undefined ? {metadata: response.metadata} : {}),
                });
            }

            if (error.value !== null) {
                return slots.error?.({error: error.value});
            }

            return slots.loading?.();
        };
    },
});
