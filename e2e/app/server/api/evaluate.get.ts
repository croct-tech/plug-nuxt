export default defineEventHandler(async event => {
    const {query = 'now'} = getQuery<{query?: string}>(event);

    const result = await evaluate(query);

    return {result: result};
})
