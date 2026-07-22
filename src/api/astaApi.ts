import { supabase } from '../supabase/supabaseClient'

export type Asta = {
  id: number
  stagione: number
  budget: number
  partecipanti: number
}

export async function getAllStagioni(): Promise<number[]> {
  const { data, error } = await supabase
    .from('Asta')
    .select('stagione')
    .order('stagione', { ascending: false })

  if (error) {
    console.error('Errore nel recuperare le stagioni:', error)
    throw error
  }

  const stagioni = (data ?? [])
    .map(r => r.stagione)
    .filter((s): s is number => s !== null)

  return Array.from(new Set(stagioni))
}

export async function getAstaByStagione(stagione: number): Promise<Asta | null> {
  const { data, error } = await supabase
    .from('Asta')
    .select('id, stagione, budget, partecipanti')
    .eq('stagione', stagione)
    .maybeSingle()

  if (error) {
    console.error("Errore nel recuperare l'asta:", error)
    throw error
  }

  if (!data) return null

  return {
    id: data.id,
    stagione: data.stagione ?? 0,
    budget: data.budget ?? 500,
    partecipanti: data.partecipanti ?? 0,
  }
}