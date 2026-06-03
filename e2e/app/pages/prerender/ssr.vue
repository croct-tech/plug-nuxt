<script setup lang="ts">
// This page is excluded from prerendering (route rule `prerender: false`) and rendered
// on the server per request, so the personalized content is resolved server-side and is
// already present in the initial HTML.
const {data, error} = await useContent('home-hero');
</script>

<template>
    <p v-if="error" data-testid="error">{{ error.message }}</p>
    <p v-if="data" data-testid="headline">{{ data.content.headline }}</p>
</template>
