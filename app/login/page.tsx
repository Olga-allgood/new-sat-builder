'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

  
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error){
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/game')
      }
  };

  // return (
  //   <div>
  //    <h1>Login</h1>
  //   <form onSubmit={handleLogin}>
  //     <input
  //       type="email"
  //       placeholder="Email"
  //       value={email}
  //       onChange={(e) => setEmail(e.target.value)}
  //       required
  //     />
  //     <input
  //       type="password"
  //       placeholder="Password"
  //       value={password}
  //       onChange={(e) => setPassword(e.target.value)}
  //       required
  //     />
  //     <button type="submit" disabled={loading}>
  //       {loading ? 'Logging in…' : 'Login'}
  //     </button>
  //   </form>
  //   {error&&(<p>{error}</p>)}
  //   </div>
  // );
return (
  <div className="min-h-screen flex items-center justify-center bg-white px-6">
    <div className="w-full max-w-md bg-gray-50 border border-[#787b80]/30 rounded-md p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-[#2d76c0] text-center">Login</h1>

      {error && <p className="text-red-600 font-medium text-center">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-md bg-[#009CDE] text-white font-medium hover:bg-[#2d76c0] disabled:opacity-50 transition"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  </div>
);

}
