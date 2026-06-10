<script setup lang="ts">
import {onMounted} from 'vue';

// Trigger a client-side fetch so the e2e can assert the app ID the browser plug
// sends (the X-App-Id header) matches the per-tenant resolved credentials.
onMounted(() => {
    void useCroct().fetch('home-hero');
});
</script>

<template>
    <p data-testid="tenant">ready</p>
</template>
