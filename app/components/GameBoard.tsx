'use client'
import { useState, useEffect } from 'react';
import { supabase } from "@/app/lib/supabaseClient";
import {word_with_examples} from "@/app/types/database";
import WordCard from './WordCard';
import WordMeaning from './WordMeaning';
import CompleteDisplay from './CompleteDisplay';
import PersonalWordForm from './PersonalWordForm';

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
        
        const {data: words, error: wordError} = await supabase.from("words").select("*")
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
        // BUG in LOGIC!!

                // User presses a letter → OK
                // User presses the same letter again
                // The bug was here:

                // setError("You already used that letter")
                // React re-renders
                // GameBoard sees error !== ''
                // Entire game UI is replaced with the “Try again” screen
                // Game looks like it ended, even though logically it shouldn’t
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
        if(sessionId){
            supabase.from("game_sessions").update({status:true, correct_guesses:true}).eq("id", sessionId)

        }
        // dispatching event to the header. Telling it to update
        window.dispatchEvent(new Event("wordCompleted"))    
        }  


        }
        else {
             const MAX_GUESSES = currentWord.word.length*2
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

    // The code below was preventing live incorrect guesses to be displayed
    
    // if (error){
    //     return (
    //         <div>
    //             <p>{error}</p>
    //             <button onClick={startNewGame}>Try again</button>
    //         </div>
    //     )
        
    // }
 
   

    if (!currentWord){
        return (
            <div>
                <p>No words to guess.</p>
            </div>
        )
    }

    function speakWord(word: string) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US'; // or another language if needed
        speechSynthesis.speak(utterance);    
    }

    return (
        <div> 
            {error && <p style={{color: 'red'}}>{error}</p>}
            <p>{isCompleted? "You guessed the word!": isFailed?"That's not the word.": "Press the button to play again"}</p>
            <WordCard word={currentWord.word} guessedLetters={isFailed? new Set(currentWord.word.toUpperCase().split('')):guessedLetters}/>
            
            {(isCompleted || isFailed) && (
                <button 
                    onClick={() => speakWord(currentWord.word)} 
                    disabled={!currentWord}
                >
                    🔊 Hear word
                </button>
            )}

            {currentWord && <WordMeaning meaning={currentWord.meaning}/>}
            {incorrectGuesses.length > 0 && <div>
                <p>Incorrect Guesses: {incorrectGuesses.length}/{currentWord.word.length*2}</p>
                <p>You tried letters: {incorrectGuesses.join(", ").toUpperCase()}</p>
                </div>}
            {isCompleted || isFailed && <CompleteDisplay word={currentWord.word} meaning={currentWord.meaning} examples={currentWord.examples} failed={isFailed}/>}    
            <div>
               
               <button onClick={startNewGame}>{isCompleted || isFailed? "Start a new game": "Skip this word"}</button> 
            </div>
            <div>
               {personalWord &&  <PersonalWordForm userProfile={userId}/>}
                <button onClick={()=>setPersonalWord(!personalWord)}>{!personalWord?"Add Your Word":"Close the Form"}</button>
            </div>
        </div>
    )

}



    
        

    

