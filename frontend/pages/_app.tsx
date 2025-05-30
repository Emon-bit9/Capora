import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize theme on app load to prevent flash
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    initTheme();
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700',
        }}
      />
      <VercelAnalytics />
    </AuthProvider>
  );
} 