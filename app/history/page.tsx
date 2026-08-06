'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

interface Example {
  example_standard: string;
  example_funny: string | null;
}

interface HistoryWord {
  id: string;
  word: string;
  meaning: string;
  is_public: boolean | null;
  examples: Example[] | null;
}

interface GameHistory {
  id: string;
  word_id: string;
  status: boolean | null;
  correct_guesses: boolean | null;
  words: {
    word: string;
    meaning: string;
  } | null;
}

interface FailedWord {
  word: string;
}

interface LearningArticle {
  id: string;
  user_id: string | null;
  article: string;
  failed_words: FailedWord[] | null;
  created_at: string | null;
}

export default function HistoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [correctGuesses, setCorrectGuesses] = useState<GameHistory[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState<GameHistory[]>([]);
  const [myWords, setMyWords] = useState<HistoryWord[]>([]);
  const [error, setError] = useState('');
  const [articles, setArticles] = useState<LearningArticle[]>([]);

  useEffect(() => {
    async function FetchGames() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      /* ------------------ Correct Guesses ------------------ */

      const {
        data: completedWords,
        error: errorCompletedWords,
      } = await supabase
        .from('game_sessions')
        .select(`
          id,
          word_id,
          status,
          correct_guesses,
          words!game_sessions_word_id_fkey(
            word,
            meaning
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', true)
        .eq('correct_guesses', true)
        .returns<GameHistory[]>();

      if (errorCompletedWords) {
        setError(errorCompletedWords.message);
      } else {
        setCorrectGuesses(completedWords ?? []);
      }

      /* ------------------ Incorrect Guesses ------------------ */

      const {
        data: incompleteWords,
        error: errorIncompleteWords,
      } = await supabase
        .from('game_sessions')
        .select(`
          id,
          word_id,
          status,
          correct_guesses,
          words!game_sessions_word_id_fkey(
            word,
            meaning
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', true)
        .eq('correct_guesses', false)
        .returns<GameHistory[]>();

      if (errorIncompleteWords) {
        setError(errorIncompleteWords.message);
      } else {
        setIncorrectGuesses(incompleteWords ?? []);
      }

      /* ------------------ My Words ------------------ */

      /*
        Personal words are stored in the `words` table.

        The connection between the learner and the word
        is stored in `game_sessions`:

        game_sessions.user_id
                  ↓
        game_sessions.word_id
                  ↓
              words.id
      */

      const {
        data: wordsData,
        error: wordsError,
      } = await supabase
        .from('game_sessions')
        .select(`
          word_id,
          words!game_sessions_word_id_fkey(
            id,
            word,
            meaning,
            is_public,
            examples!examples_word_id_fkey(
              example_standard,
              example_funny
            )
          )
        `)
        .eq('user_id', session.user.id)
        .eq('words.is_public', false);

      if (wordsError) {
        setError(wordsError.message);
      } else {
        /*
          A learner might have more than one game session
          for the same word, so remove duplicates.
        */

        const personalWords = Array.from(
          new Map(
            (wordsData ?? [])
              .map((item) => item.words)
              .filter(
                (word): word is HistoryWord => word !== null
              )
              .map((word) => [word.id, word])
          ).values()
        );

        personalWords.sort((a, b) =>
          a.word.localeCompare(b.word)
        );

        setMyWords(personalWords);
      }

      /* ------------------ Learning Articles ------------------ */

      const {
        data: articlesData,
        error: articlesError,
      } = await supabase
        .from('learning_articles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (articlesError) {
        setError(articlesError.message);
      } else {
        setArticles(articlesData ?? []);
      }

      setLoading(false);
    }

    FetchGames();

    /* ------------------ Auth Listener ------------------ */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  /* ------------------ Error ------------------ */

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600">
          There is an error: {error}
        </p>
      </div>
    );
  }

  /* ------------------ Loading ------------------ */

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">
          Loading history...
        </p>
      </div>
    );
  }

  /* ------------------ Page ------------------ */

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <h1 className="text-3xl font-semibold text-[#2d76c0] text-center">
        Game History
      </h1>

      {/* ------------------ Correct Guesses ------------------ */}

      <div className="bg-gray-50 border rounded-md p-4">

        <h2 className="font-medium text-gray-700">
          Correct Guesses: {correctGuesses.length}
        </h2>

        {correctGuesses.length === 0 ? (
          <p className="text-gray-500 mt-3">
            No correct guesses yet.
          </p>
        ) : (
          correctGuesses.map((item) => (
            <div
              key={item.id}
              className="p-2 border-b"
            >
              <p className="font-medium">
                {item.words?.word}
              </p>

              <p>
                {item.words?.meaning}
              </p>
            </div>
          ))
        )}

      </div>

      {/* ------------------ Incorrect Guesses ------------------ */}

      <div className="bg-gray-50 border rounded-md p-4">

        <h2 className="font-medium text-gray-700">
          Incorrect Guesses: {incorrectGuesses.length}
        </h2>

        {incorrectGuesses.length === 0 ? (
          <p className="text-gray-500 mt-3">
            No incorrect guesses yet.
          </p>
        ) : (
          incorrectGuesses.map((item) => (
            <div
              key={item.id}
              className="p-2 border-b"
            >
              <p className="font-medium">
                {item.words?.word}
              </p>

              <p>
                {item.words?.meaning}
              </p>
            </div>
          ))
        )}

      </div>

      {/* ------------------ My Words ------------------ */}

      <div className="bg-gray-50 border rounded-md p-4">

        <h2 className="font-medium text-gray-700">
          My Words
        </h2>

        {myWords.length === 0 ? (
          <p className="text-gray-500 mt-3">
            No words available.
          </p>
        ) : (
          <ul className="space-y-3 mt-3">

            {myWords.map((word) => (
              <li
                key={word.id}
                className="border-b pb-3"
              >

                <p>
                  <span className="font-medium">
                    {word.word}
                  </span>

                  {' '}– {word.meaning}
                </p>

                {word.examples?.map((example, index) => (
                  <p
                    key={index}
                    className="text-sm text-gray-600 ml-4 mt-1"
                  >
                    Example: {example.example_standard}
                  </p>
                ))}

              </li>
            ))}

          </ul>
        )}

      </div>

      {/* ------------------ Learning Articles ------------------ */}

      <section>

        <h2 className="text-lg font-semibold mb-4">
          📚 Learning Articles
        </h2>

        {articles.length === 0 ? (
          <p className="text-gray-500">
            No learning articles yet.
          </p>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="border rounded p-4 mb-4"
            >

              <p className="text-xs text-gray-500">
                {article.created_at
                  ? new Date(article.created_at).toLocaleString()
                  : 'Unknown date'
                }
              </p>

              <p className="whitespace-pre-wrap mt-2">
                {article.article}
              </p>

              {article.failed_words && (
                <div className="flex gap-2 mt-3 flex-wrap">

                  {article.failed_words.map((word, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {word.word}
                    </span>
                  ))}

                </div>
              )}

            </div>
          ))
        )}

      </section>

    </div>
  );
}