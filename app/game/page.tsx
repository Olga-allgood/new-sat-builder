'use client'
import { useEffect, useState } from 'react';
import GameBoard from '@/app/components/GameBoard';

import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

export default function GamePage(){
    const router = useRouter();
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState('')

    useEffect(() => {
        async function checkAuth(){
            setLoading(true)
            const {data, error} = await supabase.auth.getSession();
            if(!data.session) {
                router.push('/login')
            
            }else{setUserId(data.session.user.id)
                setLoading(false);
            }
        }
        checkAuth()
        const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
                if(!session) {
                    router.push('/login')
                }
            })
             return () => {
                subscription.unsubscribe();
            };
    }, [router]);

return (
  <div className="min-h-screen bg-white px-6 py-8">
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <p className="text-lg text-gray-700 font-medium">Use your keyboard to select a letter!</p>
      {userId && <GameBoard userId={userId} />}
    </div>
  </div>
);


}

