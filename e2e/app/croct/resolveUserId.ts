import {getCookie} from 'h3';
import type {UserIdResolver} from '@croct/plug-nuxt/types';

const resolveUserId: UserIdResolver = event => getCookie(event, 'app.session_user') ?? null;

export default resolveUserId;
