import {readBody} from 'h3';
import {fetchContent} from '../../composables/fetchContent';

export default defineEventHandler(async event => {
    const {slotId, ...options} = await readBody(event);

    return fetchContent(slotId, options);
});
