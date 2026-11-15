import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/features/theme/themeStore';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4 text-blue-400" /> },
    { mode: 'system', label: 'System', icon: <Laptop className="w-4 h-4 text-neutral-400" /> },
  ];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md hover:bg-neutral-800/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors border border-transparent hover:border-neutral-700/60 flex items-center justify-center cursor-pointer"
        title={`Current theme: ${theme} (click to change)`}
        aria-label="Toggle display theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-neutral-300" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md bg-[#18181b] dark:bg-[#18181b] border border-[#27272a] shadow-2xl py-1 text-xs text-neutral-300 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-mono text-neutral-500 uppercase tracking-wider border-b border-[#27272a]">
            Theme
          </div>
          {options.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => {
                setTheme(opt.mode);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#27272a] hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                {opt.icon}
                <span>{opt.label}</span>
              </div>
              {theme === opt.mode && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
