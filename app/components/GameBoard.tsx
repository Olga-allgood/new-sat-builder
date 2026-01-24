'use client'
import { useState, useEffect } from 'react';
import { supabase } from "@/app/lib/supabaseClient";
import {word_with_examples} from "@/app/types/database";

interface GameBoard {
    id: string
}
export default function GameBoard({userId}: GameBoard) {
    const [currentWord, setCurrentWord] = useState<word_with_examples | null>(null);
    const [guessedLetters, setGuessedLetters] = useState <Set <string>>(new Set)
    const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([])
    const [sessionId, setSessionId] = useState(null)
    const [isCompleted, setIsCompleted] = useState(false)
    const [isFailed, setIsFailed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')


    function isComplete(word: string, guessed: Set <string>){
        const word_letters=word.toLowerCase().split("")

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
        
        const {data: words, error: wordError} = await supabase.from("words").select("*")
        if (words.length == 0){
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

        const {data: examples, error: examplesError} = await supabase.from("examples").select("*").eq("word_id", randomWord.id)
        if(examplesError){
            setError(examplesError.message)
            setLoading(false)
            return
        }
        setCurrentWord({...randomWord, examples:examples || []})
        const MAX_CUESSES = currentWord.word.length*2


        // another query for the session
        const {data: session, error: sessionError} = await supabase.from("game_sessions").insert({user_id: userId, word_id:randomWord.id, status: false, correct_guesses:0, incorrect_guesses:0}).select().single()

        if(sessionError){
            setError(sessionError.message)
            setLoading(false)
            return
        }
        setSessionId(session.id)
        setLoading(false)
     
    }
    useEffect(() => {
  // wrap async call
  (async () => {
    await startNewGame();
  })();
}, []);
   



// listen for keyboard input and translate this into game, update the state 
    useEffect(() => {
    function handleKeyPress(e: KeyboardEvent){
        if(!/^[a-zA-Z]$/.test(e.key)){
            setError("You need to choose a letter")
            return
        } 
        if(isCompleted || isFailed || loading){
            return 
        }
        const letter = e.key.toLowerCase()
        if(guessedLetters.has(letter) || incorrectGuesses.includes(letter)){
            setError("You already used that letter")
            return 
        }
        // the state is not update if we push directly the letter to the state. Created a new set and 
        // updated the state with the new set. Otherwise React would not rerender
        if (currentWord.word.toLowerCase().includes(letter)){
            const newGuess = new Set(guessedLetters)
            newGuess.add(letter)
            setGuessedLetters(newGuess)
        if(isComplete(currentWord.word, newGuess)){
            setIsCompleted(true)
        if(sessionId){
            supabase.from("game_sessions").update({status:true, correct_guesses:true}).eq("id", sessionId)

        }
        // dispatching event to the header. Telling it to update
        window.dispatchEvent(new Event("wordCompleted"))    
        }  


        }
        else {
            const newIncorrectGuesses =[...incorrectGuesses, letter] 
            setIncorrectGuesses(newIncorrectGuesses)
            if (newIncorrectGuesses.length >= MAX_GUESSES){
                setIsFailed(true)
                if(sessionId){
            supabase.from("game_sessions").update({status:true, correct_guesses:false}).eq("id", sessionId)

        }
        // dispatching an event to the header (line 97)
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

    if (error){
        return (
            <div>
                <p>{error}</p>
                <button onClick={startNewGame}>Try again</button>
            </div>
        )
        
    }
    if (!currentWord){
        return (
            <div>
                <p>No words to guess.</p>
            </div>
        )
    }
    return (
        <div>
            <p>{isCompleted? "You guessed the word!": isFailed?"That's not the word.": "Press the button to play again"}</p>
            <WordCard word={currentWord.word} guessedLetters={isFailed?new Set(currentWord.word.toLowerCase().split('')):guessedLetters}/>
            {!isCompleted && !isFailed && <WordMeaning meaning={currentWord.meaning}/>}
            {incorrectGuesses.length > 0 && <div>
                <p>Incorrect Guesses: {incorrectGuesses.length}/{MAX_GUESSES}</p>
                <p>You tried letters: {incorrectGuesses.join(", ").toUpperCase()}</p>
                </div>}
            {isCompleted || isFailed && <CompleteDisplay word={currentWord.word} meaning={currentWord.meaning} examples={currentWord.examples} failed={isFailed}/>}    
            <div>
               <button onClick={startNewGame}>{isComplete || isFailed? "Start a new game": "Skip this word"}</button> 
            </div>
        </div>
    )

}



    
        

    

