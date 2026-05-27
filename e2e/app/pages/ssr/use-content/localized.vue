<script setup lang="ts">
const {data, error} = await useContent('home-hero', {preferredLocale: 'pt-br'});
</script>

<template>
    <p v-if="error" data-testid="error">{{ error.message }}</p>
    <div v-if="data" data-testid="content">
        <p data-testid="headline">{{ data.content.headline }}</p>
    </div>
</template>
