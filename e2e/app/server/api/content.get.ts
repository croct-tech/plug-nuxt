export default defineEventHandler(async () => {
    try {
        const result = await fetchContent('home-hero')

        return {content: result.content}
    } catch (error: any) {
        return {error: error.message}
    }
})
