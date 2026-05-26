<script setup lang="ts">
const {data, error} = await useEvaluation('invalid cql !!!');
</script>

<template>
    <p v-if="error" data-testid="error">{{ error.message }}</p>
    <p data-testid="result">{{ data }}</p>
</template>
