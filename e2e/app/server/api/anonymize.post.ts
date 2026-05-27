export default defineEventHandler(async () => {
    await anonymize();

    return {ok: true};
});
