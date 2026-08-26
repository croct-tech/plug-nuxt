<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useCroct} from '@croct/plug-nuxt/csr';

// The mock API echoes the identity of the caller
type Identity = {
    token: string | null,
    clientId: string | null,
};

const {data: server} = await useEvaluation<Identity>('identity');

const browser = ref<Identity | null>(null);

onMounted(async () => {
    browser.value = await useCroct().evaluate<Identity>('identity');
});
</script>

<template>
    <h1>Identity</h1>

    <section v-if="server">
        <p data-testid="server-token">{{ server.token ?? 'none' }}</p>
        <p data-testid="server-client-id">{{ server.clientId ?? 'none' }}</p>
    </section>

    <section v-if="browser">
        <p data-testid="browser-token">{{ browser.token ?? 'none' }}</p>
        <p data-testid="browser-client-id">{{ browser.clientId ?? 'none' }}</p>
    </section>
</template>
