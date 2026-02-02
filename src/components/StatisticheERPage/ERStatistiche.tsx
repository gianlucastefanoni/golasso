import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { StatisticheGiocatore } from '../../types/GiocatoreTypes';
import { addStatisticheFromData } from '../../api/ApiService';
import { FileSpreadsheet, UploadCloud, Database, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ERStatistiche: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [playerStats, setPlayerStats] = useState<StatisticheGiocatore[]>([]);
  const [astaLoaded, setAstaLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 1. LETTURA FILE STATISTICHE (Quello base)
  const handleStatsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets['Tutti'];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let headerRowIndex = jsonData.findIndex(row =>
          row[0]?.toString().toLowerCase().includes('id') && row.includes('Nome')
        );

        if (headerRowIndex === -1) throw new Error('Intestazione Statistiche non trovata');

        const headers = jsonData[headerRowIndex];
        const rows = jsonData.slice(headerRowIndex + 1);
        const colIndex = (name: string) => headers.findIndex(h => h?.toString().trim() === name);

        const mapped: StatisticheGiocatore[] = rows
          .filter(r => r.length > 0 && r[0])
          .map((row: any[]) => ({
            Cod: parseInt(row[colIndex('Id')]),
            R: row[colIndex('R')],
            Rm: row[colIndex('Rm')]?.toString().split(';').map((x: string) => x.trim()) || [],
            Nome: row[colIndex('Nome')],
            Squadra: row[colIndex('Squadra')],
            Pv: parseInt(row[colIndex('Pv')]) || 0,
            Mv: parseFloat(row[colIndex('Mv')]) || 0,
            Fm: parseFloat(row[colIndex('Fm')]) || 0,
            Gf: parseInt(row[colIndex('Gf')]) || 0,
            Gs: parseInt(row[colIndex('Gs')]) || 0,
            Rp: parseInt(row[colIndex('Rp')]) || 0,
            Rc: parseInt(row[colIndex('Rc')]) || 0,
            Rf: parseInt(row[colIndex('R+')]) || 0,
            Rs: parseInt(row[colIndex('R-')]) || 0,
            Ass: parseInt(row[colIndex('Ass')]) || 0,
            Amm: parseInt(row[colIndex('Amm')]) || 0,
            Esp: parseInt(row[colIndex('Esp')]) || 0,
            Au: parseInt(row[colIndex('Au')]) || 0,
            // Campi inizializzati vuoti
            FantaSquadra: "-",
            Costo: 0,
            Fl: false
          }));

        setPlayerStats(mapped);
      } catch (err) {
        alert("Errore file statistiche: " + err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 2. LETTURA FILE ASTA (Il "Join")
  const handleAstaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || playerStats.length === 0) {
      alert("Carica prima il file delle statistiche!");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets['Lista calciatori'];

        if (!sheet) throw new Error("Foglio 'Lista calciatori' non trovato");

        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Trova header asta
        let headerRowIndex = jsonData.findIndex(row => row.includes('Id') && row.includes('FantaSquadra'));
        if (headerRowIndex === -1) throw new Error("Intestazioni 'Id', 'FantaSquadra' non trovate");

        const headers = jsonData[headerRowIndex];
        const rows = jsonData.slice(headerRowIndex + 1);

        const idxId = headers.indexOf('Id');
        const idxFanta = headers.indexOf('FantaSquadra');
        const idxCosto = headers.indexOf('Costo');
        const idxFuoriLista = headers.indexOf('Fuori lista');

        // Creiamo una mappa temporanea per velocità { "id": { fanta: "...", costo: 0 } }
        const astaMap = new Map();
        rows.forEach(row => {
          if (row[idxId]) {
            astaMap.set(parseInt(row[idxId]), {
              fanta: row[idxFanta] || "-",
              costo: parseInt(row[idxCosto]) || 0,
              fl: row[idxFuoriLista] == '*'
            });
          }
        });

        // Uniamo i dati
        const updatedStats = playerStats.map(p => {
          const auctionData = astaMap.get(p.Cod);
          if (auctionData) {
            return { ...p, FantaSquadra: auctionData.fanta, Costo: auctionData.costo, Fl: auctionData.fl };
          }
          return p;
        });

        setPlayerStats(updatedStats);
        setAstaLoaded(true);
      } catch (err) {
        alert("Errore file asta: " + err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveToDB = async () => {
    if (playerStats.length === 0) return;

    setIsSaving(true);
    setUploadProgress(0);

    const batchSize = 50; // Dimensione del gruppo
    const totalPlayers = playerStats.length;
    const chunks = [];

    // Dividiamo i giocatori in pezzi da 50
    for (let i = 0; i < totalPlayers; i += batchSize) {
      chunks.push(playerStats.slice(i, i + batchSize));
    }

    try {
      for (let i = 0; i < chunks.length; i++) {
        // Invia il pezzo corrente
        await addStatisticheFromData(chunks[i]);

        // Calcola la percentuale
        const progress = Math.round(((i + 1) / chunks.length) * 100);
        setUploadProgress(progress);
      }
    } catch (err: any) {
      console.log("errore durante il caricamento", err)
    } finally {
      setIsSaving(false);
      navigate("/home")
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-900/50 border border-gray-800 rounded-3xl shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="text-emerald-500 w-8 h-8" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Import <span className="text-emerald-500">Dati</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INPUT STATS */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">1. File Statistiche (Tutti)</label>
          <div className="relative group">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleStatsUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isLoading}
            />
            <div className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${playerStats.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-700 bg-gray-800/40 group-hover:border-emerald-500/30'}`}>
              <UploadCloud className={playerStats.length > 0 ? "text-emerald-500" : "text-gray-500"} />
              <span className="text-sm font-bold text-gray-300">
                {playerStats.length > 0 ? `${playerStats.length} Giocatori Caricati` : "Carica Statistiche"}
              </span>
            </div>
          </div>
        </div>

        {/* INPUT ASTA */}
        <div className={`flex flex-col gap-2 ${playerStats.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">2. File Asta (Lista calciatori)</label>
          <div className="relative group">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleAstaUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${astaLoaded ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-700 bg-gray-800/40 group-hover:border-blue-500/30'}`}>
              {astaLoaded ? <CheckCircle2 className="text-blue-500" /> : <Database className="text-gray-500" />}
              <span className="text-sm font-bold text-gray-300">
                {astaLoaded ? "Asta Accoppiata" : "Carica Dati Asta"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {playerStats.length > 0 && (
        <button
          onClick={() => handleSaveToDB()}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Database className="w-5 h-5" />
          Sincronizza {playerStats.length} Giocatori su Firestore
        </button>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-emerald-500 animate-pulse">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
          <span className="text-xs font-black uppercase tracking-widest">Elaborazione Excel...</span>
        </div>
      )}
      {isSaving && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center p-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
            <Database className="absolute inset-0 m-auto w-8 h-8 text-emerald-500 animate-pulse" />
          </div>

          <div className="w-full max-w-xs flex flex-col items-center gap-3">
            {/* Label Percentuale */}
            <div className="flex justify-between w-full mb-1">
              <span className="text-emerald-500 font-black italic uppercase tracking-widest text-xs">
                Sincronizzazione
              </span>
              <span className="text-emerald-500 font-black text-sm">
                {uploadProgress}%
              </span>
            </div>

            {/* Barra di Progresso (Slider) */}
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <p className="mt-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">
              Caricamento Dati...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};