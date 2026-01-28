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

    useEffect(()=> {
        async function FetchGames (){
            setLoading(true);
            const {data:{session}} = await supabase.auth.getSession()
            if (!session){
                router.push('/login')
                return 
            }
            const {data:completedWords} = await supabase.from("game_sessions").select("id, word_id, status, correct_guesses, words(word,meaning)").eq("user_id", session.user.id).eq("correct_guesses", true);
            const {data:IncompletedWords} = await supabase.from("game_sessions").select("id, word_id, status, correct_guesses, words(word,meaning)").eq("user_id", session.user.id).eq("correct_guesses", false);
        
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

     return (
        <div>
            
            <h1>Game History</h1>
            <div>
                <p>Correct Guesses: {correctGuesses.length}</p>
                {correctGuesses.length==0?<p>No Words Guessed</p>:<div>{correctGuesses.map((item)=>
                    (<div key={item.id}><p>{getWordData(item.words)?.word}</p>
                                         <p>{getWordData(item.words)?.meaning}</p>
                    </div>))}</div>}

            </div>  

            <div>
                <p>Incorrect Guesses: {incorrectGuesses.length}</p>
                {incorrectGuesses.length==0?<p>No incorrect guesses</p>:<div>{incorrectGuesses.map((item)=>
                    (<div key={item.id}><p>{getWordData(item.words)?.word}</p>
                                         <p>{getWordData(item.words)?.meaning}</p>
                    </div>))}</div>}

            </div>  

        </div>
     )
     


    
}