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
  const [example, setExample] = useState<string>('');
 

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!word.trim() || !meaning.trim() || !example.trim()) return;
    console.log(userProfile)

    const { data: wordData, error: wordError } = await supabase
        .from('words')
        .insert({
          word,
          meaning,
          user_id: userProfile,    
          is_public: false,
        }).select()
          .single();
      console.log(wordData)    


    if (wordError){
        setError(wordError.message)
    } 
    
    if(example) {
      const { data: exampleData, error: exampleError } = await supabase
         .from("examples")
         .insert({
          word_id: wordData.id,
          example_standard: example,
         }).select()
           .single();
      if (exampleError){
        setError(exampleError.message) 
    }      
    console.log(exampleData);
    }

    


   
  
    setSuccessMessage(`"${word}" has been added`);
    setWord('');
    setMeaning('');
    setExample('');
  };

  return (
    <div>
        {error && <p>{error}</p>}
        {successMessage && <p>{successMessage}</p> }
    <form onSubmit={handleSubmit}>

      <label>
          YOUR WORD
      </label>
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />

      <label>MEANING</label>
      <input
        type="text"
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
      />
       <label>EXAMPLE</label>
      <input
        type="text"
        value={example}
        onChange={(e) => setExample(e.target.value)}
      />

      <button
        type="submit"
        disabled={!word.trim() || !meaning.trim() || !example.trim()} // disable if empty
      >
        Add word
      </button>
    </form>
    </div>
  );
}