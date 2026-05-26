<script setup lang="ts">
import {SlotContent} from '@croct/plug-nuxt/csr';
</script>

<template>
    <SlotContent id="home-hero" :initial="{headline: 'Initial Hero'}">
        <template #default="{content}">
            <p data-testid="headline">{{ content.headline }}</p>
        </template>
        <template #loading>
            <p data-testid="loading">Loading...</p>
        </template>
        <template #error="{error}">
            <p data-testid="error">{{ error.message }}</p>
        </template>
    </SlotContent>
</template>
