import Link from "next/link";
export default function HomePage() {
  return (
    <main style={{ padding: "2rem" , background:"var(--secondary)", height:"100vh", 
    display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
      <h1>Welcome to SAT Vocab Builder!</h1>
   
       <div>
        <Link href="/login">
            Log In
          </Link>
          <Link href="/signup">
            Get Started
          </Link>
        </div>
     
    </main>
  );
}