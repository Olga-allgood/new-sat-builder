'use client'
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { supabase } from "@/app/lib/supabaseClient";
export default function HomePage() {

const router = useRouter(); 

const [loading, setLoading] = useState(false)

useEffect(()=>{
  
  async function authenticate(){
    setLoading(true)
    const {data, error} = await supabase.auth.getSession()
   if(data.session){
    router.replace("/game")
   } 
   setLoading(false)
 }
 authenticate()
},[router])

return (
  <main className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white px-6 gap-8">
  
    {/* Image Section */}
    <div className="relative h-64 w-96 rounded-lg overflow-hidden shadow-lg">
      <Image
        src="/images/student.png"
        alt="Student"
        fill
        style={{ objectFit: "cover" }}
        className="rounded-lg"
        priority
      />
    </div>

    {/* Text Section */}
    <div className="max-w-xl text-center space-y-8">
      <h1 className="text-4xl md:text-5xl font-semibold text-[#2d76c0]">
        Welcome to SAT Vocabulary Builder
      </h1>

      <p className="text-lg text-gray-600">
        Build academic vocabulary with confidence and track your progress.
      </p>

      <div className="flex justify-center gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-md border border-[#009CDE] text-[#009CDE] font-medium hover:bg-[#009CDE] hover:text-white transition"
        >
          Log In
        </Link>

        <Link
          href="/signup"
          className="px-6 py-3 rounded-md bg-[#009CDE] text-white font-medium hover:bg-[#2d76c0] transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  </main>
);


}