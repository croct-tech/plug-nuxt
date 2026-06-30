<script setup lang="ts">
import {ref, onMounted} from 'vue';

// Called at the top of setup, so it runs during SSR. With the universal plugin
// this must not throw; the plug's methods stay client-only.
const croct = useCroct();

const initialized = ref(false);
const tracked = ref(false);

onMounted(() => {
    initialized.value = croct.initialized;
});

async function handleTrack(): Promise<void> {
    await croct.track('goalCompleted', {goalId: 'playground-test'});
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
