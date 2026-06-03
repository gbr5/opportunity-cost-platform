'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface ReaderHeaderProps {
  bookTitle: string;
  chapterTitle: string;
  currentChapterNumber: number;
  totalChapters: number;
  scrollPercent: number;
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export function ReaderHeader({
  bookTitle,
  chapterTitle,
  currentChapterNumber,
  totalChapters,
  scrollPercent,
  onMenuToggle,
  menuOpen,
}: ReaderHeaderProps) {
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTitle(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        {/* Left: Menu toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Center: Title (shows on scroll) */}
        {showTitle && (
          <div className="flex-1 min-w-0 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {bookTitle}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {chapterTitle}
            </p>
          </div>
        )}

        {/* Right: Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalChapters, 10) }).map((_, i) => {
            const filled = i < Math.ceil((currentChapterNumber / totalChapters) * Math.min(totalChapters, 10));
            return (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition ${
                  filled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-gray-200 dark:bg-slate-800">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>
    </div>
  );
}
