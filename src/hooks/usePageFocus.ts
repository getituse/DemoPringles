import { useEffect, useRef } from 'react';

/**
 * Move focus to the page <h1> on route change for screen-reader
 * announcement.
 */
export function usePageFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}

