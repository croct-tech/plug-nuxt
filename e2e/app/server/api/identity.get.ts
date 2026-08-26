export default defineEventHandler(async () => {
    // Evaluated through the server composable, outside a page render
    const result = await evaluate('identity');

    return {result: result};
})
