/**
 * @altrudevelop/dweav-connect/react
 *
 * Custom React hook for Dweav Trace.
 * Automatically fires a trace whenever the watched state changes.
 *
 * Compatible with React 16.8+, Next.js (client components only).
 *
 * Usage:
 *   import { useDweavTrace } from '@altrudevelop/dweav-connect/react';
 *
 *   function UserProfile() {
 *     const [user, setUser] = useState({ name: 'Sean', role: 'guest' });
 *     useDweavTrace(user, 'User Profile');
 *     // Every time `user` changes, a card appears in Dweav Trace automatically.
 *     ...
 *   }
 */

import { useEffect, useRef } from 'react';
import { trace } from './core.js';

/**
 * useDweavTrace(state, label?)
 *
 * @param {*}      state  - Any value to trace. Typically a state variable
 *                          from useState(), useReducer(), or a selector result.
 * @param {string} label  - Card label shown in the Dweav Trace panel.
 *                          Defaults to 'React State'.
 *
 * Fires on mount (initial state) and on every subsequent state change.
 * Safe in SSR — no-ops on the server, activates on the client.
 */
export function useDweavTrace(state, label = 'React State') {
  useEffect(() => {
    trace(state, label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, label]);
}

/**
 * useDweavRef(initialState, label?)
 *
 * Drop-in replacement for useState() that automatically traces every update.
 * Returns [state, setState] exactly like useState().
 *
 * Usage:
 *   const [user, setUser] = useDweavRef({ name: 'Sean' }, 'User');
 *   setUser({ name: 'Sean', role: 'admin' }); // → card fires automatically
 */
export function useDweavRef(initialState, label = 'React State') {
  const { useState } = require('react');
  const [state, setStateInternal] = useState(initialState);
  const labelRef = useRef(label);
  labelRef.current = label;

  useEffect(() => {
    trace(state, labelRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return [state, setStateInternal];
}

/**
 * useDweavContext(context, label?)
 *
 * Traces a React Context value whenever it changes.
 * Pass the value returned from useContext(), not the context object itself.
 *
 * Usage:
 *   const authState = useContext(AuthContext);
 *   useDweavContext(authState, 'Auth Context');
 */
export function useDweavContext(contextValue, label = 'React Context') {
  useDweavTrace(contextValue, label);
}
