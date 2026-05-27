import type {PropType} from 'vue';
import {defineComponent} from 'vue';
import type {JsonObject} from '@croct/plug/sdk/json';
import {useAsyncData} from '#app';

export default defineComponent({
    name: 'Personalization',
    props: {
        query: {
            type: String,
            required: true,
        },
        fallback: {
            type: [Object, String, Number, Boolean, null] as PropType<unknown>,
            default: undefined,
        },
        timeout: {
            type: Number,
            default: undefined,
        },
        attributes: {
            type: Object as PropType<JsonObject>,
            default: undefined,
        },
    },
    setup: async function (props, {slots}) {
        const options = {
            ...(props.fallback !== undefined ? {fallback: props.fallback} : {}),
            ...(props.timeout !== undefined ? {timeout: props.timeout} : {}),
            ...(props.attributes !== undefined ? {attributes: props.attributes} : {}),
        };

        const {data, pending, error} = await useAsyncData(
            `croct:pers:${props.query}:${JSON.stringify(options)}`,
            () => $fetch('/api/_croct/evaluate', {
                method: 'POST',
                body: {query: props.query, ...options},
            }),
        );

        return () => {
            if (error.value !== null) {
                return slots.error?.({error: error.value});
            }

            if (pending.value) {
                return slots.loading?.();
            }

            return slots.default?.({result: data.value});
        };
    },
});
