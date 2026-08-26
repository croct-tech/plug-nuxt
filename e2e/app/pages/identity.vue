<script setup lang="ts">
// The mock API echoes the identity of the caller
type Identity = {
    token: string | null,
    clientId: string | null,
};

const {data} = await useEvaluation<Identity>('identity');
</script>

<template>
    <h1>Identity</h1>

    <section v-if="data">
        <p data-testid="token">{{ data.token ?? 'none' }}</p>
        <p data-testid="client-id">{{ data.clientId ?? 'none' }}</p>
    </section>
</template>
