import type {App} from 'h3';
import {defineEventHandler} from 'h3';
import {useRuntimeConfig} from '#imports';
import {trackResponse} from '../utils/serverTiming';

type NitroApp = {
    h3App: App,
};

export default function (nitroApp: NitroApp): void {
    if (useRuntimeConfig().croct.serverTiming !== true) {
        return;
    }

    const originalHandler = nitroApp.h3App.handler;

    nitroApp.h3App.handler = defineEventHandler(
        event => trackResponse(event.node.res, () => originalHandler(event)),
    );
}
