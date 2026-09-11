import type {Page} from '@playwright/test';

// Nuxt exposes useNuxtApp on the window in the browser, but only Nuxt 4 ships
// the ambient declaration for it, so it is typed locally to keep the helper
// working across both major versions.
type NuxtWindow = {
    useNuxtApp?: () => {isHydrating: boolean},
};

/**
 * Waits until the Nuxt app has hydrated.
 *
 * NuxtLink only intercepts clicks once the app is hydrated. Clicking earlier
 * performs a full document navigation, so the page is rendered on the server
 * and the specs end up asserting the server context instead of the browser one.
 */
export function waitForHydration(page: Page): Promise<unknown> {
    return page.waitForFunction(
        () => (window as unknown as NuxtWindow).useNuxtApp?.().isHydrating === false,
    );
}
