<script setup lang="ts">
// The mock API echoes the context it receives, so the page renders the context
// the evaluation and the fetch were based on.
type EchoedPage = {
    url: string,
    title: string,
    referrer: string,
};

type EchoedContext = {
    page: EchoedPage,
    timeZone: string,
    attributes: {
        plan: string,
    },
};

useHead({title: 'Page context'});

const {data: evaluated, refresh} = await useEvaluation<EchoedContext>('context', {
    context: {
        attributes: {plan: 'pro'},
    },
});

const {data: fetched} = await useContent<EchoedPage>('context-echo');
</script>

<template>
    <h1>Page context</h1>

    <button data-testid="refresh" type="button" @click="refresh()">
        Refresh
    </button>

    <section v-if="evaluated">
        <p data-testid="evaluation-url">{{ evaluated.page.url }}</p>
        <p data-testid="evaluation-title">{{ evaluated.page.title ?? 'none' }}</p>
        <p data-testid="evaluation-referrer">{{ evaluated.page.referrer ?? 'none' }}</p>
        <p data-testid="evaluation-time-zone">{{ evaluated.timeZone ?? 'none' }}</p>
        <p data-testid="evaluation-attributes">{{ evaluated.attributes.plan }}</p>
    </section>

    <section v-if="fetched">
        <p data-testid="content-url">{{ fetched.content.url }}</p>
    </section>
</template>
