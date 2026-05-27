<script setup lang="ts">
import {Personalization} from '@croct/plug-nuxt/csr';
</script>

<template>
    <Personalization query="now" initial="Initial Value">
        <template #default="{result}">
            <p data-testid="result">{{ result }}</p>
        </template>
        <template #loading>
            <p data-testid="loading">Loading...</p>
        </template>
        <template #error="{error}">
            <p data-testid="error">{{ error.message }}</p>
        </template>
    </Personalization>
</template>
