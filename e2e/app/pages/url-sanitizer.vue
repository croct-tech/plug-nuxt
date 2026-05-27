<script setup lang="ts">
import {ref, onMounted} from 'vue';
import type {Plug} from '@croct/plug';

const sanitizedUrl = ref('pending');

let plug: Plug;

onMounted(() => {
    plug = useCroct();

    plug.tracker.addListener(event => {
        sanitizedUrl.value = event.context.url;
    });

    plug.track('goalCompleted', {goalId: 'sanitizer-test'});
});
</script>

<template>
    <p data-testid="sanitized-url">{{ sanitizedUrl }}</p>
</template>
