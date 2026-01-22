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
  
  

  return (
    <div>
    <form onSubmit={handleSignup}>
      <h1>Sign up</h1>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Sign up'}
      </button>
    </form>
    {error&&(<p>{error}</p>)}
    </div>
  )
}