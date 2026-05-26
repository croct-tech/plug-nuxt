<template>
    <Personalization query="invalid cql !!!">
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
