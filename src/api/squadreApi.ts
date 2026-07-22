import { supabase } from '../supabase/supabaseClient'
import { Squadra } from '../types/GiocatoreTypes'

export async function getAllSquadre(stagione?: number): Promise<Squadra[]> {
  let query = supabase.from('Squadre').select('id, nome, stagione').order('nome')
  if (stagione !== undefined) query = query.eq('stagione', stagione)

  const { data, error } = await query

  if (error) {
    console.error('Errore nel recuperare le squadre:', error)
    throw error
  }

  return (data ?? []).map(row => ({
    id: row.id,
    nome: row.nome ?? '',
    stagione: row.stagione ?? 0,
  }))
}