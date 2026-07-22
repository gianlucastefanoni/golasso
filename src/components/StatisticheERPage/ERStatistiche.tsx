import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { StatisticheGiocatore } from "../../types/GiocatoreTypes";
import { addStatisticheFromData } from "../../api/giocatoriApi";
import { getAllSquadre } from "../../api/squadreApi";
import { getAllFantaSquadre } from "../../api/fantaSquadreApi";
import {
  FileSpreadsheet,
  UploadCloud,
  Database,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type ImportLogEntry = {
  tipo: "squadra" | "fanta_squadra";
  giocatore: string;
  valoreNonTrovato: string;
};

export const ERStatistiche: React.FC = () => {
  const navigate = useNavigate();
  const [stagione, setStagione] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [playerStats, setPlayerStats] = useState<StatisticheGiocatore[]>([]);
  const [astaLoaded, setAstaLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importLog, setImportLog] = useState<ImportLogEntry[]>([]);
  const [fantaSquadreMap, setFantaSquadreMap] = useState<Map<string, number>>(new Map());

  // Le fanta squadre (proprietari) non dipendono dalla stagione, le carichiamo una volta
  useEffect(() => {
    getAllFantaSquadre()
      .then((list) => {
        setFantaSquadreMap(new Map(list.map((f) => [f.nome.trim().toUpperCase(), f.id])));
      })
      .catch((err) => console.error("Errore caricamento fanta squadre:", err));
  }, []);

  // 1. LETTURA FILE STATISTICHE
  const handleStatsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!stagione || stagione <= 0) {
      alert("Inserisci una stagione valida prima di caricare il file.");
      e.target.value = "";
      return;
    }

    setIsLoading(true);

    try {
      // Carichiamo le squadre per QUESTA stagione, per risolvere nome -> id_squadra
      const squadre = await getAllSquadre(stagione);
      const squadreMap = new Map(squadre.map((s) => [s.nome.trim().toUpperCase(), s.id]));

      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets["Tutti"];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headerRowIndex = jsonData.findIndex(
        (row) => row[0]?.toString().toLowerCase().includes("id") && row.includes("Nome")
      );
      if (headerRowIndex === -1) throw new Error("Intestazione Statistiche non trovata");

      const headers = jsonData[headerRowIndex];
      const rows = jsonData.slice(headerRowIndex + 1);
      const colIndex = (name: string) =>
        headers.findIndex((h) => h?.toString().trim() === name);

      const log: ImportLogEntry[] = [];

      const mapped: StatisticheGiocatore[] = rows
        .filter((r) => r.length > 0 && r[0])
        .map((row: any[]) => {
          const nome = row[colIndex("Nome")] ?? "";
          const squadraNome = (row[colIndex("Squadra")] ?? "").toString().trim();
          const idSquadra = squadraNome ? squadreMap.get(squadraNome.toUpperCase()) ?? null : null;

          if (squadraNome && idSquadra === null) {
            log.push({ tipo: "squadra", giocatore: nome, valoreNonTrovato: squadraNome });
          }

          return {
            id: parseInt(row[colIndex("Id")]),
            stagione,
            nome,
            id_squadra: idSquadra,
            squadra: squadraNome,
            r: row[colIndex("R")] ?? "",
            rm:
              row[colIndex("Rm")]
                ?.toString()
                .split(";")
                .map((x: string) => x.trim())
                .filter(Boolean) || [],
            pv: parseInt(row[colIndex("Pv")]) || 0,
            mv: parseFloat(row[colIndex("Mv")]) || 0,
            fm: parseFloat(row[colIndex("Fm")]) || 0,
            gf: parseInt(row[colIndex("Gf")]) || 0,
            gs: parseInt(row[colIndex("Gs")]) || 0,
            rp: parseInt(row[colIndex("Rp")]) || 0,
            rc: parseInt(row[colIndex("Rc")]) || 0,
            rf: parseInt(row[colIndex("R+")]) || 0,
            rs: parseInt(row[colIndex("R-")]) || 0,
            ass: parseInt(row[colIndex("Ass")]) || 0,
            amm: parseInt(row[colIndex("Amm")]) || 0,
            esp: parseInt(row[colIndex("Esp")]) || 0,
            au: parseInt(row[colIndex("Au")]) || 0,
            id_fanta_squadra: null,
            FantaSquadra: "-",
            id_asta: null,
            costo: 0,
            fl: false,
          };
        });

      setPlayerStats(mapped);
      setImportLog(log);
      setAstaLoaded(false);
    } catch (err) {
      alert("Errore file statistiche: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. LETTURA FILE ASTA (join su id giocatore, risolve FantaSquadra nome -> id)
  const handleAstaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || playerStats.length === 0) {
      alert("Carica prima il file delle statistiche!");
      return;
    }

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets["Lista calciatori"];
      if (!sheet) throw new Error("Foglio 'Lista calciatori' non trovato");

      const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headerRowIndex = jsonData.findIndex(
        (row) => row.includes("Id") && row.includes("FantaSquadra")
      );
      if (headerRowIndex === -1) throw new Error("Intestazioni 'Id', 'FantaSquadra' non trovate");

      const headers = jsonData[headerRowIndex];
      const rows = jsonData.slice(headerRowIndex + 1);

      const idxId = headers.indexOf("Id");
      const idxFanta = headers.indexOf("FantaSquadra");
      const idxCosto = headers.indexOf("Costo");
      const idxFuoriLista = headers.indexOf("Fuori lista");

      const astaMap = new Map<number, { fanta: string; costo: number; fl: boolean }>();
      rows.forEach((row) => {
        if (row[idxId]) {
          astaMap.set(parseInt(row[idxId]), {
            fanta: (row[idxFanta] ?? "-").toString().trim(),
            costo: parseInt(row[idxCosto]) || 0,
            fl: row[idxFuoriLista] === "*",
          });
        }
      });

      const log: ImportLogEntry[] = [...importLog];

      const updatedStats = playerStats.map((p) => {
        const auctionData = astaMap.get(p.id);
        if (!auctionData) return p;

        let idFantaSquadra: number | null = null;
        if (auctionData.fanta && auctionData.fanta !== "-") {
          idFantaSquadra = fantaSquadreMap.get(auctionData.fanta.toUpperCase()) ?? null;
          if (idFantaSquadra === null) {
            log.push({
              tipo: "fanta_squadra",
              giocatore: p.nome,
              valoreNonTrovato: auctionData.fanta,
            });
          }
        }

        return {
          ...p,
          FantaSquadra: auctionData.fanta,
          id_fanta_squadra: idFantaSquadra,
          costo: auctionData.costo,
          fl: auctionData.fl,
        };
      });

      setPlayerStats(updatedStats);
      setImportLog(log);
      setAstaLoaded(true);
    } catch (err) {
      alert("Errore file asta: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    if (playerStats.length === 0) return;

    setIsSaving(true);
    setUploadProgress(0);

    const batchSize = 50;
    const totalPlayers = playerStats.length;
    const chunks: StatisticheGiocatore[][] = [];

    for (let i = 0; i < totalPlayers; i += batchSize) {
      chunks.push(playerStats.slice(i, i + batchSize));
    }

    try {
      for (let i = 0; i < chunks.length; i++) {
        await addStatisticheFromData(chunks[i]);
        setUploadProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
    } catch (err: any) {
      console.log("errore durante il caricamento", err);
      alert("Errore durante il salvataggio: " + err.message);
    } finally {
      setIsSaving(false);
      navigate("/home");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-900/50 border border-gray-800 rounded-3xl shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="text-emerald-500 w-8 h-8" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
          Import <span className="text-emerald-500">Dati</span>
        </h2>
      </div>

      {/* STAGIONE */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
          Stagione (obbligatoria prima del caricamento)
        </label>
        <input
          type="number"
          value={stagione}
          onChange={(e) => setStagione(parseInt(e.target.value) || 0)}
          className="bg-gray-800/40 border border-gray-700 rounded-2xl px-4 py-3 text-white font-bold w-40 focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="Es. 2025"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INPUT STATS */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
            1. File Statistiche (Statistiche_Fantacalcio_Stagione_2025_26)
          </label>
          <div className="relative group">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleStatsUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isLoading}
            />
            <div
              className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${playerStats.length > 0 ? "border-emerald-500/50 bg-emerald-500/5" : "border-gray-700 bg-gray-800/40 group-hover:border-emerald-500/30"}`}
            >
              <UploadCloud className={playerStats.length > 0 ? "text-emerald-500" : "text-gray-500"} />
              <span className="text-sm font-bold text-gray-300">
                {playerStats.length > 0 ? `${playerStats.length} Giocatori Caricati` : "Carica Statistiche"}
              </span>
            </div>
          </div>
        </div>

        {/* INPUT ASTA */}
        <div className={`flex flex-col gap-2 ${playerStats.length === 0 ? "opacity-30 pointer-events-none" : ""}`}>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
            2. File Asta (lista_calciatori_lista calciatori_classic_fantacazzen)
          </label>
          <div className="relative group">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleAstaUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${astaLoaded ? "border-blue-500/50 bg-blue-500/5" : "border-gray-700 bg-gray-800/40 group-hover:border-blue-500/30"}`}
            >
              {astaLoaded ? <CheckCircle2 className="text-blue-500" /> : <Database className="text-gray-500" />}
              <span className="text-sm font-bold text-gray-300">
                {astaLoaded ? "Asta Accoppiata" : "Carica Dati Asta"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIEPILOGO / LOG IMPORT */}
      {importLog.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 text-yellow-500 font-black uppercase text-xs tracking-widest">
            <AlertTriangle className="w-4 h-4" />
            Riepilogo — {importLog.length} valori non risolti
          </div>
          {importLog.map((entry, i) => (
            <p key={i} className="text-[11px] text-gray-400">
              <span className="text-gray-300 font-bold">{entry.giocatore}</span>
              {entry.tipo === "squadra"
                ? ` → squadra "${entry.valoreNonTrovato}" non trovata (stagione ${stagione}), id_squadra impostato a null`
                : ` → fanta squadra "${entry.valoreNonTrovato}" non trovata, id_fanta_squadra impostato a null`}
            </p>
          ))}
        </div>
      )}

      {playerStats.length > 0 && (
        <button
          onClick={() => handleSaveToDB()}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Database className="w-5 h-5" />
          Sincronizza {playerStats.length} Giocatori su Supabase
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
            <div className="flex justify-between w-full mb-1">
              <span className="text-emerald-500 font-black italic uppercase tracking-widest text-xs">
                Sincronizzazione
              </span>
              <span className="text-emerald-500 font-black text-sm">{uploadProgress}%</span>
            </div>
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