"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { SignOut } from "@/app/lib/auth";
import { getUser } from "@/app/lib/auth";
import { getSession } from "@/app/lib/auth";



export default function Header() {
    const [user, setUser] = useState<string | null> (null); 
    // string?
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [failedWords, setFailedWords] = useState(0);
    const [guessedWords, setGuessedWords] = useState(0);
    const [loading, setLoading] = useState(true);

    
    const getUser = async (id:string) => {
        const {
            data: profile,
            error
        } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', id)
        .maybeSingle();

         if (error) {
      console.error(error.message)
      return
    }

        setUser(profile?.email)

         const {
            count: correctCount,
            error: correctError
            } = await supabase
            .from('game_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', id)
            .eq('status', true)

if (!correctError && correctCount !== null) {
  setGuessedWords(correctCount)
};

           const {
            count: incorrectCount,
            error: incorrectError
            } = await supabase
            .from('game_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', id)
            .eq('status', false)

if (!incorrectError && incorrectCount !== null) {
  setFailedWords(incorrectCount)
};

    }
    useEffect(() => {
        supabase.auth.getSession().then(({data}) => {
            const session = data.session
            if (session){
                setIsLoggedIn(true)
                getUser(session.user.id)
            }
            setLoading(false)
        });
        const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
                if(session?.user) {
                    setIsLoggedIn(true);
                    getUser(session.user.id);
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                    setGuessedWords(0);
                    setFailedWords(0);
                }
            });
            return () => {
                subscription.unsubscribe();
            };
            
    }, []);
    useEffect(() => {
        function increaseCorrectCount(){
            setGuessedWords(prev => prev+1)
        };
        function increaseIncorrectCount(){
            setFailedWords(prev => prev+1)
        };
        window.addEventListener("wordCompleted", increaseCorrectCount);
        window.addEventListener("wordFailed", increaseIncorrectCount);
        return () => {
             window.removeEventListener("wordCompleted", increaseCorrectCount);
             window.removeEventListener("wordFailed", increaseIncorrectCount);
                };

    }, []);
     if (loading) return null;
    async function loggingOut() {
        await SignOut();
        setIsLoggedIn(false);
        setUser(null);
        setGuessedWords(0);
        setFailedWords(0);
       
    }
     return (
        
    <header> 
        <h2>SAT Vocabulary Builder</h2>
      {isLoggedIn ? (
        <>
          <p>Welcome, {user}</p>
          <p>Correct guesses: {guessedWords}</p>
          <p>Incorrect guesses: {failedWords}</p>
          <button onClick={loggingOut}>Log Out</button>
          <Link href="/history">Your history</Link>
        </>
      ) : (
        <>
        <Link href="/login">
            Log In
          </Link>
          <Link href="/signup">
            Sign Up
          </Link>
        </>
      )}
    </header>
  );
}

    


