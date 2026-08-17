import type {PropType} from 'vue';
import {defineComponent} from 'vue';
import type {VersionedSlotId} from '@croct/plug/slot';
import type {JsonObject} from '@croct/plug/sdk/json';
import {useContent} from '../composables/useContent';

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
        const {data, error} = await useContent(props.id, {
            ...(props.fallback !== undefined ? {fallback: props.fallback} : {}),
            ...(props.preferredLocale !== undefined ? {preferredLocale: props.preferredLocale} : {}),
            ...(props.attributes !== undefined ? {context: {attributes: props.attributes}} : {}),
        });

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
