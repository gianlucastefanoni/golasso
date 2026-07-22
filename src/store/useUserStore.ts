import { create } from 'zustand'
import { supabase } from '../supabase/supabaseClient'
import { getUserProfile } from '../supabase/userProfileService'
import { FirestoreUser, UserProfile } from '../types/UserTypes'
import type { User } from '@supabase/supabase-js'

interface UserState {
  user: User | null
  profile: FirestoreUser | null
  loading: boolean
  isAdmin: boolean
  isEditor: boolean
  clearStore: () => void
  initialize: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isEditor: false,

  clearStore: () =>
    set({ user: null, profile: null, loading: false, isAdmin: false, isEditor: false }),

  initialize: () => {
    // Controlla subito se c'è già una sessione attiva
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) get().clearStore()
    })

    // Ascolta i cambiamenti di autenticazione (login, logout, refresh token)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const supaUser = session?.user ?? null

      if (supaUser) {
        try {
          const profileData = await getUserProfile(supaUser.id)
          set({
            user: supaUser,
            profile: profileData,
            isAdmin: profileData?.idProfilo === UserProfile.Admin,
            isEditor: (profileData?.idProfilo ?? 0) >= UserProfile.Scrittore,
            loading: false,
          })
        } catch (err) {
          console.error('Errore store user:', err)
          get().clearStore()
        }
      } else {
        get().clearStore()
      }
    })
  },
}))