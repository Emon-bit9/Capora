import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`
        ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'}
        rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse
        ${className}
      `} />
    );
  }

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'}
        rounded-full bg-gray-100 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        flex items-center justify-center
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        group
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon 
          size={iconSize} 
          className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200" 
        />
      ) : (
        <Sun 
          size={iconSize} 
          className="text-yellow-500 group-hover:text-yellow-400 transition-colors duration-200" 
        />
      )}
    </button>
  );
}; 