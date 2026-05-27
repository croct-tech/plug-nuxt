export default defineEventHandler(async event => {
    const {slotId = 'home-hero'} = getQuery<{slotId?: string}>(event);

    const result = await fetchContent(slotId);

    return {content: result.content};
})
