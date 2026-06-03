'use client';

import Link from 'next/link';
import { Check, Circle } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  slug: string;
  order: number;
}

interface TableOfContentsProps {
  chapters: Chapter[];
  currentChapterId: string;
  bookSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TableOfContents({
  chapters,
  currentChapterId,
  bookSlug,
  isOpen,
  onClose,
}: TableOfContentsProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 overflow-y-auto transition-transform duration-300 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-2">
          {chapters.map((chapter) => {
            const isCurrent = chapter.id === currentChapterId;
            return (
              <Link
                key={chapter.id}
                href={`/read/${bookSlug}/${chapter.id}`}
                onClick={onClose}
                className={`flex items-start gap-3 px-3 py-2 rounded-lg transition text-sm ${
                  isCurrent
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCurrent ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : (
                    <Check className="w-4 h-4 opacity-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                    {chapter.order === 0 ? 'Introdução' : `Capítulo ${chapter.order}`}
                  </p>
                  <p className="font-medium line-clamp-2">{chapter.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
