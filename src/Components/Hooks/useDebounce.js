import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms have
 * passed without `value` changing. Used to throttle search-as-you-type so the
 * API is hit once the user pauses typing instead of on every keystroke.
 *
 * @param {*} value - the fast-changing value (e.g. a search input string)
 * @param {number} delay - debounce window in ms (default 300)
 * @returns the value as of `delay` ms after the last change
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
