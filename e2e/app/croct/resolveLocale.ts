import {getHeader} from 'h3';
import type {LocaleResolver} from '@croct/plug-nuxt/types';

const SUPPORTED_LOCALES = ['en', 'pt-br'];

const resolveLocale: LocaleResolver = event => {
    const acceptLanguage = getHeader(event, 'accept-language');

    if (acceptLanguage === undefined) {
        return null;
    }

    const preferred = acceptLanguage
        .split(',')
        .map(entry => entry.split(';')[0].trim().toLowerCase())
        .find(locale => SUPPORTED_LOCALES.includes(locale));

    return preferred ?? null;
};

export default resolveLocale;
