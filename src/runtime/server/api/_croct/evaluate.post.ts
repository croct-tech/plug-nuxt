import {defineEventHandler, readBody} from 'h3';
import {evaluate} from '../../composables/evaluate';

export default defineEventHandler(async event => {
    const {query, ...options} = await readBody(event);

    return evaluate(query, options);
});
