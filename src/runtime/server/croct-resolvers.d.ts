import type {H3Event} from 'h3';

export type UserIdResolver = (event: H3Event) => Promise<string | null> | string | null;
export type LocaleResolver = (event: H3Event) => Promise<string | null> | string | null;
