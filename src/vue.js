/**
 * @altrudevelop/dweav-connect/vue
 *
 * Vue 3 Composition API composable for Dweav Trace.
 * Uses Vue's native watch() to deeply track reactive state mutations.
 *
 * Compatible with Vue 3.0+ (Composition API).
 * Also works with Nuxt 3 — client-side only via process.client guard.
 *
 * Usage:
 *   import { useDweav } from '@altrudevelop/dweav-connect/vue';
 *
 *   const profile = reactive({ role: 'admin', permissions: [] });
 *   useDweav(profile, 'Admin Profile');
 *   // Every deep mutation to profile fires a trace automatically.
 */

import { watch, onUnmounted } from 'vue';
import { trace } from './core.js';

/**
 * useDweav(reactiveState, label?, options?)
 *
 * @param {object}  reactiveState - A Vue reactive() or ref() value to watch.
 * @param {string}  label         - Card label. Defaults to 'Vue State'.
 * @param {object}  options       - Optional overrides:
 *                                    immediate {boolean} - fire on mount (default true)
 *                                    deep      {boolean} - deep watch (default true)
 *
 * Returns a stop() function — call it to stop watching (e.g. on component destroy).
 * In most cases you don't need to call stop() manually — useDweav automatically
 * stops when the component is unmounted via onUnmounted.
 */
export function useDweav(reactiveState, label = 'Vue State', options = {}) {
  const { immediate = true, deep = true } = options;

  const stop = watch(
    reactiveState,
    (newState) => {
      if (typeof window === 'undefined') return; // SSR guard
      // Clone to strip Vue's reactive Proxy before passing to the extension.
      // JSON round-trip is intentional — sends a plain snapshot, not a live proxy.
      try {
        trace(JSON.parse(JSON.stringify(newState)), label);
      } catch {
        trace({ _error: 'Vue state could not be serialized' }, label);
      }
    },
    { deep, immediate }
  );

  // Auto-cleanup when component is unmounted.
  onUnmounted(stop);

  return stop;
}

/**
 * useDweavRef(refValue, label?)
 *
 * Convenience wrapper for tracing a single Vue ref().
 * Unwraps .value automatically.
 *
 * Usage:
 *   const count = ref(0);
 *   useDweavRef(count, 'Counter');
 *   count.value++;  // → card fires automatically
 */
export function useDweavRef(refValue, label = 'Vue Ref') {
  return useDweav(refValue, label);
}

/**
 * useDweavStore(store, label?)
 *
 * Traces a Pinia store passed directly.
 * Alternative to the dedicated Pinia plugin for simple use cases.
 *
 * Usage:
 *   const authStore = useAuthStore();
 *   useDweavStore(authStore, 'Auth Store');
 */
export function useDweavStore(store, label = 'Vue Store') {
  return useDweav(store.$state, label);
}
