export default defineEventHandler(async () => {
    try {
        const result = await evaluate('now')

        return {result: result}
    } catch (error: any) {
        return {error: error.message}
    }
})
