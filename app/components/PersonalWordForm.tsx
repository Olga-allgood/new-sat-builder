'use client';

import { supabase } from "@/app/lib/supabaseClient";
import { useState, FormEvent } from 'react';

interface PersonalWordFormProps {
  userProfile: string;
}

export default function PersonalWordForm({ userProfile }: PersonalWordFormProps) {
  const [word, setWord] = useState<string>('');
  const [meaning, setMeaning] = useState<string>(''); 
  const [successMessage, setSuccessMessage] = useState<string>('');
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
        }).select()
    if (error){
        setError(error.message)
    }    


    console.log(data);
  
    setSuccessMessage(`"${word}" has been added`);

    setWord('');
    setMeaning('');
  };

  return (
    <div>
        {error && <p>{error}</p>}
        {successMessage && <p>{successMessage}</p> }
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