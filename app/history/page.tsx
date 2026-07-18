'use client'

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

      const { data: { session } } = await supabase.auth.getSession();


      if (!session) {
        router.push('/login');
        return;
      }


      // Correct guesses
      const { data: completedWords, error: errorCompletedWords } =
        await supabase
          .from("game_sessions")
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
          .eq("user_id", session.user.id)
          .eq("status", true)
          .eq("correct_guesses", true)
          .returns<GameHistory[]>();


      if (errorCompletedWords) {
        setError(errorCompletedWords.message);
      } else {
        setCorrectGuesses(completedWords ?? []);
      }



      // Incorrect guesses
      const { data: incompleteWords, error: errorIncompleteWords } =
        await supabase
          .from("game_sessions")
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
          .eq("user_id", session.user.id)
          .eq("status", true)
          .eq("correct_guesses", false)
          .returns<GameHistory[]>();


      if (errorIncompleteWords) {
        setError(errorIncompleteWords.message);
      } else {
        setIncorrectGuesses(incompleteWords ?? []);
      }



      // All words with examples
      const { data: wordsData, error: wordsError } =
        await supabase
          .from("words")
          .select(`
            id,
            word,
            meaning,
            examples!examples_word_id_fkey(
              example_standard,
              example_funny
            )
          `);


      if (wordsError) {
        setError(wordsError.message);
      } else {
        setMyWords(wordsData ?? []);
      }



      // Learning Articles
      const { data: articlesData, error: articlesError } =
        await supabase
          .from("learning_articles")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });


      if (articlesError) {
        setError(articlesError.message);
      } else {
        setArticles(articlesData ?? []);
      }


      setLoading(false);

    }


    FetchGames();


    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {

        if (!session) {
          router.push('/login');
        }

      });


    return () => subscription.unsubscribe();


  }, [router]);



  if (error) {
    return (
      <h2 className="text-red-600">
        There is an error: {error}
      </h2>
    );
  }



  return (
    <div className="min-h-screen bg-white px-6 py-8">

      <div className="max-w-4xl mx-auto space-y-8">


        <h1 className="text-3xl font-semibold text-[#2d76c0] text-center">
          Game History
        </h1>



        {/* Correct Guesses */}

        <div className="bg-gray-50 border rounded-md p-4">

          <h2 className="font-medium text-gray-700">
            Correct Guesses: {correctGuesses.length}
          </h2>


          {correctGuesses.map(item => (

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

          ))}

        </div>




        {/* Incorrect Guesses */}

        <div className="bg-gray-50 border rounded-md p-4">

          <h2 className="font-medium text-gray-700">
            Incorrect Guesses: {incorrectGuesses.length}
          </h2>


          {incorrectGuesses.map(item => (

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

          ))}

        </div>





        {/* My Words */}

        <div className="bg-gray-50 border rounded-md p-4">

          <h2 className="font-medium text-gray-700">
            My Words
          </h2>


          {myWords.length === 0 ? (

            <p className="text-gray-500">
              No words available
            </p>

          ) : (

            <ul className="space-y-3 mt-3">

              {myWords.map(word => (

                <li key={word.id}>

                  <p>
                    <span className="font-medium">
                      {word.word}
                    </span>
                    {" "}– {word.meaning}
                  </p>


                  {word.examples?.map((example,index)=>(

                    <p 
                      key={index}
                      className="text-sm text-gray-600 ml-4"
                    >
                      Example: {example.example_standard}
                    </p>

                  ))}

                </li>

              ))}

            </ul>

          )}

        </div>






        {/* Learning Articles */}

        <section>

          <h2 className="text-lg font-semibold mb-4">
            📚 Learning Articles
          </h2>



          {articles.map(article => (

            <div
              key={article.id}
              className="border rounded p-4 mb-4"
            >

              <p className="text-xs text-gray-500">
                {article.created_at
                  ? new Date(article.created_at).toLocaleString()
                  : "Unknown date"
                }
              </p>


              <p className="whitespace-pre-wrap mt-2">
                {article.article}
              </p>



              {article.failed_words && (

                <div className="flex gap-2 mt-3 flex-wrap">

                  {article.failed_words.map((word,index)=>(

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

          ))}


        </section>



      </div>

    </div>
  );
}