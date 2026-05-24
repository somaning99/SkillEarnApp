import { useEffect, useState } from 'react';

/**
 * Hook to manage dark mode state and persist preference in localStorage.
 * Adds or removes the 'dark' class on the <html> element.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or prefers-color-scheme media query
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return { isDark, toggle };
}
