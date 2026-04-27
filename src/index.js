/**
 * @altrudevelop/dweav-connect
 *
 * Framework adapters for the Dweav Trace Chrome extension.
 * Import from the specific framework path for tree-shaking,
 * or import everything from the root for convenience.
 *
 * Tree-shakeable imports (recommended):
 *   import { useDweavTrace }     from '@altrudevelop/dweav-connect/react';
 *   import { useDweav }          from '@altrudevelop/dweav-connect/vue';
 *   import { attachDweav }       from '@altrudevelop/dweav-connect/svelte';
 *   import { dweavMiddleware }   from '@altrudevelop/dweav-connect/redux';
 *   import { dweav }             from '@altrudevelop/dweav-connect/zustand';
 *   import { DweavPiniaPlugin }  from '@altrudevelop/dweav-connect/pinia';
 *
 * Convenience import (includes everything):
 *   import * as DweavConnect from '@altrudevelop/dweav-connect';
 */

// Core utilities
export { isDweavAvailable, trace, watch } from './core.js';

// React
export { useDweavTrace, useDweavRef, useDweavContext } from './react.js';

// Vue
export { useDweav, useDweavRef as useDweavVueRef, useDweavStore } from './vue.js';

// Svelte
export { attachDweav, attachDweavMulti } from './svelte.js';

// Redux
export { dweavMiddleware, createDweavMiddleware, dweavEnhancer } from './redux.js';

// Zustand
export { dweav as dweavZustand, attachDweavToStore } from './zustand.js';

// Pinia
export { DweavPiniaPlugin, tracePiniaStore } from './pinia.js';
