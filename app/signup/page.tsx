'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'

export default function Signup() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)


      // 1️. Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }

      // 2. Create profile (NO password)
      if (data.user) { await supabase 
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
        })
        router.push('/game')
      }

      // 3️.Redirect → Header will pick up session
    
      
    }  
  
  

  // return (
  //   <div>
  //   <form onSubmit={handleSignup}>
  //     <h1>Sign up</h1>

  //     <input
  //       type="email"
  //       value={email}
  //       onChange={(e) => setEmail(e.target.value)}
  //       placeholder="Email"
  //       required
  //     />

  //     <input
  //       type="password"
  //       value={password}
  //       onChange={(e) => setPassword(e.target.value)}
  //       placeholder="Password"
  //       required
  //     />

  //     <button type="submit" disabled={loading}>
  //       {loading ? 'Creating account…' : 'Sign up'}
  //     </button>
  //   </form>
  //   {error&&(<p>{error}</p>)}
  //   </div>
  // )
return (
  <div className="min-h-screen flex items-center justify-center bg-white px-6">
    <div className="w-full max-w-md bg-gray-50 border border-[#787b80]/30 rounded-md p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-[#2d76c0] text-center">Sign Up</h1>

      {error && <p className="text-red-600 font-medium text-center">{error}</p>}

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-md bg-[#009CDE] text-white font-medium hover:bg-[#2d76c0] disabled:opacity-50 transition"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
    </div>
  </div>
);

}