'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'

export default function Signup() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1️. Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      const user = data.user
      if (!user) {
        throw new Error('User not created')
      }

      // 2. Create profile (NO password)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
        })

      if (profileError) {
        throw profileError
      }

      // 3️.Redirect → Header will pick up session
      router.push('/')
    }  
    catch (err: unknown) {
  const msg = err instanceof Error ? err.message : 'Something went wrong during signup';
  console.error(msg);
  alert(msg);
}
    finally {
      setLoading(false)
    }
  }

  return (
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
  )
}