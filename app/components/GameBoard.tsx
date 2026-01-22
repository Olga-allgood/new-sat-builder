'use client'
import { useState, useEffect } from 'react';
import { supabase } from "@/app/lib/supabaseClient";
import word_with_examples from "@/app/types/database";


interface Profile {
    id: string
}
export default function GameBoard({userId}: Profile){
    const [currentWord, setCurrentWord] = useState<word_with_examples | null>(null);
    const [guessedLetters, setGuessedLetters] = useState(null)
    const [incorrectGuesses, setIncorrectGuessed] = useState(0)
    const [sessionId, setSessionId] = useState(null)
    const [isCompleted, setIsCompleted] = useState(false)
    const [isFailed, setIsFailed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function isComplete(word: string, guessed: string){
        const word_letters=word.toLowerCase()
        const guessed_letters=guessed.toLowerCase()
        if (word_letters == guessed_letters){
            return true    
        }
        return false

    
        

    }

    return (<p>Game Board</p>)
}

