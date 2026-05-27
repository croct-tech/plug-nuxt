declare module '#croct/resolvers' {
    export const localeResolver: ((event: import('h3').H3Event) => Promise<string | null> | string | null) | undefined;
    export const userIdResolver: ((event: import('h3').H3Event) => Promise<string | null> | string | null) | undefined;
}

declare module '#croct/client-options' {
    export const urlSanitizer: ((url: string) => URL) | undefined;
}
