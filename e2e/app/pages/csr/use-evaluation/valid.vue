<script setup lang="ts">
import {useEvaluation} from '@croct/plug-nuxt/csr';

const {data, isLoading, error} = useEvaluation('now', {
    initial: 'loading...',
});
</script>

<template>
    <p>Loading: <code data-testid="loading">{{ isLoading }}</code></p>
    <p v-if="error" data-testid="error">{{ error.message }}</p>
    <p data-testid="result">{{ data }}</p>
</template>
