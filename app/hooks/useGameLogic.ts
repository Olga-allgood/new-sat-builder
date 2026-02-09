'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { word_with_examples } from '@/app/types/database';

interface FailedWord {
  word: string;
  definition: string;
}

export function useGameLogic(userId: string) {
  const [currentWord, setCurrentWord] = useState<word_with_examples | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedWords, setFailedWords] = useState<FailedWord[]>([]);

  /* ---------- helpers ---------- */

  const isComplete = (word: string, guessed: Set<string>) => {
    return word
      .toUpperCase()
      .split('')
      .every(letter => guessed.has(letter));
  };

  /* ---------- game start ---------- */

  const startNewGame = useCallback(async () => {
    setLoading(true);
    setError('');
    setGuessedLetters(new Set());
    setIncorrectGuesses([]);
    setIsCompleted(false);
    setIsFailed(false);

    const { data: words, error: wordError } = await supabase
      .from('words')
      .select('*')
      .or(`is_public.eq.true,user_id.eq.${userId}`);

    if (wordError || !words?.length) {
      setError('No words available');
      setLoading(false);
      return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];

    const { data: examples } = await supabase
      .from('examples')
      .select('*')
      .eq('word_id', randomWord.id);

    setCurrentWord({ ...randomWord, examples: examples || [] });

    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        word_id: randomWord.id,
        status: false,
        correct_guesses: false,
      })
      .select()
      .single();

    if (!sessionError) {
      setSessionId(session.id);
    }

    setLoading(false);
  }, [userId]);

  /* ---------- keyboard logic ---------- */

  const handleKeyPress = useCallback(
    async (e: KeyboardEvent) => {
      if (!currentWord || loading || isCompleted || isFailed) return;

      if (!/^[a-zA-Z]$/.test(e.key)) return;

      const letter = e.key.toUpperCase();
      if (guessedLetters.has(letter) || incorrectGuesses.includes(letter)) return;

      if (currentWord.word.toUpperCase().includes(letter)) {
        const nextGuesses = new Set(guessedLetters);
        nextGuesses.add(letter);
        setGuessedLetters(nextGuesses);

        if (isComplete(currentWord.word, nextGuesses)) {
          setIsCompleted(true);

          if (sessionId) {
            await supabase
              .from('game_sessions')
              .update({ status: true, correct_guesses: true })
              .eq('id', sessionId);
          }

          window.dispatchEvent(new Event('wordCompleted'));
        }
      } else {
        const nextIncorrect = [...incorrectGuesses, letter];
        setIncorrectGuesses(nextIncorrect);

        const MAX = currentWord.word.length + 3;
        if (nextIncorrect.length >= MAX) {
          setIsFailed(true);

          if (sessionId) {
            await supabase
              .from('game_sessions')
              .update({ status: true, correct_guesses: false })
              .eq('id', sessionId);
          }

          setFailedWords(prev =>
            [...prev, { word: currentWord.word, definition: currentWord.meaning }].slice(-5)
          );

          window.dispatchEvent(new Event('wordFailed'));
        }
      }
    },
    [
      currentWord,
      guessedLetters,
      incorrectGuesses,
      isCompleted,
      isFailed,
      loading,
      sessionId,
    ]
  );

  /* ---------- lifecycle ---------- */

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handleKeyPress]);

  return {
    currentWord,
    guessedLetters,
    incorrectGuesses,
    isCompleted,
    isFailed,
    loading,
    error,
    failedWords,
    startNewGame,
  };
}
