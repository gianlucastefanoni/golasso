import { useState } from 'react'
import { createAsta, getAstaByStagione } from '../api/astaApi'
import { createFantaSquadra } from '../api/fantaSquadreApi'

export const NuovaConfigurazione = () => {
  // --- form asta ---
  const [stagione, setStagione] = useState<number>(new Date().getFullYear())
  const [budget, setBudget] = useState<number>(500)
  const [partecipanti, setPartecipanti] = useState<number>(8)
  const [astaMsg, setAstaMsg] = useState<string | null>(null)
  const [astaError, setAstaError] = useState<string | null>(null)
  const [savingAsta, setSavingAsta] = useState(false)

  // --- form fanta squadra ---
  const [nomeSquadra, setNomeSquadra] = useState('')
  const [squadraMsg, setSquadraMsg] = useState<string | null>(null)
  const [squadraError, setSquadraError] = useState<string | null>(null)
  const [savingSquadra, setSavingSquadra] = useState(false)

  async function handleCreateAsta() {
    setAstaMsg(null)
    setAstaError(null)
    setSavingAsta(true)
    try {
      const esistente = await getAstaByStagione(stagione)
      if (esistente) {
        setAstaError(`Esiste già un'asta per la stagione ${stagione}.`)
        return
      }
      const nuova = await createAsta({ stagione, budget, partecipanti })
      setAstaMsg(`Asta creata: stagione ${nuova.stagione}, budget ${nuova.budget}, ${nuova.partecipanti} partecipanti.`)
    } catch (err) {
      setAstaError("Errore durante la creazione dell'asta. Riprova.")
    } finally {
      setSavingAsta(false)
    }
  }

  async function handleCreateFantaSquadra() {
    setSquadraMsg(null)
    setSquadraError(null)
    if (!nomeSquadra.trim()) {
      setSquadraError('Inserisci un nome valido.')
      return
    }
    setSavingSquadra(true)
    try {
      const nuova = await createFantaSquadra(nomeSquadra.trim())
      setSquadraMsg(`Fanta squadra creata: ${nuova.nome}`)
      setNomeSquadra('')
    } catch (err) {
      setSquadraError('Errore durante la creazione della fanta squadra. Riprova.')
    } finally {
      setSavingSquadra(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Nuova asta</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Stagione</label>
          <input
            type="number"
            value={stagione}
            onChange={e => setStagione(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Budget</label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Numero partecipanti</label>
          <input
            type="number"
            value={partecipanti}
            onChange={e => setPartecipanti(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <button
          onClick={handleCreateAsta}
          disabled={savingAsta}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {savingAsta ? 'Creazione...' : 'Crea asta'}
        </button>

        {astaMsg && <p className="text-green-600 text-sm">{astaMsg}</p>}
        {astaError && <p className="text-red-600 text-sm">{astaError}</p>}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Nuova fanta squadra</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            value={nomeSquadra}
            onChange={e => setNomeSquadra(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <button
          onClick={handleCreateFantaSquadra}
          disabled={savingSquadra}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {savingSquadra ? 'Creazione...' : 'Crea fanta squadra'}
        </button>

        {squadraMsg && <p className="text-green-600 text-sm">{squadraMsg}</p>}
        {squadraError && <p className="text-red-600 text-sm">{squadraError}</p>}
      </section>
    </div>
  )
}