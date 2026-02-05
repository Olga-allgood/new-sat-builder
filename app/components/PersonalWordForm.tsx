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

  // return (
  //   <div>
  //       {error && <p>{error}</p>}
  //       {successMessage && <p>{successMessage}</p> }
  //   <form onSubmit={handleSubmit}>

  //     <label>
  //         YOUR WORD
  //     </label>
  //     <input
  //       type="text"
  //       value={word}
  //       onChange={(e) => setWord(e.target.value)}
  //     />

  //     <label>MEANING</label>
  //     <input
  //       type="text"
  //       value={meaning}
  //       onChange={(e) => setMeaning(e.target.value)}
  //     />
  //      <label>EXAMPLE</label>
  //     <input
  //       type="text"
  //       value={example}
  //       onChange={(e) => setExample(e.target.value)}
  //     />

  //     <button
  //       type="submit"
  //       disabled={!word.trim() || !meaning.trim() || !example.trim()} // disable if empty
  //     >
  //       Add word
  //     </button>
  //   </form>
  //   </div>
  // );
return (
  <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-6 space-y-4">
    {error && <p className="text-red-600 font-medium">{error}</p>}
    {successMessage && (
      <p className="text-green-700 font-medium">{successMessage}</p>
    )}

    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">YOUR WORD</label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">MEANING</label>
        <input
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">EXAMPLE</label>
        <input
          type="text"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
        />
      </div>

      <button
        type="submit"
        disabled={!word.trim() || !meaning.trim() || !example.trim()}
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