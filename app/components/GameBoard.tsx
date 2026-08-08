
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { word_with_examples } from '@/app/types/database';
import WordCard from './WordCard';
import AlphabetButtons from './AlphabetButtons';
import CompleteDisplay from './CompleteDisplay';
import PersonalWordForm from './PersonalWordForm';
import { useRouter } from 'next/navigation';
import ArticlePanel from './ArticlePanel';

interface GameBoardProps {
  userId: string;
}

interface FailedWord {
  word: string;
  definition: string;
}

export default function GameBoard({ userId }: GameBoardProps) {
  const [currentWord, setCurrentWord] =
    useState<word_with_examples | null>(null);

  const [guessedLetters, setGuessedLetters] =
    useState<Set<string>>(new Set());

  const [incorrectGuesses, setIncorrectGuesses] =
    useState<string[]>([]);

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [isCompleted, setIsCompleted] =
    useState(false);

  const [isFailed, setIsFailed] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [personalWord, setPersonalWord] =
    useState(false);

  const [failedWords, setFailedWords] =
    useState<FailedWord[]>([]);

  const [showArticle, setShowArticle] =
    useState(false);

  const router = useRouter();

  /*
    Check whether all letters in the word
    have been guessed.
  */
  function isComplete(
    word: string,
    guessed: Set<string>
  ) {
    const wordLetters =
      word.toUpperCase().split('');

    for (const letter of wordLetters) {
      if (!guessed.has(letter)) {
        return false;
      }
    }

    return true;
  }

  /*
    Start a new game.
  */
  async function startNewGame() {
    setLoading(true);
    setError('');

    setGuessedLetters(new Set());
    setIncorrectGuesses([]);
    setIsCompleted(false);
    setIsFailed(false);
    setSessionId(null);
    setCurrentWord(null);

    /*
      1. Get the currently authenticated user.
    */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      setError(
        `Authentication error: ${authError.message}`
      );
      setLoading(false);
      return;
    }

    if (!user) {
      setError('You must be logged in to play.');
      setLoading(false);
      router.push('/login');
      return;
    }

    /*
      2. Check the user's profile.
    */
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      setError(
        `Unable to check your profile: ${profileError.message}`
      );
      setLoading(false);
      return;
    }

    if (!profile) {
      setError(
        'Your profile was not found. Please make sure your account has a profile before starting a game.'
      );
      setLoading(false);
      return;
    }

    /*
      3. Get active words.
    */
    const {
      data: words,
      error: wordError,
    } = await supabase
      .from('words')
      .select('*')
      .eq('is_active', true);

    console.log('Active words:', words);
    console.log('Word error:', wordError);

    if (wordError) {
      setError(
        `Could not load words: ${wordError.message}`
      );
      setLoading(false);
      return;
    }

    if (!words || words.length === 0) {
      setError(
        'No active words are available in the database. Please check that your words have is_active = true.'
      );
      setLoading(false);
      return;
    }

    /*
      4. Choose a random active word.
    */
    const randomNumber =
      Math.floor(Math.random() * words.length);

    const randomWord = words[randomNumber];

    console.log('Selected word:', randomWord);

    /*
      5. Get examples for the selected word.
    */
    const {
      data: examples,
      error: examplesError,
    } = await supabase
      .from('examples')
      .select(
        'id, word_id, example_standard, example_funny'
      )
      .eq('word_id', randomWord.id);

    if (examplesError) {
      setError(
        `Could not load examples: ${examplesError.message}`
      );
      setLoading(false);
      return;
    }

    /*
      6. Add examples to the selected word.
    */
    setCurrentWord({
      ...randomWord,
      examples: examples || [],
    });

    /*
      7. Create game session.
    */
    const {
      data: session,
      error: sessionError,
    } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        word_id: randomWord.id,
        status: false,
        correct_guesses: false,
      })
      .select()
      .single();

    if (sessionError) {
      setError(
        `Could not create game session: ${sessionError.message}`
      );
      setLoading(false);
      return;
    }

    setSessionId(session.id);
    setLoading(false);

    console.log('New session:', session.id);
    console.log('User:', user.id);
    console.log('Word:', randomWord.word);
  }

  /*
    Start first game.
  */
  useEffect(() => {
    startNewGame();
  }, []);

  /*
    Main guessing function.

    Both the physical keyboard and the
    on-screen keyboard use this function.
  */
  async function handleGuess(letter: string) {
    if (
      isCompleted ||
      isFailed ||
      loading ||
      !currentWord
    ) {
      return;
    }

    const upperLetter = letter.toUpperCase();

    /*
      Ignore letters already tried.
    */
    if (
      guessedLetters.has(upperLetter) ||
      incorrectGuesses.includes(upperLetter)
    ) {
      return;
    }

    /*
      Correct guess.
    */
    if (
      currentWord.word
        .toUpperCase()
        .includes(upperLetter)
    ) {
      const newGuess =
        new Set(guessedLetters);

      newGuess.add(upperLetter);

      setGuessedLetters(newGuess);

      /*
        Check whether the entire word
        has been guessed.
      */
      if (
        isComplete(
          currentWord.word,
          newGuess
        )
      ) {
        setIsCompleted(true);

        if (sessionId) {
          const {
            error: updateError,
          } = await supabase
            .from('game_sessions')
            .update({
              status: true,
              correct_guesses: true,
            })
            .eq('id', sessionId);

          if (updateError) {
            setError(
              `Could not update game session: ${updateError.message}`
            );
          }
        }

        window.dispatchEvent(
          new Event('wordCompleted')
        );
      }
    }

    /*
      Incorrect guess.
    */
    else {
      const MAX_GUESSES =
        currentWord.word.length + 3;

      const newIncorrectGuesses = [
        ...incorrectGuesses,
        upperLetter,
      ];

      setIncorrectGuesses(
        newIncorrectGuesses
      );

      /*
        Player failed the word.
      */
      if (
        newIncorrectGuesses.length >=
        MAX_GUESSES
      ) {
        setIsFailed(true);

        if (sessionId) {
          const {
            error: updateError,
          } = await supabase
            .from('game_sessions')
            .update({
              status: true,
              correct_guesses: false,
            })
            .eq('id', sessionId);

          if (updateError) {
            setError(
              `Could not update game session: ${updateError.message}`
            );
          }
        }

        /*
          Add failed word to article-generation list.

          Keep only the last 5 failed words.
        */
        setFailedWords((prev) => {
          const newFailed = [
            ...prev,
            {
              word: currentWord.word,
              definition: currentWord.meaning,
            },
          ];

          return newFailed.slice(-5);
        });

        window.dispatchEvent(
          new Event('wordFailed')
        );
      }
    }
  }

  /*
    Physical keyboard input.

    This uses the same handleGuess()
    function as the on-screen keyboard.
  */
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      const target =
        e.target as HTMLElement;

      /*
        Don't capture keyboard input
        from forms.
      */
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      /*
        Only accept letters.
      */
      if (!/^[a-zA-Z]$/.test(e.key)) {
        setError(
          'You need to choose a letter'
        );

        setTimeout(() => {
          setError('');
        }, 2000);

        return;
      }

      handleGuess(e.key);
    }

    window.addEventListener(
      'keypress',
      handleKeyPress
    );

    return () => {
      window.removeEventListener(
        'keypress',
        handleKeyPress
      );
    };
  }, [
    currentWord,
    isFailed,
    isCompleted,
    incorrectGuesses,
    sessionId,
    guessedLetters,
    loading,
  ]);

  /*
    Hear word.
  */
  function speakWord(word: string) {
    const utterance =
      new SpeechSynthesisUtterance(word);

    utterance.lang = 'en-US';

    window.speechSynthesis.speak(
      utterance
    );
  }

  /*
    Loading / no word state.
  */
  if (!currentWord) {
    return (
      <div className="w-full">
        {loading ? (
          <div className="text-center py-8">
            Loading word...
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No words to guess.</p>

            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              onClick={startNewGame}
              className="mt-4 px-4 py-2 rounded-md bg-[#009CDE] text-white hover:bg-[#2d76c0]"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Error */}
      {error && (
        <p className="mb-4 text-center text-sm text-red-500">
          {error}
        </p>
      )}

      {/* GRID WRAPPER */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">

        {/* ================= LEFT COLUMN ================= */}
        <div className="space-y-6">

          {/* Word card */}
          <WordCard
            word={currentWord.word}
            guessedLetters={
              isFailed
                ? new Set(
                    currentWord.word
                      .toUpperCase()
                      .split('')
                  )
                : guessedLetters
            }
            meaning={currentWord.meaning}
          />

          {/* On-screen keyboard */}
          {!isCompleted && !isFailed && (
            <div className="mt-6">
              <AlphabetButtons
                guessedLetters={guessedLetters}
                onGuess={handleGuess}
              />
            </div>
          )}

          {/* Completion panel */}
          {(isCompleted || isFailed) && (
            <CompleteDisplay
              word={currentWord.word}
              meaning={currentWord.meaning}
              examples={currentWord.examples}
              failed={isFailed}
            />
          )}

          {/* Article generation */}
          {failedWords.length >= 1 &&
            !showArticle && (
              <div className="text-center">
                <button
                  onClick={() =>
                    setShowArticle(true)
                  }
                  className="px-5 py-2 rounded-md border border-[#009CDE] text-[#009CDE] font-medium hover:bg-[#009CDE] hover:text-white transition"
                >
                  Generate Article
                </button>
              </div>
            )}

          {/* Article */}
          {showArticle &&
            failedWords.length > 0 && (
              <ArticlePanel
                failedWords={failedWords}
                onClose={() =>
                  setShowArticle(false)
                }
              />
            )}

          {/* Personal word */}
          <div className="border-t border-gray-200 pt-6 space-y-4">

            {personalWord && (
              <PersonalWordForm
                userProfile={userId}
              />
            )}

            <div className="text-center">
              <button
                onClick={() =>
                  setPersonalWord(
                    !personalWord
                  )
                }
                className="text-[#009CDE] font-medium hover:underline"
              >
                {!personalWord
                  ? 'Add Your Word'
                  : 'Close the Form'}
              </button>
            </div>

          </div>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="space-y-4">

          {/* Correct */}
          <div className="rounded-xl bg-gradient-to-br from-[#009CDE] to-[#2d76c0] p-6 text-white shadow-sm">
            <p className="text-sm opacity-90">
              Correct
            </p>

            <p className="text-4xl font-bold mt-1">
              {guessedLetters.size}
            </p>
          </div>

          {/* Incorrect */}
          <div className="rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] p-6 text-white shadow-sm">

            <p className="text-sm opacity-90">
              Incorrect
            </p>

            <p className="mt-1">
              <span className="font-medium">
                {incorrectGuesses.length}/
                {currentWord.word.length + 3}
              </span>
            </p>

            <p className="mt-1">
              Letters tried:{' '}
              <span className="font-medium">
                {incorrectGuesses
                  .join(', ')
                  .toUpperCase()}
              </span>
            </p>

          </div>

          {/* Hear word */}
          {(isCompleted || isFailed) && (
            <button
              onClick={() =>
                speakWord(
                  currentWord.word
                )
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#009CDE] text-[#009CDE] font-medium hover:bg-[#009CDE] hover:text-white transition"
            >
              🔊 Hear Word
            </button>
          )}

          {/* Next / New Game */}
          <button
            onClick={startNewGame}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-[#009CDE] text-white font-medium hover:bg-[#2d76c0] transition disabled:opacity-50"
          >
            {loading
              ? 'Loading...'
              : isCompleted || isFailed
                ? 'Start a new game'
                : 'Next Word'}
          </button>

        </aside>
      </div>
    </div>
  );
}

