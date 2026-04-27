/**
 * @altrudevelop/dweav-connect/svelte
 *
 * Svelte store subscriber for Dweav Trace.
 * Subscribes to any Svelte store (writable, readable, derived) and pipes
 * every emission into the Dweav Trace timeline.
 *
 * Compatible with Svelte 3+, SvelteKit (client-side only).
 *
 * Usage:
 *   import { attachDweav } from '@altrudevelop/dweav-connect/svelte';
 *   import { userStore } from './stores.js';
 *
 *   // In a component's onMount or at module level:
 *   const unsubscribe = attachDweav(userStore, 'User Store');
 *
 *   // Clean up in onDestroy (important to prevent memory leaks):
 *   onDestroy(unsubscribe);
 */

import { trace } from './core.js';

/**
 * attachDweav(store, label?)
 *
 * @param  {object}   store  - Any Svelte store with a .subscribe() method.
 * @param  {string}   label  - Card label. Defaults to 'Svelte Store'.
 * @returns {function}        Unsubscribe function — call in onDestroy().
 *
 * The subscription fires immediately with the current store value (this is
 * Svelte's standard subscribe contract), then fires on every subsequent update.
 */
export function attachDweav(store, label = 'Svelte Store') {
  if (typeof store?.subscribe !== 'function') {
    console.warn('[dweav-connect] attachDweav: argument must be a Svelte store with .subscribe()');
    return () => {};
  }

  if (typeof window === 'undefined') {
    // SSR — return a no-op unsubscribe immediately.
    return () => {};
  }

  const unsubscribe = store.subscribe((value) => {
    trace(value, label);
  });

  return unsubscribe;
}

/**
 * attachDweavMulti(stores, labels?)
 *
 * Attach Dweav Trace to multiple stores at once.
 * Returns a single cleanup function that unsubscribes all of them.
 *
 * Usage:
 *   const cleanup = attachDweavMulti(
 *     [userStore, cartStore, settingsStore],
 *     ['User',    'Cart',    'Settings']
 *   );
 *   onDestroy(cleanup);
 */
export function attachDweavMulti(stores, labels = []) {
  const unsubscribers = stores.map((store, i) =>
    attachDweav(store, labels[i] || `Svelte Store ${i + 1}`)
  );
  return () => unsubscribers.forEach(fn => fn());
}
