'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-slate-800/80 hover:bg-stone-200 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/60 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
      title={`Switch to ${theme === 'dark' ? 'Warm Light' : 'Midnight Dark'} mode`}
      aria-label="Toggle visual theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline text-[11px]">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline text-[11px]">Dark</span>
        </>
      )}
    </button>
  );
}

