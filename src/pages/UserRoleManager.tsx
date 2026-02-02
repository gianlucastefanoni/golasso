import React, { useState, useEffect } from 'react';
import { updateUserRole, getAllUserProfiles } from '../firebase/firestoreUtils';
import { UserProfile, FirestoreUser } from '../types/UserTypes';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore'; // Importa lo store
import { Loader2, ShieldCheck, Users } from 'lucide-react';

const UserRoleManager: React.FC = () => {
  // Prendiamo i dati e lo stato di caricamento dallo store
  const { profile: currentUserProfile, isAdmin, loading: authLoading } = useUserStore();
  
  const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Funzione per caricare tutti i profili (solo se admin)
  const fetchAllUserProfiles = async () => {
    setLoadingUsers(true);
    try {
      const fetchedUsers = await getAllUserProfiles();
      setAllUsers(fetchedUsers);
    } catch (err: any) {
      setError(`Errore nel caricamento utenti: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Se lo store ha finito di caricare e l'utente è admin, carica la lista
    if (!authLoading && isAdmin) {
      fetchAllUserProfiles();
    }
  }, [authLoading, isAdmin]);

  const handleChangeRole = async (targetUid: string, newRole: UserProfile) => {
    setError(null);
    if (!isAdmin) {
      setError("Permessi insufficienti.");
      return;
    }
    
    if (currentUserProfile?.ID === targetUid && newRole !== UserProfile.Admin) {
      if (!window.confirm("Attenzione: stai per declassare te stesso. Continuare?")) return;
    }

    try {
      await updateUserRole(targetUid, newRole);
      // Aggiorniamo la lista locale
      setAllUsers(prev => prev.map(u => (u.ID === targetUid ? { ...u, idProfilo: newRole } : u)));
      
      // Nota: lo store si aggiornerà automaticamente al prossimo refresh o 
      // puoi chiamare una funzione dello store per aggiornare il profilo locale se necessario.
    } catch (err: any) {
      setError(err.message || "Errore durante il cambio ruolo.");
    }
  };

  // 1. Caricamento Iniziale (Auth + Profilo Personale)
  if (authLoading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs">Verifica credenziali...</p>
      </div>
    );
  }

  // 2. Non Loggato
  if (!currentUserProfile) {
    return (
      <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-6 font-medium">Sessione non trovata o scaduta.</p>
        <Link to="/login" className="bg-emerald-600 px-8 py-3 rounded-2xl text-white font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
          Torna al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 text-white min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Gestione <span className="text-emerald-500">Account</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Pannello Controllo Staff</p>
          </div>
          <Link to="/" className="text-xs bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-700 font-bold transition-all">
            Home
          </Link>
        </div>

        {/* Profilo Corrente Card */}
        <section className="bg-gray-800/30 p-6 rounded-3xl border border-gray-800 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Il mio Account</p>
                <p className="text-sm font-mono text-gray-300">{currentUserProfile.ID}</p>
            </div>
          </div>
          <div className="text-right">
             <span className="bg-emerald-500 text-gray-900 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {UserProfile[currentUserProfile.idProfilo]}
            </span>
          </div>
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        {/* Pannello Admin - Lista Utenti */}
        {isAdmin && (
          <section className="flex flex-col gap-6 mt-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Utenti <span className="text-emerald-500 pr-1">Registrati</span></h3>
                </div>
                {loadingUsers && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
            </div>

            {allUsers.length === 0 && !loadingUsers ? (
              <div className="bg-gray-800/20 p-12 rounded-3xl border border-gray-800 border-dashed text-center text-gray-600 italic">
                Nessun utente trovato nel database.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-800/10">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-800/50 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4">ID Utente</th>
                      <th className="px-6 py-4">Grado Profilo</th>
                      <th className="px-6 py-4 text-right">Modifica Permessi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {allUsers.map(user => (
                      <tr key={user.ID} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-mono text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">{user.ID}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            user.idProfilo === UserProfile.Admin 
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                : user.idProfilo === UserProfile.Scrittore
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {UserProfile[user.idProfilo]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={user.idProfilo}
                            onChange={(e) => handleChangeRole(user.ID, parseInt(e.target.value) as UserProfile)}
                            className="bg-gray-900 border border-gray-700 text-[10px] font-bold uppercase rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer hover:border-emerald-500 transition-all shadow-inner"
                          >
                            {Object.values(UserProfile)
                              .filter(value => typeof value === 'number')
                              .map(role => (
                                <option key={role} value={role}>
                                  {UserProfile[role as UserProfile]}
                                </option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default UserRoleManager;