import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { StatisticheGiocatore } from '../../types/GiocatoreTypes';
import { addStatisticheFromData } from '../../api/ApiService';

export const ERStatistiche: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [playerStats, setPlayerStats] = useState<StatisticheGiocatore[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
        // Trova riga con intestazioni valide
        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row[0]?.toString().toLowerCase().includes('id') && row.includes('Nome') && row.includes('Squadra')) {
            headerRowIndex = i;
            break;
          }
        }
  
        if (headerRowIndex === -1) {
          throw new Error('Intestazione non trovata');
        }
  
        const headers = jsonData[headerRowIndex];
        const rows = jsonData.slice(headerRowIndex + 1);
  
        const colIndex = (colName: string) =>
          headers.findIndex((h) => h?.toString().trim() === colName);
  
        const mapped: StatisticheGiocatore[] = rows
          .filter((r) => r.length > 0 && r[0]) // Evita righe vuote
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
          }));
  
        setPlayerStats(mapped);
        console.log(mapped);
      } catch (err) {
        console.error('Errore nella lettura del file Excel:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    reader.readAsArrayBuffer(file);
  };
  

  function aggiungiGiocatoriDB(): void {
    addStatisticheFromData(playerStats);
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto bg-white border rounded-xl shadow">
      <h2 className="text-xl font-semibold text-gray-800">📊 Carica Statistiche</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          className="bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-emerald-600 transition cursor-pointer"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </div>

      {playerStats.length > 0 && (
        <button
          onClick={aggiungiGiocatoriDB}
          className="self-start bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          ✅ Aggiungi {playerStats.length} giocatori al DB
        </button>
      )}

      {isLoading && <p className="text-gray-500">Caricamento in corso...</p>}
    </div>
  );
};
