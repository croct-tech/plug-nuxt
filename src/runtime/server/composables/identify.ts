import {useEvent} from '#imports';
import {issueToken} from '../utils/security';
import {setUserTokenCookie} from '../utils/cookie';

export async function identify(userId: string): Promise<void> {
    const event = useEvent();

    setUserTokenCookie(event, await issueToken(userId, undefined, event));
}
