import { type Ref } from 'react';

/**
 * Merges several refs into one callback ref, handling both function refs and
 * ref objects. A masked input needs this: react-hook-form's `register()` hands us
 * a ref, the mask hook hands us another, and both have to reach the same node.
 */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}
