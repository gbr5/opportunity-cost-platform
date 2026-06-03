'use client';

import { useState } from 'react';
import { Moon, Sun, Type } from 'lucide-react';
import { useTheme } from 'next-themes';
import { TextToSpeech } from './TextToSpeech';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface ReaderToolbarProps {
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  scrollPercent: number;
  chapterText?: string;
  chapterTitle?: string;
}

const fontSizes: { size: FontSize; label: string; className: string }[] = [
  { size: 'sm', label: 'A', className: 'text-xs' },
  { size: 'md', label: 'A', className: 'text-sm' },
  { size: 'lg', label: 'A', className: 'text-base' },
  { size: 'xl', label: 'A', className: 'text-lg' },
];

export function ReaderToolbar({
  fontSize,
  onFontSizeChange,
  scrollPercent,
  chapterText,
  chapterTitle,
}: ReaderToolbarProps) {
  const { theme, setTheme } = useTheme();
  const [fontMenuOpen, setFontMenuOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto gap-2">
        {/* Font size control */}
        <div className="relative">
          <button
            onClick={() => setFontMenuOpen(!fontMenuOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-2"
            aria-label="Font size"
          >
            <Type className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Aa</span>
          </button>

          {fontMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-2 flex gap-2">
              {fontSizes.map((f) => (
                <button
                  key={f.size}
                  onClick={() => {
                    onFontSizeChange(f.size);
                    setFontMenuOpen(false);
                  }}
                  className={`px-3 py-1 rounded transition ${
                    fontSize === f.size
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={f.className}>{f.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text-to-Speech */}
        {chapterText && <TextToSpeech text={chapterText} chapterTitle={chapterTitle} />}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Progress percentage */}
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {Math.round(scrollPercent)}%
        </div>
      </div>
    </div>
  );
}
