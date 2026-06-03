'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

interface TextToSpeechProps {
  text: string;
  chapterTitle?: string;
}

export function TextToSpeech({ text, chapterTitle }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setIsBrowserSupported(false);
      return;
    }
    synthRef.current = synth;
  }, []);

  const handlePlay = () => {
    if (!synthRef.current) return;

    const synth = synthRef.current;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      return;
    }

    if (synth.paused) {
      synth.resume();
      setIsPlaying(true);
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.lang = 'pt-BR';

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying && utteranceRef.current) {
      utteranceRef.current.rate = newRate;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  };

  if (!isBrowserSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition group relative">
      <button
        onClick={handlePlay}
        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        title={isPlaying ? 'Pausar' : 'Ouvir'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      {isPlaying && (
        <button
          onClick={handleStop}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
          aria-label="Stop audio"
          title="Parar"
        >
          <Square className="w-4 h-4" />
        </button>
      )}

      {/* Popover controls */}
      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-4 w-48 z-50">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Velocidade: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1 mb-1">
              <Volume2 className="w-3 h-3" /> Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {chapterTitle && <p className="font-medium">{chapterTitle}</p>}
            <p>Leitura em tempo real</p>
          </div>
        </div>
      </div>
    </div>
  );
}
