'use client'
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import {word} from '@/app/types/database';

interface GameHistory {id:string, word_id:string, status: boolean, correct_guesses:boolean, words:word|word[]|null } 


function getWordData(words:word|word[]|null){
    if(!words){
        return null
    }
    if (Array.isArray(words)){
        return words[0]|| null
    }
    return words

}
export default function HistoryPage(){
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const [correctGuesses, setCorrectGuesses] = useState<GameHistory[]>([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState<GameHistory[]>([]);
    const [myWords, setMyWords] = useState<word[]>([]);
    const [error, setError] = useState('');

    useEffect(()=> {
        async function FetchGames (){
            setLoading(true);
            const {data:{session}} = await supabase.auth.getSession()
            if (!session){
                router.push('/login')
                return 
            }
            
            const {data:completedWords, error: errorCompletedWords} = await supabase.from("game_sessions").select("id, word_id, status, correct_guesses, words(word,meaning)").eq("user_id", session.user.id).eq("correct_guesses", true);

                
            if(errorCompletedWords){
              setError(errorCompletedWords.message)

            }
            
            else{setCorrectGuesses((completedWords as GameHistory[])||[])}

            const {data:IncompletedWords, error: errorIncompletedWords} = await supabase.from("game_sessions").select("id, word_id, status, correct_guesses, words(word,meaning)").eq("user_id", session.user.id).eq("correct_guesses", false);
               if(errorIncompletedWords){
              setError(errorIncompletedWords.message)

            }
            
            else{setIncorrectGuesses((IncompletedWords as GameHistory[])||[])}

            const {data:myWords, error:myWordError} = await supabase.from("words").select("*").eq("user_id", session.user.id)
            
            if(myWordError){
              setError(myWordError.message)

            }
            else{setMyWords(myWords || [])}


            setCorrectGuesses((completedWords as GameHistory[])||[])
            setIncorrectGuesses((IncompletedWords as GameHistory[])||[])
            setLoading(false)
        }
        FetchGames()
        const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, session)=> {
            if (!session){
                router.push('/login')
            }
        
        })
        
        return ()=>subscription.unsubscribe()
    }, [router])
     
     if(error){
        return (
            <h2>`There is an error: ${error}`</h2>
        )
     }
    //  return (
    //     <div>
            
    //         <h1>Game History</h1>
    //         <div>
    //             <p>Correct Guesses: {correctGuesses.length}</p>
    //             {correctGuesses.length==0?<p>No Words Guessed</p>:<div>{correctGuesses.map((item)=>
    //                 (<div key={item.id}><p>{getWordData(item.words)?.word}</p>
    //                                      <p>{getWordData(item.words)?.meaning}</p>
    //                 </div>))}</div>}

    //         </div>  

    //         <div>
    //             <p>Incorrect Guesses: {incorrectGuesses.length}</p>
    //             {incorrectGuesses.length==0?<p>No incorrect guesses</p>:<div>{incorrectGuesses.map((item)=>
    //                 (<div key={item.id}><p>{getWordData(item.words)?.word}</p>
    //                                      <p>{getWordData(item.words)?.meaning}</p>
    //                 </div>))}</div>}

    //         </div>  
    //         <div>
    //             <h2>My Words</h2>
    //             {myWords.length ==0?<p>No words have been added</p>: 
    //             <ul>
    //                 {myWords.map((item)=>
    //                 (<li key={item.id}>{item.word} - {item.meaning}</li>))}
    //             </ul>}
    //         </div>

    //     </div>
    //  )
     
return (
  <div className="min-h-screen bg-white px-6 py-8">
    <div className="max-w-4xl mx-auto space-y-8">

      <h1 className="text-3xl font-semibold text-[#2d76c0] text-center">Game History</h1>

      {/* Correct guesses */}
      <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4 space-y-2">
        <h2 className="font-medium text-gray-700">Correct Guesses: {correctGuesses.length}</h2>
        {correctGuesses.length === 0 ? (
          <p className="text-gray-500">No words guessed</p>
        ) : (
          <div className="space-y-1">
            {correctGuesses.map((item) => (
              <div key={item.id} className="p-2 border-b border-gray-200">
                <p className="font-medium">{getWordData(item.words)?.word}</p>
                <p className="text-gray-700">{getWordData(item.words)?.meaning}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incorrect guesses */}
      <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4 space-y-2">
        <h2 className="font-medium text-gray-700">Incorrect Guesses: {incorrectGuesses.length}</h2>
        {incorrectGuesses.length === 0 ? (
          <p className="text-gray-500">No incorrect guesses</p>
        ) : (
          <div className="space-y-1">
            {incorrectGuesses.map((item) => (
              <div key={item.id} className="p-2 border-b border-gray-200">
                <p className="font-medium">{getWordData(item.words)?.word}</p>
                <p className="text-gray-700">{getWordData(item.words)?.meaning}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Words */}
      <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4 space-y-2">
        <h2 className="font-medium text-gray-700">My Words</h2>
        {myWords.length === 0 ? (
          <p className="text-gray-500">No words have been added</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {myWords.map((item) => (
              <li key={item.id}>
                <span className="font-medium">{item.word}</span> - {item.meaning}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  </div>
);


    
}