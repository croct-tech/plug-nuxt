export default defineEventHandler(async event => {
    const {userId} = await readBody(event);

    await identify(userId);

    return {ok: true};
});
