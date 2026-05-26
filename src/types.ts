export type CroctCookieOptions = {
    name?: string,
    domain?: string,
    duration?: number,
};

export type CroctModuleOptions = {
    appId?: string,
    debug?: boolean,
    test?: boolean,
    defaultPreferredLocale?: string,
    defaultFetchTimeout?: number,
    baseEndpointUrl?: string,
    cookie?: {
        clientId?: CroctCookieOptions,
        userToken?: CroctCookieOptions,
        previewToken?: Omit<CroctCookieOptions, 'duration'>,
    },
    disableUserTokenAuthentication?: boolean,
    tokenDuration?: number,
};

export type CroctPublicConfig = {
    appId: string,
    debug: boolean,
    test: boolean,
    defaultPreferredLocale: string,
    defaultFetchTimeout: number | undefined,
    baseEndpointUrl: string | undefined,
    cookie: {
        clientId: Required<CroctCookieOptions>,
        userToken: Required<CroctCookieOptions>,
        previewToken: Required<Omit<CroctCookieOptions, 'duration'>>,
    },
};

export type CroctPrivateConfig = {
    apiKey: string,
    disableUserTokenAuthentication: boolean,
    tokenDuration: number,
};

export type CroctRequestContext = {
    clientId: string,
    userToken: string,
    uri: string,
    clientIp?: string,
    clientAgent?: string,
    referrer?: string,
    preferredLocale?: string,
    previewToken?: string,
};

declare module 'nuxt/schema' {
    interface PublicRuntimeConfig {
        croct: CroctPublicConfig;
    }

    interface RuntimeConfig {
        croct: CroctPrivateConfig;
    }
}

declare module 'nuxt/schema' {
    interface NuxtConfig {
        croct?: CroctModuleOptions;
    }

    interface NuxtOptions {
        croct?: CroctModuleOptions;
    }
}

declare module 'h3' {
    interface H3EventContext {
        croct?: CroctRequestContext;
    }
}

export {};
