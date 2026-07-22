import { supabase } from '../supabase/supabaseClient'
import { FantaSquadra } from '../types/GiocatoreTypes'

export async function getAllFantaSquadre(): Promise<FantaSquadra[]> {
  const { data, error } = await supabase
    .from('Fanta_squadre')
    .select('id, nome')
    .order('nome')

  if (error) {
    console.error('Errore nel recuperare le fanta squadre:', error)
    throw error
  }

  return (data ?? []).map(row => ({ id: row.id, nome: row.nome ?? '' }))
}