import { supabase } from './supabaseClient'

export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  })
  if (error) {
    console.error('Errore durante il login con Google:', error)
    throw error
  }
  return data
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Errore durante il logout:', error)
    throw error
  }
}