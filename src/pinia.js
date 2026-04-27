/**
 * @altrudevelop/dweav-connect/pinia
 *
 * Pinia plugin for Dweav Trace.
 * Installs as a global Pinia plugin — automatically traces ALL stores
 * in your app with a single line of setup code.
 *
 * Compatible with Pinia 2+, Nuxt 3 (client-side).
 *
 * Usage (traces ALL stores automatically):
 *   import { createApp }  from 'vue';
 *   import { createPinia } from 'pinia';
 *   import { DweavPiniaPlugin } from '@altrudevelop/dweav-connect/pinia';
 *
 *   const pinia = createPinia();
 *   pinia.use(DweavPiniaPlugin);   // ← one line, all stores traced
 *
 *   createApp(App).use(pinia).mount('#app');
 *
 * Usage (trace a single store only):
 *   import { tracePiniaStore } from '@altrudevelop/dweav-connect/pinia';
 *   const authStore = useAuthStore();
 *   tracePiniaStore(authStore, 'Auth Store');
 */

import { watch } from 'vue';
import { trace } from './core.js';

/**
 * DweavPiniaPlugin
 *
 * Global Pinia plugin. Pass to pinia.use() during app setup.
 * Automatically subscribes to every store defined in your app.
 * Each store's state is traced under the label "[StoreId] Store".
 *
 * @param {object} context  - Pinia plugin context { store, app, pinia, options }
 */
export function DweavPiniaPlugin({ store }) {
  if (typeof window === 'undefined') return; // SSR guard

  // Use Pinia's built-in $subscribe for reliable patch-based change detection.
  // This fires after every state mutation including $patch() calls.
  store.$subscribe((_mutation, state) => {
    try {
      // Strip Vue reactivity proxy before passing to the extension.
      trace(JSON.parse(JSON.stringify(state)), `${store.$id} Store`);
    } catch {
      trace({ _error: 'Store state could not be serialized' }, `${store.$id} Store`);
    }
  }, {
    // detached: true keeps the subscription alive even if the
    // component that called useStore() is unmounted.
    detached: true,
  });
}

/**
 * tracePiniaStore(store, label?)
 *
 * Subscribe to a single Pinia store manually.
 * Useful when you want a custom label or selective tracing.
 *
 * @param  {object}   store   - A Pinia store instance from useXxxStore().
 * @param  {string}   label   - Card label. Defaults to '[storeId] Store'.
 * @returns {function}         Unsubscribe function.
 *
 * Usage:
 *   const authStore = useAuthStore();
 *   const stop = tracePiniaStore(authStore, 'Auth');
 *   // stop() to unsubscribe.
 */
export function tracePiniaStore(store, label) {
  const resolvedLabel = label || `${store.$id} Store`;
  if (typeof window === 'undefined') return () => {};

  // Fire once immediately.
  try {
    trace(JSON.parse(JSON.stringify(store.$state)), resolvedLabel);
  } catch {
    trace({ _error: 'Could not serialize initial state' }, resolvedLabel);
  }

  return store.$subscribe((_mutation, state) => {
    try {
      trace(JSON.parse(JSON.stringify(state)), resolvedLabel);
    } catch {
      trace({ _error: 'Store state could not be serialized' }, resolvedLabel);
    }
  }, { detached: true });
}
