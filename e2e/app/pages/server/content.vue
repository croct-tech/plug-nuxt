<script setup lang="ts">
const {data, error} = await useFetch('/api/content')
</script>

<template>
    <h1>Server fetchContent</h1>

    <section v-if="data">
        <div data-testid="result">
            <pre>{{ JSON.stringify(data, null, 2) }}</pre>
        </div>
    </section>

    <section v-if="error">
        <div data-testid="error">{{ error.message }}</div>
    </section>
</template>
