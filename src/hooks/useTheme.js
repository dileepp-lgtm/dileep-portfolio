import { useCallback, useEffect, useRef, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  const first = useRef(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    /* Only persist a deliberate choice — writing on mount would freeze the
       visitor's OS preference into storage and ignore later system changes. */
    if (first.current) { first.current = false; return; }
    try { localStorage.setItem('theme', theme); } catch (e) { /* private mode */ }
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
