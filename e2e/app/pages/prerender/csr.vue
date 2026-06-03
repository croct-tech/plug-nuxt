<script setup lang="ts">
// This page stays in the prerendered set (route rule `prerender: true`). The static
// HTML is generated at build time with the `initial` content, and the personalized
// content is fetched on the client after hydration via the CSR composables.
import {useContent} from '@croct/plug-nuxt/csr';

const {data} = useContent('home-hero', {
    initial: {headline: 'Initial Hero'},
});
</script>

<template>
    <p data-testid="headline">{{ data.headline }}</p>
</template>
