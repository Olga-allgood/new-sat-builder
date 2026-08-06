'use client';

import { supabase } from "@/app/lib/supabaseClient";
import { useState, FormEvent } from 'react';

interface PersonalWordFormProps {
  userProfile: string;
}

export default function PersonalWordForm({
  userProfile,
}: PersonalWordFormProps) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!word.trim() || !meaning.trim()) {
      return;
    }

    /* ------------------ 1. Check authentication ------------------ */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError('You must be logged in to add a word.');
      return;
    }

    console.log('Authenticated user:', user.id);

    /* ------------------ 2. Insert word ------------------ */

    const {
      data: wordData,
      error: wordError,
    } = await supabase
      .from('words')
      .insert({
        word: word.trim(),
        meaning: meaning.trim(),
        is_public: false,
      })
      .select()
      .single();

    if (wordError || !wordData) {
      console.error('Word insert error:', wordError);

      setError(
        wordError?.message || 'Failed to add word'
      );

      return;
    }

    console.log('Word created:', wordData);

    /* ------------------ 3. Create game session ------------------ */

    const { error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        word_id: wordData.id,
        status: false,
        correct_guesses: false,
      });

    if (sessionError) {
      console.error(
        'Game session insert error:',
        sessionError
      );

      setError(sessionError.message);
      return;
    }

    /* ------------------ 4. Success ------------------ */

    setSuccessMessage(`"${word}" has been added`);

    setWord('');
    setMeaning('');
  };

  return (
    <div>

      {error && (
        <p className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="mb-4 text-green-600">
          {successMessage}
        </p>
      )}

      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >

        <div className="flex flex-col">
          <label className="font-medium text-gray-700">
            YOUR WORD
          </label>

          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="
              mt-1 px-3 py-2
              border border-gray-300
              rounded-md
              focus:ring-2
              focus:ring-[#009CDE]
            "
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700">
            MEANING
          </label>

          <input
            type="text"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className="
              mt-1 px-3 py-2
              border border-gray-300
              rounded-md
              focus:ring-2
              focus:ring-[#009CDE]
            "
          />
        </div>

        <button
          type="submit"
          disabled={!word.trim() || !meaning.trim()}
          className="
            w-full px-4 py-2 rounded-md
            bg-[#009CDE] text-white font-medium
            hover:bg-[#2d76c0]
            disabled:opacity-50
            transition
          "
        >
          Add Word
        </button>

      </form>

    </div>
  );
}