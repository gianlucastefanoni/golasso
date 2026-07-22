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

export async function createFantaSquadra(nome: string): Promise<FantaSquadra> {
  const { data, error } = await supabase
    .from('Fanta_squadre')
    .insert({ nome })
    .select('id, nome')
    .single()

  if (error) {
    console.error('Errore nella creazione della fanta squadra:', error)
    throw error
  }

  return { id: data.id, nome: data.nome ?? '' }
}