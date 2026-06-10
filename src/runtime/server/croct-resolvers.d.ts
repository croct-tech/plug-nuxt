import type {H3Event} from 'h3';

export type CroctCredentials = {
    appId: string,
    apiKey: string,
};

export type UserIdResolver = (event: H3Event) => Promise<string | null> | string | null;
export type LocaleResolver = (event: H3Event) => Promise<string | null> | string | null;
export type CredentialsResolver = (event: H3Event) =>
    Promise<CroctCredentials | null> | CroctCredentials | null;
