// import { useEffect, useState } from 'react';
// import GameBoard from '@/app/components/GameBoard';

// import { useRouter } from 'next/navigation';
// import { supabase } from '@/app/lib/supabaseClient';

// export default function GamePage(){
//     const router = useRouter();
//     const [loading, setLoading] = useState(false)
//     const [userId, setUserId] = useState('')

//     useEffect(() => {
//         async function checkAuth(){
//             setLoading(true)
//             const {data, error} = await supabase.auth.getSession();
//             if(!data.session) {
//                 router.push('/login')
            
//             }else{setUserId(data.session.user.id)
//                 setLoading(false);
//             }
//         }
//         checkAuth()
//         const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
//                 if(!session) {
//                     router.push('/login')
//                 }
//             })
//              return () => {
//                 subscription.unsubscribe();
//             };
//     }, [router]);


//     return (
//         <div>
//             <p>Let's start learning new words!</p>
//             {userId&&<GameBoard userId={userId}/>}
//         </div>
//     )



// }

