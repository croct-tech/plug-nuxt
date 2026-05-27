import {useEvent} from '#imports';
import {issueToken} from '../utils/security';
import {setUserTokenCookie} from '../utils/cookie';

export async function anonymize(): Promise<void> {
    setUserTokenCookie(useEvent(), await issueToken());
}
