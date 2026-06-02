import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const Logo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="12" r="4" fillOpacity="0.4" />
    <circle cx="16" cy="12" r="4" fillOpacity="0.9" />
  </svg>
);

export function Header() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return true; // Default to dark mode
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="bg-[var(--surface-bg)] bg-opacity-90 backdrop-blur-sm h-16 flex items-center sticky top-0 z-50 border-b border-[var(--border-subtle)]">
      <div className="w-full mx-auto px-6 lg:px-12 flex items-center justify-between">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-left group"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="text-[var(--text-primary)]"
          >
            <Logo />
          </motion.div>
          <h1 className="text-subheading m-0 tracking-tight font-display font-semibold transition-colors group-hover:text-[var(--text-muted)] dark:group-hover:text-white">NutriScan</h1>
        </button>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              document.getElementById('ai-coach-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-body font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            AI Coach
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-[var(--surface-raised)] text-[var(--text-secondary)] transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
