<template>
    <Slot id="invalid-slot-id" :fallback="{headline: 'Fallback Headline'}">
        <template #default="{content}">
            <p data-testid="headline">{{ content.headline }}</p>
        </template>
        <template #loading>
            <p data-testid="loading">Loading...</p>
        </template>
        <template #error="{error}">
            <p data-testid="error">{{ error.message }}</p>
        </template>
    </Slot>
</template>
