'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ChapterContent } from '@/components/reader/ChapterContent';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { TableOfContents } from '@/components/reader/TableOfContents';
import Link from 'next/link';

interface Chapter {
  id: string;
  slug: string;
  title: string;
  order: number;
  content: string;
}

interface PageProps {
  params: Promise<{
    bookSlug: string;
    chapterId: string;
  }>;
}

export default function ChapterPage({ params: paramsPromise }: PageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [scrollPercent, setScrollPercent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch chapters and current chapter
  useEffect(() => {
    async function loadChapters() {
      try {
        const response = await fetch(`/api/chapters?bookSlug=${params.bookSlug}`);
        if (!response.ok) throw new Error('Failed to load chapters');
        const data = await response.json();
        setChapters(data.chapters);

        const current = data.chapters.find((ch: Chapter) => ch.id === params.chapterId);
        if (current) {
          setCurrentChapter(current);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading chapters:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChapters();
  }, [params.bookSlug, params.chapterId, router]);

  // Load theme preference
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('reader-theme');
    if (stored) setTheme(stored);
    const storedFontSize = localStorage.getItem('reader-font-size');
    if (storedFontSize) setFontSize(storedFontSize as any);
  }, [setTheme]);

  // Handle scroll and save progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const percent = documentHeight > 0 ? Math.round((scrolled / documentHeight) * 100) : 0;
      setScrollPercent(Math.min(100, percent));

      // Debounce progress save
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        saveProgress(percent);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [params.bookSlug]);

  const saveProgress = useCallback(
    async (percent: number) => {
      if (!currentChapter) return;
      try {
        await fetch('/api/reading-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: currentChapter.id.split('-')[0], // Simplified for now
            chapterId: params.chapterId,
            scrollPercent: percent,
          }),
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    },
    [currentChapter, params.chapterId]
  );

  const handleFontSizeChange = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    setFontSize(size);
    localStorage.setItem('reader-font-size', size);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('reader-theme', newTheme);
  };

  if (!mounted || loading || !currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const currentIndex = chapters.findIndex((ch) => ch.id === params.chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex">
      {/* Table of Contents Sidebar */}
      <TableOfContents
        chapters={chapters}
        currentChapterId={params.chapterId}
        bookSlug={params.bookSlug}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Header */}
        <ReaderHeader
          bookTitle={chapters[0]?.slug === 'introduction' ? 'Custo de Oportunidade' : 'Custo de Oportunidade'}
          chapterTitle={currentChapter.title}
          currentChapterNumber={currentIndex + 1}
          totalChapters={chapters.length}
          scrollPercent={scrollPercent}
          onMenuToggle={() => setMenuOpen(!menuOpen)}
          menuOpen={menuOpen}
        />

        {/* Content */}
        <div className="pt-16 pb-24">
          <ChapterContent content={currentChapter.content} fontSize={fontSize} />

          {/* Navigation */}
          <div className="max-w-2xl mx-auto px-4 py-8 flex gap-4 justify-between">
            {prevChapter ? (
              <Link
                href={`/read/${params.bookSlug}/${prevChapter.id}`}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 rounded-lg transition text-sm font-medium"
              >
                ← Anterior
              </Link>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <Link
                href={`/read/${params.bookSlug}/${nextChapter.id}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
              >
                Próximo →
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Toolbar */}
        <ReaderToolbar
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          scrollPercent={scrollPercent}
        />
      </div>
    </div>
  );
}
