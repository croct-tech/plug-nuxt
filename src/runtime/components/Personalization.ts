import type {PropType} from 'vue';
import {defineComponent} from 'vue';
import type {JsonObject} from '@croct/plug/sdk/json';
import {useEvaluation} from '../composables/useEvaluation';

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
        const {data, pending, error} = await useEvaluation(props.query, {
            ...(props.fallback !== undefined ? {fallback: props.fallback} : {}),
            ...(props.timeout !== undefined ? {timeout: props.timeout} : {}),
            ...(props.attributes !== undefined ? {context: {attributes: props.attributes}} : {}),
        });

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
