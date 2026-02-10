'use client'
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
// import {word} from '@/app/types/database';

interface WordWithExample {id: string, word: string, meaning: string, examples:{example_standard:string}}
// interface GameHistory {id:string, word_id:string, status: boolean, correct_guesses:boolean, words:word|word[]|null } 
interface GameHistory {
  id: string;
  word_id: string;
  status: boolean;
  correct_guesses: boolean;
  words: WordWithExample | WordWithExample[] | null;
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



function getWordData(words:WordWithExample|WordWithExample[]|null){
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
    const [myWords, setMyWords] = useState<WordWithExample[]>([]);
    const [error, setError] = useState('');
    const [articles, setArticles] = useState<LearningArticle[]>([]);

    useEffect(()=> {
        async function FetchGames (){
            setLoading(true);
            const {data:{session}} = await supabase.auth.getSession()
            if (!session){
                router.push('/login')
                return 
            }
            
            const {data:completedWords, error: errorCompletedWords} = await supabase.from("game_sessions").select("id, word_id, status, correct_guesses, words(word,meaning)").eq("user_id", session.user.id).eq("status", true).eq("correct_guesses", true);

                console.log(completedWords)
            if(errorCompletedWords){
              setError(errorCompletedWords.message)

            }
            
            else{setCorrectGuesses((completedWords as GameHistory[])||[])}

            const {data:IncompletedWords, error: errorIncompletedWords} = 
                  await supabase
                    .from("game_sessions")
                    .select("id, user_id, word_id, status, correct_guesses, words(word,meaning)")
                    .eq("user_id", session.user.id)
                    .eq("status", true)
                    .eq("correct_guesses", false);
                    console.log(IncompletedWords)
                    console.log(correctGuesses)
                    console.log(incorrectGuesses)
                  if(errorIncompletedWords){
                  setError(errorIncompletedWords.message)
          
                  }
                 
                else{setIncorrectGuesses((IncompletedWords as GameHistory[])||[])}

            const {data:myWords, error:myWordError} = 
                await supabase
                .from("words")
                .select("id, word, meaning, examples!words_example_id_fkey(example_standard)")
                .eq("user_id", session.user.id)
            
                if(myWordError){
                  setError(myWordError.message)

                }
                else{setMyWords(myWords || [])}
                console.log(myWords)
            


            setCorrectGuesses((completedWords as GameHistory[])||[])
            setIncorrectGuesses((IncompletedWords as GameHistory[])||[])
            
            // fetching articles
            const { data: articlesData, error: articlesError } =
                await supabase
                  .from("learning_articles")
                  .select("*")
                  .eq("user_id", session.user.id)
                  .order("created_at", { ascending: false });

                if (articlesError) {
                  setError(articlesError.message);
                } else {
                  setArticles(articlesData || []);
                }

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

return (
  <div className="min-h-screen bg-white px-6 py-8">
    <div className="max-w-4xl mx-auto space-y-8">

      <h1 className="text-3xl font-semibold text-[#2d76c0] text-center">
        Game History
      </h1>

      {/* Correct guesses */}
      <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4 space-y-2">
        <h2 className="font-medium text-gray-700">
          Correct Guesses: {correctGuesses.length}
        </h2>

        {correctGuesses.length === 0 ? (
          <p className="text-gray-500">No words guessed</p>
        ) : (
          <div className="space-y-1">
            {correctGuesses.map((item) => (
              <div key={item.id} className="p-2 border-b border-gray-200">
                <p className="font-medium">
                  {getWordData(item.words)?.word}
                </p>
                <p className="text-gray-700">
                  {getWordData(item.words)?.meaning}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incorrect guesses */}
      <div className="bg-gray-50 border border-[#787b80]/30 rounded-md p-4 space-y-2">
        <h2 className="font-medium text-gray-700">
          Incorrect Guesses: {incorrectGuesses.length}
        </h2>

        {incorrectGuesses.length === 0 ? (
          <p className="text-gray-500">No incorrect guesses</p>
        ) : (
          <div className="space-y-1">
            {incorrectGuesses.map((item) => (
              <div key={item.id} className="p-2 border-b border-gray-200">
                <p className="font-medium">
                  {getWordData(item.words)?.word}
                </p>
                <p className="text-gray-700">
                  {getWordData(item.words)?.meaning}
                </p>
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
                <span className="font-medium">{item.word}</span> – {item.meaning}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Learning Articles */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          📚 Learning Articles
        </h2>

        {articles.length === 0 ? (
          <p className="text-sm text-gray-500">
            No articles generated yet.
          </p>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <div
                key={a.id}
                className="rounded border border-gray-200 p-4 bg-white"
              >
                <p className="text-xs text-gray-500 mb-2">
                  {/* {new Date(a.created_at).toLocaleString()} */}
                  {a.created_at
                  ? new Date(a.created_at).toLocaleString()
                  : 'Unknown date'}
                </p>

                <p className="whitespace-pre-wrap text-gray-700">
                  {a.article}
                </p>

                {a.failed_words && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.failed_words.map((w, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700"
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  </div>
);

    
}