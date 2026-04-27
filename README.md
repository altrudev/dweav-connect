# @altrudevelop/dweav-connect

Framework adapters for [Dweav Trace](https://altru.dev) — the privacy-first, offline-first state tracing Chrome extension.

Connect React, Vue, Svelte, Redux, Zustand, and Pinia to Dweav Trace with a single line of code. Zero configuration. Zero cost in production if the extension is not installed.

---

## Installation

```bash
npm install @altrudevelop/dweav-connect
```

---

## How it works

Dweav Trace exposes a `window.dweav()` global on every page where it is installed. This package provides thin, framework-native wrappers around that global so you never have to think about it. If the extension is not installed, every adapter silently no-ops — your app behaves identically in production.

---

## React / Next.js

```js
import { useDweavTrace } from '@altrudevelop/dweav-connect/react';

function UserProfile() {
  const [user, setUser] = useState({ name: 'Sean', role: 'guest' });

  // One line — traces every time `user` changes.
  useDweavTrace(user, 'User Profile');

  return <div>{user.name}</div>;
}
```

### Drop-in useState replacement

```js
import { useDweavRef } from '@altrudevelop/dweav-connect/react';

function Counter() {
  // Identical API to useState — traces automatically on every update.
  const [count, setCount] = useDweavRef(0, 'Counter');
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Tracing React Context

```js
import { useDweavContext } from '@altrudevelop/dweav-connect/react';

function App() {
  const auth = useContext(AuthContext);
  useDweavContext(auth, 'Auth Context');
  ...
}
```

---

## Vue 3 (Composition API)

```js
import { useDweav } from '@altrudevelop/dweav-connect/vue';

const profile = reactive({ role: 'admin', permissions: [] });

// Deep watch — any nested mutation fires a trace automatically.
useDweav(profile, 'Admin Profile');

// Mutations anywhere in the tree are captured:
profile.permissions.push('write'); // → card appears in Dweav Trace
```

### Tracing a ref()

```js
import { useDweavRef } from '@altrudevelop/dweav-connect/vue';

const count = ref(0);
useDweavRef(count, 'Counter');
count.value++; // → card fires automatically
```

---

## Svelte

```js
import { attachDweav } from '@altrudevelop/dweav-connect/svelte';
import { onDestroy }   from 'svelte';
import { userStore }   from './stores.js';

const unsubscribe = attachDweav(userStore, 'User Store');
onDestroy(unsubscribe); // Always clean up on component destroy
```

### Multiple stores at once

```js
import { attachDweavMulti } from '@altrudevelop/dweav-connect/svelte';

const cleanup = attachDweavMulti(
  [userStore,  cartStore,  settingsStore],
  ['User',     'Cart',     'Settings']
);
onDestroy(cleanup);
```

---

## Redux / Redux Toolkit

```js
import { dweavMiddleware } from '@altrudevelop/dweav-connect/redux';

// RTK (recommended)
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dweavMiddleware),
});

// Every action now appears in Dweav Trace labelled with its action.type.
// dispatch({ type: 'user/setRole', payload: 'admin' })
// → card labelled "⚡ user/setRole" appears automatically
```

### With filtering (skip noisy actions)

```js
import { createDweavMiddleware } from '@altrudevelop/dweav-connect/redux';

const middleware = createDweavMiddleware({
  filter:    (action) => !action.type.startsWith('@@'),  // skip internal Redux actions
  transform: (state)  => state.user,                     // trace only the user slice
  prefix:    '🔥',
});
```

---

## Zustand

```js
import { dweav } from '@altrudevelop/dweav-connect/zustand';
import { create } from 'zustand';

const useUserStore = create(
  dweav(
    (set) => ({
      name: 'Sean',
      role: 'guest',
      setRole: (role) => set({ role }),
    }),
    'User Store'
  )
);

// useUserStore().setRole('admin') → card fires automatically
```

### Attach to an existing store externally

```js
import { attachDweavToStore } from '@altrudevelop/dweav-connect/zustand';

const unsubscribe = attachDweavToStore(useUserStore, 'User Store');
```

---

## Pinia (Vue 3)

### Trace all stores automatically (recommended)

```js
import { createApp }       from 'vue';
import { createPinia }     from 'pinia';
import { DweavPiniaPlugin } from '@altrudevelop/dweav-connect/pinia';

const pinia = createPinia();
pinia.use(DweavPiniaPlugin); // ← one line traces every store in your app

createApp(App).use(pinia).mount('#app');
```

### Trace a single store

```js
import { tracePiniaStore } from '@altrudevelop/dweav-connect/pinia';

const authStore = useAuthStore();
const stop = tracePiniaStore(authStore, 'Auth');
// stop() to unsubscribe
```

---

## Core utilities

Available from the root import if you need lower-level access:

```js
import { isDweavAvailable, trace, watch } from '@altrudevelop/dweav-connect';

// Check if the extension is installed
if (isDweavAvailable()) {
  console.log('Dweav Trace is active');
}

// Safe wrapper around window.dweav() — no-ops if not installed
trace(myState, 'Manual trace');

// Safe wrapper around window.dweav.watch()
const proxy = watch(myObject, 'Watched object');
```

---

## Production safety

Every adapter checks for the presence of `window.dweav` before doing anything. If the Dweav Trace extension is not installed:

- `useDweavTrace` — no-ops silently, no re-renders triggered
- `useDweav` / `useDweavRef` — watcher still runs, trace call is skipped
- `attachDweav` — subscribes but skips the trace call
- `dweavMiddleware` — passes action through normally, skips trace
- `dweav` (Zustand) — `set()` works normally, trace is skipped
- `DweavPiniaPlugin` — `$subscribe` runs normally, trace is skipped

Zero performance cost in production beyond a single `typeof window.dweav === 'function'` check per trace call.

---

## SSR / Server Components

All adapters include `typeof window !== 'undefined'` guards. They are safe to import in SSR environments (Next.js App Router, Nuxt, SvelteKit). Tracing only activates client-side where the extension can be present.

For Next.js App Router, use `useDweavTrace` inside Client Components only (files with `'use client'` at the top).

---

## License

MIT © [Altru.dev](https://altru.dev)
