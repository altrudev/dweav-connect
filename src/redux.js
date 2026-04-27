/**
 * @altrudevelop/dweav-connect/redux
 *
 * Redux / Redux Toolkit middleware for Dweav Trace.
 * Traces the full store state after every dispatched action,
 * labelled with the action type so you can see exactly what triggered each change.
 *
 * Compatible with Redux 4+, Redux Toolkit (RTK), React-Redux.
 *
 * Usage with Redux Toolkit (recommended):
 *   import { dweavMiddleware } from '@altrudevelop/dweav-connect/redux';
 *
 *   const store = configureStore({
 *     reducer: rootReducer,
 *     middleware: (getDefaultMiddleware) =>
 *       getDefaultMiddleware().concat(dweavMiddleware),
 *   });
 *
 * Usage with plain Redux:
 *   import { createStore, applyMiddleware } from 'redux';
 *   const store = createStore(rootReducer, applyMiddleware(dweavMiddleware));
 */

import { trace } from './core.js';

/**
 * dweavMiddleware
 * Standard Redux middleware signature: store => next => action => result.
 *
 * Lets the action hit the reducers first, then traces the resulting state.
 * This ensures the trace always reflects the post-action store, not pre-action.
 */
export const dweavMiddleware = store => next => action => {
  // 1. Let the action pass through all reducers first.
  const result = next(action);

  // 2. Trace the resulting state, labelled with the action type.
  //    RTK actions have a .type string; plain objects may have a .type or .name.
  const actionLabel = action?.type || action?.name || 'Redux Action';
  trace(store.getState(), `⚡ ${actionLabel}`);

  return result;
};

/**
 * createDweavMiddleware(options?)
 *
 * Factory version of dweavMiddleware with configuration options.
 *
 * @param {object} options
 * @param {function} options.filter     - Optional predicate (action) => boolean.
 *                                        Return false to skip tracing that action.
 *                                        Useful to ignore noisy actions like timers.
 * @param {function} options.transform  - Optional (state) => state transformer.
 *                                        Use to trace a slice instead of the full store.
 * @param {string}   options.prefix     - Label prefix. Defaults to '⚡'.
 *
 * Usage:
 *   const middleware = createDweavMiddleware({
 *     filter: (action) => !action.type.startsWith('@@'),  // skip internal actions
 *     transform: (state) => state.user,                   // trace only user slice
 *     prefix: '🔥',
 *   });
 */
export function createDweavMiddleware(options = {}) {
  const {
    filter    = () => true,
    transform = (state) => state,
    prefix    = '⚡',
  } = options;

  return store => next => action => {
    const result = next(action);
    if (filter(action)) {
      const actionLabel = action?.type || action?.name || 'Redux Action';
      trace(transform(store.getState()), `${prefix} ${actionLabel}`);
    }
    return result;
  };
}

/**
 * dweavEnhancer(store, label?)
 *
 * Alternative to middleware — subscribes directly to the store.
 * Use this if you can't modify the middleware chain (e.g. third-party store setup).
 *
 * Returns an unsubscribe function.
 *
 * Usage:
 *   const unsubscribe = dweavEnhancer(store, 'App Store');
 *   // Call unsubscribe() to stop tracing.
 */
export function dweavEnhancer(store, label = 'Redux Store') {
  if (typeof store?.subscribe !== 'function') {
    console.warn('[dweav-connect] dweavEnhancer: argument must be a Redux store.');
    return () => {};
  }
  return store.subscribe(() => {
    trace(store.getState(), label);
  });
}
