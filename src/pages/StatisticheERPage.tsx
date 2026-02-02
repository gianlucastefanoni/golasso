import { useUserStore } from "../store/useUserStore";
import { ERStatistiche } from "../components/StatisticheERPage/ERStatistiche";
import { Link } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";

export const StatisticheERPage = () => {
  // Prendiamo tutto dallo store: lo stato di caricamento e il permesso isEditor
  const { isEditor, loading } = useUserStore();

  // 1. STATO CARICAMENTO (Gestito globalmente dallo store all'avvio)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // 2. STATO ACCESSO NEGATO (Se non sei Admin o Scrittore)
  if (!isEditor) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-gray-800 p-10 rounded-3xl border border-gray-700 text-center shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Accesso Riservato</h2>
          <p className="text-gray-400 text-sm max-w-xs mb-8">
            Questa sezione è dedicata esclusivamente allo staff tecnico di <strong>Golasso</strong>.
          </p>
          <Link to="/" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95">
            Torna in Campo
          </Link>
        </div>
      </div>
    );
  }

  // 3. PAGINA AUTORIZZATA
  return (
    <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between bg-gray-800/40 p-6 rounded-3xl border border-gray-800 backdrop-blur-md shadow-xl">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              Area <span className="text-emerald-500">Staff</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              Data Entry & Statistiche Avanzate
            </p>
          </div>
          <Link
            to="/"
            className="bg-white/5 hover:bg-white/10 text-white py-2.5 px-5 rounded-2xl border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest shadow-inner"
          >
            Chiudi Editor
          </Link>
        </div>

        <div className="bg-gray-800/20 rounded-3xl border border-gray-800 p-2 sm:p-6 shadow-2xl">
          <ERStatistiche />
        </div>
      </div>
    </div>
  );
};