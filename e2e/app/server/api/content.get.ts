export default defineEventHandler(async event => {
    const {slotId = 'home-hero', locale} = getQuery<{slotId?: string, locale?: string}>(event);

    const result = await fetchContent(slotId, {
        ...(locale !== undefined ? {preferredLocale: locale} : {}),
    });

    return {content: result.content};
})
