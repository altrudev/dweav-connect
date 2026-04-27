/**
 * @altrudevelop/dweav-connect — core utilities
 * Shared across all framework adapters.
 */

/**
 * isDweavAvailable()
 * Returns true if the Dweav Trace extension is injected and active on this page.
 * Safe to call in SSR contexts — always returns false server-side.
 */
export function isDweavAvailable() {
  return typeof window !== 'undefined' && typeof window.dweav === 'function';
}

/**
 * trace(data, label)
 * Safe wrapper around window.dweav(). No-ops silently if the extension
 * is not installed so your app never throws in production.
 */
export function trace(data, label) {
  if (isDweavAvailable()) {
    window.dweav(data, label);
  }
}

/**
 * watch(obj, label)
 * Safe wrapper around window.dweav.watch(). Returns the original object
 * unmodified if the extension is not installed — zero cost in production.
 */
export function watch(obj, label) {
  if (isDweavAvailable() && typeof window.dweav.watch === 'function') {
    return window.dweav.watch(obj, label);
  }
  return obj;
}
