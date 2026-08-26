<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useCroct} from '@croct/plug-nuxt/csr';

// The mock API echoes the identity of the caller
type Identity = {
    token: string | null,
    clientId: string | null,
};

// Evaluated and fetched through the internal routes, which the server resolves
const {data: evaluated} = await useEvaluation<Identity>('identity');
const {data: fetched} = await useContent<Identity>('identity-echo');

// Evaluated and fetched by the SDK running in the browser
const browserEvaluated = ref<Identity | null>(null);
const browserFetched = ref<Identity | null>(null);

onMounted(async () => {
    const croct = useCroct();

    browserEvaluated.value = await croct.evaluate<Identity>('identity');
    browserFetched.value = (await croct.fetch<Identity>('identity-echo')).content;
});
</script>

<template>
    <h1>Identity</h1>

    <section v-if="evaluated">
        <p data-testid="server-evaluation-token">{{ evaluated.token ?? 'none' }}</p>
        <p data-testid="server-evaluation-client-id">{{ evaluated.clientId ?? 'none' }}</p>
    </section>

    <section v-if="fetched">
        <p data-testid="server-fetch-token">{{ fetched.content.token ?? 'none' }}</p>
        <p data-testid="server-fetch-client-id">{{ fetched.content.clientId ?? 'none' }}</p>
    </section>

    <section v-if="browserEvaluated">
        <p data-testid="browser-evaluation-token">{{ browserEvaluated.token ?? 'none' }}</p>
    </section>

    <section v-if="browserFetched">
        <p data-testid="browser-fetch-token">{{ browserFetched.token ?? 'none' }}</p>
    </section>
</template>
