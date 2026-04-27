/**
 * @altrudevelop/dweav-connect/zustand
 *
 * Zustand middleware for Dweav Trace.
 * Wraps your Zustand store creator to automatically trace state after
 * every mutation — including partial updates from set() and immer patches.
 *
 * Compatible with Zustand 4+.
 *
 * Usage (inline middleware):
 *   import { dweav } from '@altrudevelop/dweav-connect/zustand';
 *   import { create } from 'zustand';
 *
 *   const useUserStore = create(
 *     dweav(
 *       (set) => ({
 *         name: 'Sean',
 *         role: 'guest',
 *         setRole: (role) => set({ role }),
 *       }),
 *       'User Store'  // label shown in Dweav Trace panel
 *     )
 *   );
 *
 * That's it — one wrapper, zero other changes.
 */

import { trace } from './core.js';

/**
 * dweav(storeCreator, label?)
 *
 * Zustand middleware function. Wraps the store initializer.
 *
 * @param {function} storeCreator  - Your Zustand store function (set, get, api) => state
 * @param {string}   label         - Card label in Dweav Trace. Defaults to 'Zustand Store'.
 * @returns {function}              Wrapped store creator — pass directly to create().
 */
export function dweav(storeCreator, label = 'Zustand Store') {
  return (set, get, api) => {
    // Wrap Zustand's set() to fire a trace after every state update.
    const tracedSet = (...args) => {
      set(...args);
      trace(get(), label);
    };

    return storeCreator(tracedSet, get, api);
  };
}

/**
 * attachDweavToStore(useStore, label?)
 *
 * Alternative approach — subscribe to an existing Zustand store externally.
 * Use this if you don't want to modify the store definition, or if you're
 * using a third-party store you don't own.
 *
 * @param {function} useStore  - The Zustand hook returned by create().
 * @param {string}   label     - Card label. Defaults to 'Zustand Store'.
 * @returns {function}          Unsubscribe function.
 *
 * Usage:
 *   const unsubscribe = attachDweavToStore(useUserStore, 'User Store');
 *   // Call unsubscribe() to stop tracing.
 */
export function attachDweavToStore(useStore, label = 'Zustand Store') {
  if (typeof useStore?.getState !== 'function' || typeof useStore?.subscribe !== 'function') {
    console.warn('[dweav-connect] attachDweavToStore: argument must be a Zustand store hook.');
    return () => {};
  }

  // Fire once immediately with current state.
  trace(useStore.getState(), label);

  // Then subscribe to all subsequent changes.
  return useStore.subscribe((state) => {
    trace(state, label);
  });
}
