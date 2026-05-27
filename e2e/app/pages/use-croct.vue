<script setup lang="ts">
import {ref, onMounted} from 'vue';
import type {Plug} from '@croct/plug';

const initialized = ref(false);
const tracked = ref(false);

let plug: Plug;

onMounted(() => {
    plug = useCroct();
    initialized.value = plug.initialized;
});

async function handleTrack(): Promise<void> {
    await plug.track('goalCompleted', {goalId: 'playground-test'});
    tracked.value = true;
}
</script>

<template>
    <h1>useCroct</h1>

    <section>
        <h2>Plug instance</h2>
        <p>Initialized: <code data-testid="initialized">{{ initialized ? 'yes' : 'no' }}</code></p>
    </section>

    <section>
        <h2>Event tracking</h2>
        <button data-testid="track-button" @click="handleTrack">
            Track goal
        </button>
        <p data-testid="tracked">{{ tracked ? 'tracked' : 'not tracked' }}</p>
    </section>
</template>
