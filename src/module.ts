import {join} from 'path';
import {
    defineNuxtModule,
    addPlugin,
    addServerHandler,
    addImportsDir,
    addServerImportsDir,
    addTemplate,
    createResolver,
} from '@nuxt/kit';
import type {CroctModuleOptions} from './types';

const DEFAULT_CLIENT_ID_COOKIE_DURATION = 365 * 24 * 60 * 60;
const DEFAULT_USER_TOKEN_COOKIE_DURATION = 7 * 24 * 60 * 60;
const DEFAULT_TOKEN_DURATION = 24 * 60 * 60;

export default defineNuxtModule<CroctModuleOptions>({
    meta: {
        name: '@croct/plug-nuxt',
        configKey: 'croct',
        compatibility: {
            nuxt: '>=3.0.0',
        },
    },
    defaults: {
        debug: false,
        test: false,
        defaultPreferredLocale: '',
        disableUserTokenAuthentication: false,
        tokenDuration: DEFAULT_TOKEN_DURATION,
    },
    setup: function (options, nuxt) {
        const resolver = createResolver(import.meta.url);

        const cookieConfig = {
            clientId: {
                name: options.cookie?.clientId?.name ?? 'ct.client_id',
                domain: options.cookie?.clientId?.domain ?? '',
                duration: options.cookie?.clientId?.duration ?? DEFAULT_CLIENT_ID_COOKIE_DURATION,
            },
            userToken: {
                name: options.cookie?.userToken?.name ?? 'ct.user_token',
                domain: options.cookie?.userToken?.domain ?? '',
                duration: options.cookie?.userToken?.duration ?? DEFAULT_USER_TOKEN_COOKIE_DURATION,
            },
            previewToken: {
                name: options.cookie?.previewToken?.name ?? 'ct.preview_token',
                domain: options.cookie?.previewToken?.domain ?? '',
            },
        };

        nuxt.options.runtimeConfig.public.croct = {
            appId: options.appId ?? '',
            debug: options.debug ?? false,
            test: options.test ?? false,
            defaultPreferredLocale: options.defaultPreferredLocale ?? '',
            defaultFetchTimeout: options.defaultFetchTimeout,
            baseEndpointUrl: options.baseEndpointUrl,
            cookie: cookieConfig,
        };

        nuxt.options.runtimeConfig.croct = {
            apiKey: '',
            disableUserTokenAuthentication: options.disableUserTokenAuthentication ?? false,
            tokenDuration: options.tokenDuration ?? DEFAULT_TOKEN_DURATION,
        };

        const appResolver = createResolver(nuxt.options.rootDir);
        const resolversCode = generateResolversModule(options, appResolver);

        addTemplate({
            filename: 'croct/resolvers.ts',
            write: true,
            getContents: () => resolversCode,
        });

        const nitroOptions = (nuxt.options as unknown as {nitro: {alias: Record<string, string>}}).nitro;

        nitroOptions.alias = nitroOptions.alias ?? {};
        nitroOptions.alias['#croct/resolvers'] = join(nuxt.options.buildDir, 'croct/resolvers');

        const clientOptionsCode = generateClientOptionsModule(options, appResolver);

        addTemplate({
            filename: 'croct/client-options.ts',
            write: true,
            getContents: () => clientOptionsCode,
        });

        nuxt.options.alias['#croct/client-options'] = join(nuxt.options.buildDir, 'croct/client-options');

        addPlugin(resolver.resolve('./runtime/plugin.client'));

        addServerHandler({
            handler: resolver.resolve('./runtime/server/middleware/croct'),
            middleware: true,
        });

        addImportsDir(resolver.resolve('./runtime/composables'));

        addServerImportsDir(resolver.resolve('./runtime/server/composables'));

        addServerHandler({
            route: '/api/_croct/content',
            method: 'post',
            handler: resolver.resolve('./runtime/server/api/_croct/content.post'),
        });

        addServerHandler({
            route: '/api/_croct/evaluate',
            method: 'post',
            handler: resolver.resolve('./runtime/server/api/_croct/evaluate.post'),
        });

        nuxt.hook('components:dirs', dirs => {
            dirs.push({
                path: resolver.resolve('./runtime/components'),
                prefix: '',
            });
        });

        nuxt.options
            .build
            .transpile
            .push('@croct/plug-vue', '@croct/sdk', '@croct/plug');

        nuxt.options.vite = nuxt.options.vite ?? {};
        nuxt.options.vite.ssr = nuxt.options.vite.ssr ?? {};
        nuxt.options.vite.ssr.noExternal = nuxt.options.vite.ssr.noExternal ?? [];

        if (Array.isArray(nuxt.options.vite.ssr.noExternal)) {
            nuxt.options
                .vite
                .ssr
                .noExternal
                .push('@croct/plug-vue');
        }

        nuxt.options.experimental.asyncContext = true;
    },
});

function generateResolversModule(
    options: CroctModuleOptions,
    appResolver: ReturnType<typeof createResolver>,
): string {
    const lines: string[] = [];

    if (options.localeResolver !== undefined) {
        lines.push(`export { default as localeResolver } from '${appResolver.resolve(options.localeResolver)}';`);
    } else {
        lines.push('export const localeResolver = undefined;');
    }

    if (options.userIdResolver !== undefined) {
        lines.push(`export { default as userIdResolver } from '${appResolver.resolve(options.userIdResolver)}';`);
    } else {
        lines.push('export const userIdResolver = undefined;');
    }

    return lines.join('\n');
}

function generateClientOptionsModule(
    options: CroctModuleOptions,
    appResolver: ReturnType<typeof createResolver>,
): string {
    const lines: string[] = [];

    if (options.urlSanitizer !== undefined) {
        lines.push(`export { default as urlSanitizer } from '${appResolver.resolve(options.urlSanitizer)}';`);
    } else {
        lines.push('export const urlSanitizer = undefined;');
    }

    return lines.join('\n');
}
