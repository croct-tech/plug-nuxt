<script setup lang="ts">
import {useContent} from '@croct/plug-nuxt/csr';

const {data, isLoading, error} = useContent('home-hero', {
    initial: {headline: 'Loading...'},
});
</script>

<template>
    <p>Loading: <code data-testid="loading">{{ isLoading }}</code></p>
    <p v-if="error" data-testid="error">{{ error.message }}</p>
    <p v-if="data" data-testid="headline">{{ data.headline }}</p>
</template>
