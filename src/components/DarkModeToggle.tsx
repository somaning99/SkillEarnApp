import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

/**
 * Simple toggle button that switches between light and dark themes.
 * Uses the useDarkMode hook for persistence.
 */
export const DarkModeToggle: React.FC = () => {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-white/10 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-300" />}
    </button>
  );
};
export default DarkModeToggle;
