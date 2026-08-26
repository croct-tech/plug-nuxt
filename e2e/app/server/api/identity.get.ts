export default defineEventHandler(async () => {
    // Evaluated and fetched through the server composables, outside a page render
    const [evaluated, fetched] = await Promise.all([
        evaluate('identity'),
        fetchContent('identity-echo'),
    ]);

    return {
        evaluated: evaluated,
        fetched: fetched.content,
    };
})
