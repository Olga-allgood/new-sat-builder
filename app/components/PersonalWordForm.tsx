'use client';

import { supabase } from "@/app/lib/supabaseClient";
import { useState, FormEvent } from 'react';

interface PersonalWordFormProps {
  userProfile: string;
}

export default function PersonalWordForm({ userProfile }: PersonalWordFormProps) {
  const [word, setWord] = useState<string>('');
  const [meaning, setMeaning] = useState<string>(''); 
  const [error, setError] = useState<string>('');
 

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!word.trim() || !meaning.trim()) return;
    console.log(userProfile)

    const { data, error } = await supabase
        .from('words')
        .insert({
          word,
          meaning,
          user_id: userProfile,    
          is_public: false,
        });
    if (error){
        setError(error.message)
    }    


    console.log('Personal word:', word);
    console.log('Meaning:', meaning);

    setWord('');
    setMeaning('');
  };

  return (
    <div>
        <p>{error}</p>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Add your personal word"
      />

      <input
        type="text"
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        placeholder="Add the meaning"
      />

      <button
        type="submit"
        disabled={!word.trim() || !meaning.trim()} // disable if empty
      >
        Add word
      </button>
    </form>
    </div>
  );
}