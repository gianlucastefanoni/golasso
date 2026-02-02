import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getUserProfile, updateUserRole, getAllUserProfiles } from '../firebase/firestoreUtils';
import { UserProfile, FirestoreUser } from '../types/UserTypes';
import { app } from '../firebase/firebaseconfig';
import { Link } from 'react-router-dom';

const auth = getAuth(app);

const UserRoleManager: React.FC = () => {
  const [currentUserProfile, setCurrentUserProfile] = useState<FirestoreUser | null>(null);
  const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUserProfiles = async () => {
    try {
      const fetchedUsers = await getAllUserProfiles();
      setAllUsers(fetchedUsers);
    } catch (err: any) {
      console.error("Errore nel recuperare i profili:", err);
      setError(`Errore: ${err.message}`);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setError(null);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setCurrentUserProfile(profile);
          if (profile?.idProfilo === UserProfile.Admin) {
            await fetchAllUserProfiles();
          }
        } catch (err: any) {
          setError("Errore durante il caricamento del profilo.");
        }
      } else {
        setCurrentUserProfile(null);
        setAllUsers([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChangeRole = async (targetUid: string, newRole: UserProfile) => {
    setError(null);
    if (!auth.currentUser || currentUserProfile?.idProfilo !== UserProfile.Admin) {
      setError("Permessi insufficienti.");
      return;
    }
    
    if (targetUid === auth.currentUser.uid && newRole !== UserProfile.Admin) {
      if (!window.confirm("Attenzione: stai per declassare te stesso. Continuare?")) return;
    }

    try {
      await updateUserRole(targetUid, newRole);
      setAllUsers(prev => prev.map(u => (u.ID === targetUid ? { ...u, idProfilo: newRole } : u)));
      if (targetUid === auth.currentUser.uid) {
        setCurrentUserProfile(prev => prev ? { ...prev, idProfilo: newRole } : null);
      }
    } catch (err: any) {
      setError(err.message || "Errore durante il cambio ruolo.");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-emerald-500 animate-pulse text-xl">Caricamento dati...</p>
      </div>
    );
  }

  if (!currentUserProfile) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <Link to="/login" className="bg-emerald-600 px-6 py-2 rounded text-white hover:bg-emerald-500 transition-colors">
          Effettua il Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 text-white min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header & Back Button */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-emerald-500">Gestione Account</h2>
          <Link to="/" className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-700">
            Torna alla Home
          </Link>
        </div>

        {/* Profilo Corrente Card */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-emerald-600">
          <h3 className="text-lg font-semibold mb-2">Il mio Profilo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <p><span className="text-gray-500 uppercase text-xs font-bold block">ID Utente</span> {currentUserProfile.ID}</p>
            <p>
                <span className="text-gray-500 uppercase text-xs font-bold block">Ruolo Attuale</span> 
                <span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded text-sm">
                    {UserProfile[currentUserProfile.idProfilo]}
                </span>
            </p>
          </div>
        </section>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Pannello Admin */}
        {currentUserProfile.idProfilo === UserProfile.Admin && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-emerald-500">Gestione Ruoli</h3>
                <p className="text-gray-400 text-sm">Modifica i permessi degli utenti registrati nel sistema.</p>
            </div>

            {allUsers.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-500">
                Nessun altro utente trovato o permessi insufficienti.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-700">
                <table className="w-full text-left border-collapse bg-gray-800/50">
                  <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">UID / Utente</th>
                      <th className="px-4 py-3">Stato Ruolo</th>
                      <th className="px-4 py-3 text-right">Azione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {allUsers.map(user => (
                      <tr key={user.ID} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-4 font-mono text-xs text-gray-400">{user.ID}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            user.idProfilo === UserProfile.Admin ? 'bg-purple-900/40 text-purple-400' : 'bg-blue-900/40 text-blue-400'
                          }`}>
                            {UserProfile[user.idProfilo]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <select
                            value={user.idProfilo}
                            onChange={(e) => handleChangeRole(user.ID, parseInt(e.target.value) as UserProfile)}
                            className="bg-gray-900 border border-gray-600 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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