import { supabase } from "./supabaseClient";



export async function signUp(email:string, password:string){
    const { data, error } = await supabase.auth.signUp({email, password})
    return { data, error }
};

export async function LogIn(email:string, password:string){
    const {data, error } = await supabase.auth.signInWithPassword({email, password,})
    return { data, error }
}

export async function SignOut(){
    const { error } = await supabase.auth.signOut()
    return { error }
}



export async function getSession() {
  const { data, error } = await supabase.auth.getSession()

  return { session: data.session, error }
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error}
}
