'use client'
import { useState, useEffect } from 'react';
import { supabase } from "@/app/lib/supabaseClient";
import {word_with_examples} from "@/app/types/database";
import WordCard from './WordCard';
import WordMeaning from './WordMeaning';
import CompleteDisplay from './CompleteDisplay';
import PersonalWordForm from './PersonalWordForm';
import { useRouter } from "next/navigation";
import ArticlePanel from './ArticlePanel';

interface GameBoard {
    userId: string
}
export default function GameBoard({userId}: GameBoard) {
    const [currentWord, setCurrentWord] = useState<word_with_examples | null>(null);
    const [guessedLetters, setGuessedLetters] = useState <Set <string>>(new Set())
    const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([])
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isCompleted, setIsCompleted] = useState(false)
    const [isFailed, setIsFailed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [personalWord, setPersonalWord] = useState(false)
    // Track last 5 failed words for article generation
    const [failedWords, setFailedWords] = useState<{ word: string; definition: string }[]>([]);
    // Show article panel
    const [showArticle, setShowArticle] = useState(false);
    const router = useRouter(); 

    

    console.log(userId)
    function isComplete(word: string, guessed: Set <string>){
        const word_letters=word.toUpperCase().split("")

       for (const letter of word_letters){
        if (!guessed.has(letter)){
            return false
        }

       }
       return true    
       
    }
    async function startNewGame(){
        setLoading(true);
        setError('');
        setGuessedLetters(new Set())
        setIncorrectGuesses([])
        setIsCompleted(false)
        setIsFailed(false)
        
        const {data: words, error: wordError} = await supabase.from("words").select("*").or(`is_public.eq.true, user_id.eq.${userId}`)
        console.log(words, wordError)
        
        if (!words || words.length == 0){
            setError("No words available")
            setLoading(false)
        }
        if(wordError){
            setError(wordError.message)
            setLoading(false)
            return
        } 
        const randomNumber = Math.floor(Math.random() * words.length) 
        const randomWord = words[randomNumber];
        // console.log(randomWord)
        const {data: examples, error: examplesError} = await supabase.from("examples").select("*").eq("word_id", randomWord.id)
        if(examplesError){
            setError(examplesError.message)
            setLoading(false)
            return
        }
        setCurrentWord({...randomWord, examples:examples || []})
       


        // another query for the session
        const {data: session, error: sessionError} = await supabase.from("game_sessions").insert({user_id: userId, word_id:randomWord.id, status: false, correct_guesses:false}).select().single()
      
        if(sessionError){
            setError(sessionError.message)
            setLoading(false)
            return
        }
        setSessionId(session.id)
        setLoading(false)
        console.log(session.id, userId)
        
     
    }
    
    useEffect(() => {
  // wrap async call
  (async () => {
    await startNewGame();
  })();
}, []);
   
// listen for keyboard input and translate this into game, update the state 
    useEffect(() => {
    async function handleKeyPress(e: KeyboardEvent){
         // Ignore keypresses if the focus is inside an input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
    ) {
        return;
    }

    // clear the error automatically after a couple of seconds so it doesn’t linger:
        if(!/^[a-zA-Z]$/.test(e.key)){
            setError("You need to choose a letter")
            setTimeout(() => setError(''), 2000); // clears after 2 seconds
            return
        } 
        if(isCompleted || isFailed || loading || !currentWord){
    
            return 
        }
        const letter = e.key.toUpperCase()
        if(guessedLetters.has(letter) || incorrectGuesses.includes(letter)){
            // setError("You already used that letter")
            return 
        }
        // the state is not update if we push directly the letter to the state. Created a new set and 
        // updated the state with the new set. Otherwise React would not rerender
        if (currentWord.word.toUpperCase().includes(letter)){
            const newGuess = new Set(guessedLetters)
            newGuess.add(letter)
            setGuessedLetters(newGuess)
        if(isComplete(currentWord.word, newGuess)){
            setIsCompleted(true)
        console.log(isCompleted)
        if(sessionId){
            const { data, error } = await supabase
                .from("game_sessions")
                .update({ status: true, correct_guesses: true })
                .eq("id", sessionId)

  console.log("update result:", data, error)

            // const {data, error} = supabase.from("game_sessions").update({status:true, correct_guesses:true}).eq("id", sessionId)
            // console.log(data, error)
        }
        // dispatching event to the header. Telling it to update
        window.dispatchEvent(new Event("wordCompleted"))    
        }  

        }
        else {
             const MAX_GUESSES = currentWord.word.length+3
            const newIncorrectGuesses =[...incorrectGuesses, letter] 
            setIncorrectGuesses(newIncorrectGuesses)
            if (newIncorrectGuesses.length >= MAX_GUESSES){
                setIsFailed(true)
                console.log(isFailed)   
                if(sessionId){
            await supabase.from("game_sessions").update({status:true, correct_guesses:false}).eq("id", sessionId)

        }
    
            setFailedWords((prev) => {
            const newFailed = [
            ...prev,
            { word: currentWord.word, definition: currentWord.meaning },
            ];
            // Keep only last 5
            return newFailed.slice(-5);
            });
        window.dispatchEvent(new Event("wordFailed"))   
            }
        
        }      
    }
    window.addEventListener("keypress", handleKeyPress)
    // clean -up by using remove event listener 
    // using in [] all states that need this useEffect when state is updated this useEffect will run
    // if empty [] useEffect runs only once on mount. 
    return ()=> window.removeEventListener("keypress", handleKeyPress)
    }, [currentWord, isFailed, isCompleted, incorrectGuesses, sessionId, guessedLetters, loading])

    if (!currentWord){
        return (
            <div>
                <p>No words to guess.</p>
            </div>
        )
    }

    function speakWord(word: string) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);  
}
return (
  <div className="max-w-7xl mx-auto px-6 py-8">

    {/* Error */}
    {error && (
      <p className="mb-4 text-red-600 text-sm font-medium">
        {error}
      </p>
    )}

    {/* GRID WRAPPER */}
    <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">

      {/* ================= LEFT COLUMN (70%) ================= */}
      <div className="space-y-6">

        {/* Word card */}
        <WordCard 
          word={currentWord.word}
          guessedLetters={
            isFailed
              ? new Set(currentWord.word.toUpperCase().split(""))
              : guessedLetters
          }
          meaning={currentWord.meaning}
        />

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
        {failedWords.length >= 1 && !showArticle && (
          <div className="text-center">
            <button
              onClick={() => setShowArticle(true)}
              className="px-5 py-2 rounded-md border border-[#009CDE] text-[#009CDE] font-medium hover:bg-[#009CDE] hover:text-white transition"
            >
              Generate Article
            </button>
          </div>
        )}

        {showArticle && failedWords.length > 0 && (
          <ArticlePanel
            failedWords={failedWords}
            onClose={() => setShowArticle(false)}
          />
        )}

        {/* Personal word */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          {personalWord && <PersonalWordForm userProfile={userId} />}

          <div className="text-center">
            <button
              onClick={() => setPersonalWord(!personalWord)}
              className="text-[#009CDE] font-medium hover:underline"
            >
              {!personalWord ? "Add Your Word" : "Close the Form"}
            </button>
          </div>
        </div>

      </div>

      {/* ================= RIGHT SIDEBAR (30%) ================= */}
      <aside className="space-y-4">

        {/* Correct */}
        <div className="rounded-xl bg-gradient-to-br from-[#009CDE] to-[#2d76c0] p-6 text-white shadow-sm">
          <p className="text-sm opacity-90">Correct</p>
          <p className="text-4xl font-bold mt-1">{guessedLetters.size}</p>
        </div>

        {/* Incorrect */}
        <div className="rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] p-6 text-white shadow-sm">
          <p className="text-sm opacity-90">Incorrect</p>
          <p className="mt-1">
            <span className="font-medium">
              {incorrectGuesses.length}/{currentWord.word.length + 3}
            </span>
          </p>
          <p className="mt-1">
            Letters tried:{" "}
            <span className="font-medium">
              {incorrectGuesses.join(", ").toUpperCase()}
            </span>
          </p>
        </div>

        {/* Hear word */}
        {(isCompleted || isFailed) && (
          <button
            onClick={() => speakWord(currentWord.word)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#009CDE] text-[#009CDE] font-medium hover:bg-[#009CDE] hover:text-white transition"
          >
            🔊 Hear Word
          </button>
        )}

        {/* Next / New Game */}
        <button
          onClick={startNewGame}
          className="w-full px-4 py-3 rounded-lg bg-[#009CDE] text-white font-medium hover:bg-[#2d76c0] transition"
        >
          {isCompleted || isFailed ? "Start a new game" : "Next Word"}
        </button>

      </aside>

    </div>
  </div>
);

}



    
        

    

